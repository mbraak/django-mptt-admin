import sys

from pathlib import Path

from django.conf import global_settings


BASE_DIR = Path(__file__).parent.parent.resolve()

sys.path.append(str(BASE_DIR.parent))

DEBUG = True

DATABASES = dict(
    default=dict(
        ENGINE='django.db.backends.sqlite3',
        NAME='example.db',
        USER='',
        PASSWORD='',
        HOST='',
        PORT='',
    )
)


INSTALLED_APPS = [
    # Project app
    'django_mptt_example',

    # Generic apps
    'mptt',
    'django_mptt_admin',

    # Django
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
]

MIDDLEWARE_CLASSES = list(global_settings.MIDDLEWARE_CLASSES)

session_middleware = 'django.contrib.sessions.middleware.SessionMiddleware'

if session_middleware not in MIDDLEWARE_CLASSES:
    MIDDLEWARE_CLASSES.append(session_middleware)

authentication_middleware = 'django.contrib.auth.middleware.AuthenticationMiddleware'

if authentication_middleware not in MIDDLEWARE_CLASSES:
    MIDDLEWARE_CLASSES.append(authentication_middleware)

STATIC_URL = '/static/'
ROOT_URLCONF = 'example_project.urls'

STATIC_ROOT = str(BASE_DIR.joinpath('static'))

SECRET_KEY = 'secret'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'APP_DIRS': True,
        'OPTIONS': {
            'debug': DEBUG,
            'context_processors': [
                "django.contrib.auth.context_processors.auth",
                "django.template.context_processors.debug",
                "django.template.context_processors.i18n",
                "django.template.context_processors.media",
                "django.template.context_processors.static",
                "django.template.context_processors.tz",
                "django.contrib.messages.context_processors.messages"
            ]
        }
    },
]
