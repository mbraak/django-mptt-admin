from django.contrib.auth.models import AnonymousUser, User
from django.contrib.sessions.backends.db import SessionStore
from django.http import HttpResponse
from django.test import RequestFactory, TestCase, override_settings

from ..middleware import AutoLoginMiddleware


class AutoLoginMiddlewareTestCase(TestCase):
    def setUp(self):
        super().setUp()

        self.middleware = AutoLoginMiddleware(lambda request: HttpResponse("ok"))

    def create_request(self, user=None):
        request = RequestFactory().get("/")
        request.session = SessionStore()
        request.user = user or AnonymousUser()
        return request

    @override_settings(DEBUG=True)
    def test_creates_and_logs_in_superuser(self):
        self.assertFalse(User.objects.filter(username="admin").exists())

        request = self.create_request()
        response = self.middleware(request)

        self.assertEqual(response.content, b"ok")

        user = User.objects.get(username="admin")
        self.assertTrue(user.is_superuser)
        self.assertEqual(request.user, user)
        self.assertEqual(request.session["_auth_user_id"], str(user.pk))

    @override_settings(DEBUG=True)
    def test_logs_in_existing_admin_user(self):
        user = User.objects.create_superuser("admin", "admin@example.com", "password")

        request = self.create_request()
        self.middleware(request)

        self.assertEqual(User.objects.filter(username="admin").count(), 1)
        self.assertEqual(request.user, user)
        self.assertEqual(request.session["_auth_user_id"], str(user.pk))

    @override_settings(DEBUG=True)
    def test_keeps_authenticated_user(self):
        user = User.objects.create_user("other", "other@example.com", "password")

        request = self.create_request(user)
        self.middleware(request)

        self.assertEqual(request.user, user)
        self.assertFalse(User.objects.filter(username="admin").exists())
        self.assertNotIn("_auth_user_id", request.session)

    @override_settings(DEBUG=False)
    def test_does_nothing_when_debug_is_off(self):
        request = self.create_request()
        response = self.middleware(request)

        self.assertEqual(response.content, b"ok")
        self.assertFalse(request.user.is_authenticated)
        self.assertFalse(User.objects.filter(username="admin").exists())
        self.assertNotIn("_auth_user_id", request.session)

    @override_settings(DEBUG=True)
    def test_admin_is_accessible_without_login(self):
        response = self.client.get("/django_mptt_example/country/")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(User.objects.filter(username="admin", is_superuser=True).exists())

    @override_settings(DEBUG=False)
    def test_admin_requires_login_when_debug_is_off(self):
        response = self.client.get("/django_mptt_example/country/")

        self.assertEqual(response.status_code, 302)
        self.assertIn("login", response["Location"])
