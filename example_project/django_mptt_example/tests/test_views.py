from unittest import mock

from django.contrib import admin
from django.contrib.admin.options import IS_POPUP_VAR
from django.contrib.auth.models import User
from django.test import RequestFactory, override_settings

from django_mptt_admin.django_mptt_admin_mixin import DjangoMpttAdminMixin

from ..admin import CountryAdmin
from ..models import Country
from .base_view_testcase import BaseViewTestCase
from .utils import get_continents


class MoveTestCase(BaseViewTestCase):
    def test_move_inside(self):
        bouvet_island = Country.objects.get(code="BV")
        oceania = Country.objects.get(name="Oceania")

        self.assertEqual(bouvet_island.parent.name, "Antarctica")

        # - move Bouvet Island under Oceania
        self.move(bouvet_island.id, oceania.id, "inside")

        bouvet_island = Country.objects.get(code="BV")
        self.assertEqual(bouvet_island.parent.name, "Oceania")

    def test_move_before(self):
        self.assertEqual(
            get_continents(),
            "Africa,Antarctica,Asia,Europe,North America,Oceania,South America",
        )

        self.move(
            Country.objects.get(name="Antarctica", level=1).id,
            Country.objects.get(name="Africa").id,
            "before",
        )

        self.assertEqual(
            get_continents(),
            "Antarctica,Africa,Asia,Europe,North America,Oceania,South America",
        )

    def test_move_after(self):
        self.move(
            Country.objects.get(name="Antarctica", level=1).id,
            Country.objects.get(name="Europe").id,
            "after",
        )
        self.assertEqual(
            get_continents(),
            "Africa,Asia,Europe,Antarctica,North America,Oceania,South America",
        )

    def test_move_to_unknown_position(self):
        self.assertRaisesMessage(
            Exception,
            "Unknown position",
            lambda: self.move(
                Country.objects.get(name="Antarctica", level=1).id,
                Country.objects.get(name="Europe").id,
                "unknown",
            ),
        )

    def move(self, source_id, target_id, position):
        countries_page = self.app.get("/django_mptt_example/country/")
        csrf_token = countries_page.forms["changelist-form"]["csrfmiddlewaretoken"].value

        response = self.app.post(
            f"/django_mptt_example/country/{source_id:d}/move/",
            params={
                "csrfmiddlewaretoken": csrf_token,
                "target_id": target_id,
                "position": position,
            },
        )
        self.assertEqual(response.json, {"success": True})


class PopupTestCase(BaseViewTestCase):
    def test_return_grid_view(self):
        grid_page = self.app.get(f"/django_mptt_example/country/?{IS_POPUP_VAR}=true")

        first_row = grid_page.pyquery("#result_list tbody tr").eq(0)
        self.assertEqual(first_row.find("td").eq(0).text(), "Afghanistan")


class PermissionsTestCase(BaseViewTestCase):
    def create_test_user(self):
        User.objects.create_user("admin", "admin@admin.nl", "password", is_staff=True)

    def test_no_superuser(self):
        self.app.get("/django_mptt_example/country/", status=403)


