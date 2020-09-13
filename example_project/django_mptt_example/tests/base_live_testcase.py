from uuid import uuid4
from selenium.webdriver.firefox.webdriver import WebDriver
from selenium.webdriver.firefox.options import Options
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from django.conf import settings
from django.contrib.auth.models import User

from .utils import clean_directory, write_json
from .page import Page


class BaseLiveTestCase(StaticLiveServerTestCase):
    USERNAME = 'admin'
    PASSWORD = 'p'

    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        if settings.DJANGO_MPTT_ADMIN_COVERAGE_JS:
            clean_directory('js_coverage')

    def setUp(self):
        super().setUp()

        self.init_selenium()
        self.setup_page()

    def tearDown(self):
        try:
            if settings.DJANGO_MPTT_ADMIN_COVERAGE_JS:
                self.save_coverage()

            self.deinit_selenium()
        finally:
            super().tearDown()

    def init_selenium(self):
        options = Options()
        options.headless = True

        self.selenium = WebDriver(options=options)
        self.selenium.implicitly_wait(10)

    def deinit_selenium(self):
        self.selenium.quit()
        self.selenium.command_executor._conn.clear()

    def save_coverage(self):
        coverage = self.selenium.execute_script('return window.__coverage__')

        filename = uuid4().hex
        write_json(f'js_coverage/{filename}.json', coverage)

    def setup_page(self):
        User.objects.create_superuser(self.USERNAME, 'admin@admin.com', self.PASSWORD)
        page = Page(live_server_url=self.live_server_url, selenium=self.selenium)
        page.login(self.USERNAME, self.PASSWORD)

        self.page = page
