from django.contrib.auth.models import User

from .base_live_testcase import BaseLiveTestCase
from .utils import read_testdata
from .page import Page


class LiveTestCase(BaseLiveTestCase):
    USERNAME = 'admin'
    PASSWORD = 'p'

    def setUp(self):
        super().setUp()

        User.objects.create_superuser(self.USERNAME, 'admin@admin.com', self.PASSWORD)

        read_testdata()

        page = Page(live_server_url=self.live_server_url, selenium=self.selenium)

        page.login(self.USERNAME, self.PASSWORD)
        page.visit_countries_page()

        self.page = page

    def test_show_tree(self):
        page = self.page

        page.find_title_element('Oceania')

        self.assertEqual(
            page.node_titles(),
            [
                'root',
                'Africa',
                'Antarctica',
                'Asia',
                'Europe',
                'North America',
                'Oceania',
                'South America'
            ]
        )

    def test_select_node(self):
        page = self.page

        page.select_node('Antarctica')
        self.assertEqual(page.selected_node().text, 'Antarctica')

    def test_open_node(self):
        page = self.page

        page.open_node('Oceania')
        page.assert_page_contains_text('Tuvalu')

    def test_grid_view(self):
        page = self.page

        page.grid_view()
        page.tree_view()

    def test_save_state(self):
        page = self.page

        page.open_node('Oceania')
        page.select_node('Tuvalu')

        page.grid_view()
        page.tree_view()

        page.assert_page_contains_text('Tuvalu')
        self.assertEqual(page.selected_node().text, 'Tuvalu')

        self.assertEqual(page.open_nodes(), ['root', 'Oceania'])

    def test_edit(self):
        page = self.page

        page.edit_node('Oceania')
        name_input = page.find_input('name')
        self.assertEqual(name_input.get_attribute('value'), 'Oceania')

        name_input.clear()
        name_input.send_keys('**Oceania**')
        page.save_form()

        page.find_title_element('**Oceania**')
