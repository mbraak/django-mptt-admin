from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium.webdriver.firefox.webdriver import WebDriver
from selenium.webdriver.firefox.options import Options


class BaseLiveTestCase(StaticLiveServerTestCase):
    selenium = None

    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        options = Options()
        options.headless = True

        cls.selenium = WebDriver(options=options)
        cls.selenium.implicitly_wait(10)

    @classmethod
    def tearDownClass(cls):
        cls.selenium.quit()
        super().tearDownClass()
