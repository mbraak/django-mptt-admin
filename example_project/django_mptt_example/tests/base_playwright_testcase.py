from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from django.contrib.auth.models import User
from django.conf import settings
from .playwright_page import PlaywrightPage


class BasePlaywrightTestCase(StaticLiveServerTestCase):
    def setUp(self):
        super().setUp()

        User.objects.create_superuser("admin", "admin@admin.com", "password")

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
