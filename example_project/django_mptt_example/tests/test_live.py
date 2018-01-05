from django.contrib.auth.models import User
from django.contrib.staticfiles.testing import StaticLiveServerTestCase

from selenium.webdriver.firefox.webdriver import WebDriver
from selenium.webdriver.firefox.options import Options

from .utils import read_testdata


class LiveTestCase(StaticLiveServerTestCase):
    USERNAME = 'admin'
    PASSWORD = 'p'

    selenium = None

    @classmethod
    def setUpClass(cls):
        super(LiveTestCase, cls).setUpClass()

        options = Options()
        options.set_headless()

        cls.selenium = WebDriver(options=options)
        cls.selenium.implicitly_wait(10)

    @classmethod
    def tearDownClass(cls):
        cls.selenium.quit()
        super(LiveTestCase, cls).tearDownClass()

    def login(self):
        selenium = self.selenium

        selenium.get('%s%s' % (self.live_server_url, '/login/'))

        selenium.find_element_by_name('username').send_keys(self.USERNAME)
        selenium.find_element_by_name('password').send_keys(self.PASSWORD)
        selenium.find_element_by_xpath('//input[@value="Log in"]').click()

    def visit_countries_page(self):
        selenium = self.selenium

        selenium.get(self.live_server_url)
        selenium.find_element_by_link_text('Countries').click()

    def setUp(self):
        super(LiveTestCase, self).setUp()

        User.objects.create_superuser(self.USERNAME, 'admin@admin.com', self.PASSWORD)

        read_testdata()

        self.login()
        self.visit_countries_page()

    def test_show_tree(self):
        selenium = self.selenium

        self.assertEqual(
            len(selenium.find_elements_by_class_name('jqtree-title')),
            8
        )

    def test_select_node(self):
        selenium = self.selenium

        selenium.find_element_by_xpath("//span[contains(text(), 'Europe')]").click()

        self.assertTrue(
            selenium.find_element_by_class_name('jqtree-selected').text.startswith('Europe'),
        )
