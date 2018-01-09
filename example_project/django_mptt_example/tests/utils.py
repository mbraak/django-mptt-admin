import os

from django.core import serializers


def read_testdata():
    fixture_filename = os.path.join(os.path.dirname(__file__), 'testdata/countries.json')

    with open(fixture_filename) as f:
        for obj in serializers.deserialize("json", f.read()):
            obj.save()
