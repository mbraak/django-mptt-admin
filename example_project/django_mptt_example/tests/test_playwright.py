from django.test import override_settings
from django.contrib.auth.models import Permission, User

from ..models import Country
from .base_playwright_testcase import BasePlaywrightTestCase


@override_settings(DJANGO_TESTING=True)
class PlaywrightTestCase(BasePlaywrightTestCase):
    fixtures = ["countries.json"]

    def setUp(self):
        User.objects.create_superuser("admin", "admin@admin.com", "password")
        super().setUp()
        self.page.visit_countries_page()

    def test_display_tree(self):
        page = self.page

        page.find_title_element("Oceania")

        self.assertEqual(
            page.node_titles(),
            [
                "root",
                "Africa",
                "Antarctica",
                "Asia",
                "Europe",
                "North America",
                "Oceania",
                "South America",
            ],
        )

        self.assertEqual(self.page.page.get_by_text("(add)").count(), 8)

    def test_select_node(self):
        page = self.page

        page.select_node("Asia")
        self.assertEqual(page.selected_node().text_content(), "Asia")
        self.assertEqual(
            page.find_edit_link("Asia", "(edit)").get_attribute("tabindex"), "0"
        )

        page.select_node("Europe")
        self.assertEqual(page.selected_node().text_content(), "Europe")
        self.assertEqual(
            page.find_edit_link("Asia", "(edit)").get_attribute("tabindex"), "-1"
        )

    def test_open_node(self):
        page = self.page

        page.open_node("Oceania")
        page.find_title_element("Tuvalu")

    def test_grid_view(self):
        page = self.page

        page.grid_view()
        page.tree_view()

    def test_save_state(self):
        page = self.page

        page.open_node("Oceania")
        page.select_node("Tuvalu")

        page.grid_view()
        page.tree_view()

        page.wait_for_node("Tuvalu")
        self.assertEqual(page.selected_node().text_content(), "Tuvalu")

    def test_edit(self):
        page = self.page

        page.edit_node("Oceania")
        name_input = page.find_input("name")
        self.assertEqual(name_input.get_attribute("value"), "Oceania")

        name_input.fill("**Oceania**")
        page.save_form()

        page.wait_for_node("**Oceania**")
        page.find_node_element("**Oceania**")

    def test_add(self):
        page = self.page

        page.add_node("Oceania")

        page.find_input("code").fill("TST")
        page.find_input("name").fill("**Test**")
        page.save_form()

        page.wait_for_node("Oceania")
        page.open_node("Oceania")

        page.wait_for_node("**Test**")
        page.find_node_element("**Test**")

    def test_move_node(self):
        page = self.page

        page.open_node("Asia")
        page.close_node("Asia")

        with page.page.expect_response("**/move/"):
            page.drag_and_drop("Africa", "Asia")

        self.assertEqual(
            page.node_titles()[:5],
            [
                "root",
                "Antarctica",
                "Asia",
                "Africa",
                "Afghanistan",
            ],
        )

    def test_move_node_error(self):
        page = self.page

        page.open_node("Asia")
        page.close_node("Asia")

        page.abort_requests()

        page.drag_and_drop("Africa", "Asia")
        page.wait_for_text("move failed")

    def test_load_error(self):
        page = self.page
        page.abort_requests()

        page.toggle_node("Asia")
        page.wait_for_text("Error while loading the data from the server")


@override_settings(DJANGO_TESTING=True)
class PlaywrightReadonlyTestCase(BasePlaywrightTestCase):
    fixtures = ["countries.json"]

    def setUp(self):
        user = User.objects.create_user(
            "admin", "admin@admin.com", "password", is_staff=True
        )

        user.user_permissions.add(Permission.objects.get(codename="view_country"))
        user.save()

        super().setUp()
        self.page.visit_countries_page(expected_text="Select country to view")

    def test_display_tree(self):
        page = self.page

        page.find_edit_link("Asia", "(view)")
        self.assertEqual(self.page.page.get_by_text("(add)").count(), 0)
