from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from django.contrib.auth.models import User
from .playwright_page import PlaywrightPage
from .utils import read_testdata


class BasePlaywrightTestCase(StaticLiveServerTestCase):
    def setUp(self):
        super().setUp()

        User.objects.create_superuser('admin', 'admin@admin.com', 'password')
        read_testdata()

        self.page = PlaywrightPage(self.live_server_url)
        self.setup_page()

    def tearDown(self):
        try:
            self.page.close()
        finally:
            super().tearDown()

    def setup_page(self):
        self.page.login('admin', 'password')
