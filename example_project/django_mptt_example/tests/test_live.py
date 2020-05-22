from django.contrib.auth.models import User

from .base_live_testcase import BaseLiveTestCase
from .utils import read_testdata
from .page import Page


class LiveTestCase(BaseLiveTestCase):
    USERNAME = 'admin'
    PASSWORD = 'p'

    def setUp(self):
        super(LiveTestCase, self).setUp()

        User.objects.create_superuser(self.USERNAME, 'admin@admin.com', self.PASSWORD)

        read_testdata()

        page = Page(live_server_url=self.live_server_url, selenium=self.selenium)

        page.login(self.USERNAME, self.PASSWORD)
        page.visit_countries_page()

        self.page = page

    def test_show_tree(self):
        self.assertEqual(
            self.page.node_titles(),
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

        page.toggle_node('Oceania')
        page.assert_page_contains_text('Tuvalu')
