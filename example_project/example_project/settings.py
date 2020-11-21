import sys
import os

from pathlib import Path


BASE_DIR = Path(__file__).parent.parent.resolve()

sys.path.append(str(BASE_DIR.parent))

DEBUG = True

DATABASES = dict(
    default=dict(
        ENGINE="django.db.backends.postgresql",
        NAME="django-mptt-admin-example",
        USER="postgres",
        PASSWORD=os.environ.get("POSTGRES_PASSWORD", ""),
        HOST=os.environ.get("POSTGRES_HOST", ""),
        PORT=os.environ.get("POSTGRES_PORT", ""),
    )
)


INSTALLED_APPS = [
    # Project app
    "django_mptt_example",
    # Generic apps
    "mptt",
    "django_mptt_admin",
    # Django
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.admin",
]


MIDDLEWARE = [
    "django.middleware.common.CommonMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
]

STATIC_URL = "/static/"
ROOT_URLCONF = "example_project.urls"

STATIC_ROOT = str(BASE_DIR.joinpath("static"))

SECRET_KEY = "test_key"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "APP_DIRS": True,
        "OPTIONS": {
            "debug": DEBUG,
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.template.context_processors.debug",
                "django.template.context_processors.i18n",
                "django.template.context_processors.media",
                "django.template.context_processors.static",
                "django.template.context_processors.tz",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

ALLOWED_HOSTS = ["*"]

if "COVERAGE" in os.environ:
    DJANGO_MPTT_ADMIN_COVERAGE_JS = True
