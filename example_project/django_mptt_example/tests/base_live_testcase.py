from django.contrib.contenttypes.models import ContentType
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
import django
from selenium.webdriver.firefox.webdriver import WebDriver
from selenium.webdriver.firefox.options import Options


class BaseLiveTestCase(StaticLiveServerTestCase):
    def _post_teardown(self):
        if django.VERSION < (2, 2):
            ContentType.objects.clear_cache()

        super()._post_teardown()

    def setUp(self):
        super().setUp()

        options = Options()
        options.headless = True

        self.selenium = WebDriver(options=options)
        self.selenium.implicitly_wait(10)

    def tearDown(self):
        self.selenium.quit()
        self.selenium.command_executor._conn.clear()

        super().tearDown()
