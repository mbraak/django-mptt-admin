from .base_live_testcase import BaseLiveTestCase
from .utils import read_testdata


class LiveTestCase(BaseLiveTestCase):
    def setUp(self):
        super().setUp()

        read_testdata()
        self.page.visit_countries_page()

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

    def test_add(self):
        page = self.page

        page.add_node('Oceania')

        page.find_input('code').send_keys('TST')
        page.find_input('name').send_keys('**Test**')
        page.save_form()

        page.open_node('Oceania')
        page.find_title_element('**Test**')
