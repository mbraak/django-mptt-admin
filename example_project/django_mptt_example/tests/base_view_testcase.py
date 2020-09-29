from django_webtest import WebTest
from django.contrib.auth.models import User


class BaseViewTestCase(WebTest):
    fixtures = ["countries.json"]

    def create_test_user(self):
        User.objects.create_superuser("admin", "admin@admin.com", "password")

    def setUp(self):
        super().setUp()

        self.create_test_user()
        self.login()

    def login(self):
        login_page = self.app.get("/login/")
        form = login_page.form

        form["username"] = "admin"
        form["password"] = "password"

        form.submit()

        response = self.app.get("/")
        self.assertEqual(response.context["user"].username, "admin")
