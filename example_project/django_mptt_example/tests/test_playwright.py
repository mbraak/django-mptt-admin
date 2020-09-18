from .base_playwright_testcase import BasePlaywrightTestCase


class PlaywrightTestCase(BasePlaywrightTestCase):
    fixtures = ['countries.json']

    def setUp(self):
        super().setUp()

        self.page.visit_countries_page()

    def test_display_tree(self):
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
        self.assertEqual(page.selected_node().textContent(), 'Antarctica')

    def test_open_node(self):
        page = self.page

        page.open_node('Oceania')
        page.find_title_element('Tuvalu')

    def test_grid_view(self):
        page = self.page

        page.grid_view()
        page.tree_view()
