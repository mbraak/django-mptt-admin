from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium.webdriver.firefox.webdriver import WebDriver
from selenium.webdriver.firefox.options import Options


class BaseLiveTestCase(StaticLiveServerTestCase):
    def setUp(self):
        super().setUp()

        options = Options()
        options.headless = True

        self.selenium = WebDriver(options=options)
        self.selenium.implicitly_wait(10)

    def tearDown(self):
        self.selenium.quit()

        super().tearDown()
