from django.conf import settings
from django.contrib.auth.models import User
from django.test import LiveServerTestCase

from .playwright_page import PlaywrightPage


class BasePlaywrightTestCase(LiveServerTestCase):
    def setUp(self):
        super().setUp()

        # Create the session before starting Playwright; Django refuses database calls while its event loop runs
        self.client.force_login(User.objects.get(username="admin"))

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
        session_cookie_name = settings.SESSION_COOKIE_NAME
        self.page.add_cookie(session_cookie_name, self.client.cookies[session_cookie_name].value)
