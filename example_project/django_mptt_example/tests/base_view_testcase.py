from django_webtest import WebTest
from django.contrib.auth.models import User

from .utils import read_testdata


class BaseViewTestCase(WebTest):
    def create_test_user(self):
        User.objects.create_superuser('admin', 'admin@admin.com', 'password')

    def setUp(self):
        super().setUp()

        self.create_test_user()
        self.login()

        read_testdata()

    def login(self):
        login_page = self.app.get('/login/')
        form = login_page.form

        form['username'] = 'admin'
        form['password'] = 'password'

        form.submit()

        response = self.app.get('/')
        self.assertEqual(response.context['user'].username, 'admin')
