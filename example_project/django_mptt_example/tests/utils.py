import os

import django
from django.core import serializers


short_django_version = django.VERSION[0:2]

def read_testdata():
    fixture_filename = os.path.join(os.path.dirname(__file__), 'testdata/countries.json')

    with open(fixture_filename) as f:
        for obj in serializers.deserialize("json", f.read()):
            obj.save()