class FilterTestCase(BaseViewTestCase):
    def test_without_filter(self):
        countries_page = self.app.get("/django_mptt_example/country/")

        self.assertEqual(
            countries_page.pyquery("#changelist-filter li a").text(),
            "All Africa Antarctica Asia Europe North America Oceania South America",
        )

    def test_filter(self):
        countries_page = self.app.get("/django_mptt_example/country/?continent=Europe")

        tree_div = countries_page.pyquery("#tree")
        self.assertEqual(
            tree_div.attr("data-url"),
            "/django_mptt_example/country/tree_json/?continent=Europe",
        )

        self.assertEqual(
            tree_div.attr("data-insert_at_url"),
            "/django_mptt_example/country/add/?_changelist_filters=continent%3DEurope",
        )

    def test_filter_and_selected_node(self):
        json_data = self.app.get("/django_mptt_example/country/tree_json/?continent=Europe&selected_node=2").json

        self.assertEqual(len(json_data), 1)
        root = json_data[0]
        self.assertEqual(root["name"], "Europe")
        self.assertEqual(len(root["children"]), 50)

        country_node = root["children"][0]

        expected_changelist_filters = "continent%3D%255B%2527Europe%2527%255D"
        node_id = country_node["id"]

        self.assertEqual(
            country_node["url"],
            f"/django_mptt_example/country/{node_id}/change/?_changelist_filters={expected_changelist_filters}",
        )

    def test_urls(self):
        countries_page = self.app.get("/django_mptt_example/country/?continent=Europe")

        object_tool_buttons = countries_page.pyquery(".object-tools a")
        self.assertEqual(len(object_tool_buttons), 2)

        self.assertEqual(
            object_tool_buttons.eq(0).attr("href"),
            "/django_mptt_example/country/add/?_changelist_filters=continent%3DEurope",
        )
        self.assertEqual(
            object_tool_buttons.eq(1).attr("href"),
            "/django_mptt_example/country/grid/?continent=Europe",
        )

    def test_grid_view(self):
        grid_page = self.app.get("/django_mptt_example/country/grid/?continent=Europe")

        object_tool_buttons = grid_page.pyquery(".object-tools a")
        self.assertEqual(len(object_tool_buttons), 2)

        self.assertEqual(
            object_tool_buttons.eq(0).attr("href"),
            "/django_mptt_example/country/add/?_changelist_filters=continent%3DEurope",
        )
        self.assertEqual(
            object_tool_buttons.eq(1).attr("href"),
            "/django_mptt_example/country/?continent=Europe",
        )


class InsertAtTestCase(BaseViewTestCase):
    def test_insert_at_sets_the_parent(self):
        europe = Country.objects.get(name="Europe")

        add_page = self.app.get(f"/django_mptt_example/country/add/?insert_at={europe.id}")

        self.assertEqual(add_page.forms["country_form"]["parent"].value, str(europe.id))

    def test_without_insert_at(self):
        add_page = self.app.get("/django_mptt_example/country/add/")

        self.assertEqual(add_page.forms["country_form"]["parent"].value, "")

    def test_add_child_with_insert_at(self):
        europe = Country.objects.get(name="Europe")

        add_page = self.app.get(f"/django_mptt_example/country/add/?insert_at={europe.id}")
        form = add_page.forms["country_form"]
        form["name"] = "Atlantis"
        form.submit().follow()

        self.assertEqual(Country.objects.get(name="Atlantis").parent, europe)


class TriggerSaveAfterMoveTestCase(BaseViewTestCase):
    def test_trigger_save_after_move(self):
        def count_saves_during_move(code, target_name):
            moved_country = Country.objects.get(code=code)
            target = Country.objects.get(name=target_name)

            with mock.patch.object(Country, "save", autospec=True, side_effect=Country.save) as save:
                MoveTestCase.move(self, moved_country.id, target.id, "inside")

            return save

        # mptt's move_to saves the node itself
        save_without_trigger = count_saves_during_move("BV", "Oceania")

        with mock.patch.object(CountryAdmin, "trigger_save_after_move", True):
            save_with_trigger = count_saves_during_move("NL", "Oceania")

        self.assertEqual(save_with_trigger.call_count, save_without_trigger.call_count + 1)

        saved_instance = save_with_trigger.call_args.args[0]
        self.assertEqual(saved_instance.code, "NL")
        self.assertEqual(saved_instance.parent.name, "Oceania")


class LoadOnDemandTestCase(BaseViewTestCase):
    def test_tree_json(self):
        json_data = self.app.get("/django_mptt_example/country/tree_json/").json

        [root] = json_data
        self.assertEqual(root["name"], "root")
        self.assertEqual(
            [continent["name"] for continent in root["children"]],
            ["Africa", "Antarctica", "Asia", "Europe", "North America", "Oceania", "South America"],
        )

        # The countries are not loaded; they are loaded on demand
        europe = root["children"][3]
        self.assertTrue(europe["load_on_demand"])
        self.assertNotIn("children", europe)

    def test_tree_json_for_node(self):
        europe = Country.objects.get(name="Europe")

        json_data = self.app.get(f"/django_mptt_example/country/tree_json/?node={europe.id}").json

        self.assertEqual(
            [country["id"] for country in json_data],
            list(europe.get_children().values_list("id", flat=True)),
        )
        self.assertEqual(len(json_data), 50)
        self.assertNotIn("load_on_demand", json_data[0])

    def test_tree_json_for_root_node(self):
        root = Country.objects.get(name="root")

        json_data = self.app.get(f"/django_mptt_example/country/tree_json/?node={root.id}").json

        self.assertEqual(len(json_data), 7)
        self.assertTrue(all(continent["load_on_demand"] for continent in json_data))


