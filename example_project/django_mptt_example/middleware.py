from django.conf import settings
from django.contrib.auth import login
from django.contrib.auth.models import User


class AutoLoginMiddleware:
    """
    Log in as a superuser automatically, so the example project can be used without the admin login.

    Only active when DEBUG is on. The test runner turns DEBUG off, so the tests still use the real login.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if settings.DEBUG and not request.user.is_authenticated:
            user = User.objects.filter(username="admin").first()

            if not user:
                user = User.objects.create_superuser("admin", None, None)

            login(request, user, backend="django.contrib.auth.backends.ModelBackend")

        return self.get_response(request)
