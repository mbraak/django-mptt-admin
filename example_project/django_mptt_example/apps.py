import mptt

from django.apps import AppConfig

from .models import Country


class ExampleConfig(AppConfig):
    name = 'django_mptt_example'

    def ready(self):
        mptt.register(Country)