class TreeMouseDelayTestCase(BaseViewTestCase):
    def get_mouse_delay_attribute(self):
        countries_page = self.app.get("/django_mptt_example/country/")
        return countries_page.pyquery("#tree").attr("data-tree-mouse-delay")

    @override_settings(DJANGO_TESTING=True)
    def test_example_mouse_delay(self):
        # The example admin disables the delay for the playwright tests
        self.assertEqual(self.get_mouse_delay_attribute(), "0")

    @mock.patch.object(CountryAdmin, "get_tree_mouse_delay", DjangoMpttAdminMixin.get_tree_mouse_delay)
    def test_default_mouse_delay(self):
        self.assertIsNone(self.get_mouse_delay_attribute())

    @mock.patch.object(CountryAdmin, "get_tree_mouse_delay", DjangoMpttAdminMixin.get_tree_mouse_delay)
    @mock.patch.object(CountryAdmin, "tree_mouse_delay", 200)
    def test_tree_mouse_delay_attribute(self):
        self.assertEqual(self.get_mouse_delay_attribute(), "200")


class MoveViewErrorsTestCase(BaseViewTestCase):
    # The move requests in these tests don't need a csrf token
    csrf_checks = False

    def move_url(self):
        return f"/django_mptt_example/country/{Country.objects.get(code='BV').id:d}/move/"

    def test_move_without_change_permission(self):
        User.objects.filter(username="admin").update(is_superuser=False)

        self.app.post(
            self.move_url(),
            params={"target_id": Country.objects.get(name="Oceania").id, "position": "inside"},
            status=403,
        )

        self.assertEqual(Country.objects.get(code="BV").parent.name, "Antarctica")

    def test_move_with_get(self):
        with self.assertLogs("django.security.SuspiciousOperation", level="ERROR"):
            self.app.get(self.move_url(), status=400)

        self.assertEqual(Country.objects.get(code="BV").parent.name, "Antarctica")


class CsrfCookieNameTestCase(BaseViewTestCase):
    def get_csrf_cookie_name_attribute(self):
        countries_page = self.app.get("/django_mptt_example/country/")
        return countries_page.pyquery("#tree").attr("data-csrf-cookie-name")

    def test_csrf_cookie_name(self):
        self.assertEqual(self.get_csrf_cookie_name_attribute(), "csrftoken")

    @override_settings(CSRF_COOKIE_NAME="custom_csrf")
    def test_custom_csrf_cookie_name(self):
        self.assertEqual(self.get_csrf_cookie_name_attribute(), "custom_csrf")

    @override_settings(CSRF_USE_SESSIONS=True)
    def test_csrf_use_sessions(self):
        # The csrf token is stored in the session, so there is no cookie
        self.assertEqual(self.get_csrf_cookie_name_attribute(), "")


class GridViewTestCase(BaseViewTestCase):
    def test_extra_context(self):
        request = RequestFactory().get("/django_mptt_example/country/grid/")
        request.user = User.objects.get(username="admin")

        response = admin.site.get_model_admin(Country).grid_view(request, extra_context={"extra": "value"})

        self.assertEqual(response.context_data["extra"], "value")
        self.assertEqual(response.context_data["tree_url"], "/django_mptt_example/country/")

    @mock.patch.object(CountryAdmin, "preserve_filters", False)
    def test_without_preserve_filters(self):
        grid_page = self.app.get("/django_mptt_example/country/grid/?continent=Europe")

        object_tool_buttons = grid_page.pyquery(".object-tools a")
        self.assertEqual(object_tool_buttons.eq(0).attr("href"), "/django_mptt_example/country/add/")
        self.assertEqual(object_tool_buttons.eq(1).attr("href"), "/django_mptt_example/country/")
