from django.conf import settings
from django.test import LiveServerTestCase
from .playwright_page import PlaywrightPage


class BasePlaywrightTestCase(LiveServerTestCase):
    def setUp(self):
        super().setUp()

        self.page = PlaywrightPage(self.live_server_url)
        self.setup_page()

    def tearDown(self):
        try:
            if getattr(settings, "DJANGO_MPTT_ADMIN_COVERAGE_JS", False):
                self.page.save_coverage()

            self.page.close()
        finally:
            super().tearDown()

    def setup_page(self):
        self.page.login("admin", "password")
