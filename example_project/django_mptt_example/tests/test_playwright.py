from .base_playwright_testcase import BasePlaywrightTestCase


class PlaywrightTestCase(BasePlaywrightTestCase):
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
