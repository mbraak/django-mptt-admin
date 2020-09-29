from django.contrib.admin.options import IS_POPUP_VAR
from django.contrib.auth.models import User

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
        csrf_token = countries_page.form["csrfmiddlewaretoken"].value

        response = self.app.post(
            "/django_mptt_example/country/{0:d}/move/".format(source_id),
            params=dict(
                csrfmiddlewaretoken=csrf_token,
                target_id=target_id,
                position=position,
            ),
        )
        self.assertEqual(response.json, dict(success=True))


class PopupTestCase(BaseViewTestCase):
    def test_return_grid_view(self):
        grid_page = self.app.get(
            "/django_mptt_example/country/?{0!s}=true".format(IS_POPUP_VAR)
        )

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
        json_data = self.app.get(
            "/django_mptt_example/country/tree_json/?continent=Europe&selected_node=2"
        ).json

        self.assertEqual(len(json_data), 1)
        root = json_data[0]
        self.assertEqual(root["name"], "Europe")
        self.assertEqual(len(root["children"]), 50)

        country_node = root["children"][0]

        self.assertEqual(
            country_node["url"],
            "/django_mptt_example/country/{0!s}/change/?_changelist_filters=continent%3DEurope".format(
                country_node["id"]
            ),
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
