from json import dumps
from pathlib import Path

from django.core import serializers


def read_testdata():
    fixture_filename = Path(__file__).parent.joinpath('testdata').joinpath('countries.json')

    with fixture_filename.open() as f:
        for obj in serializers.deserialize("json", f.read()):
            obj.save()


def remove_directory(string):
    path = Path(string)

    if not path.exists():
        return

    for file in path.iterdir():
        file.unlink()

    path.rmdir()


def clean_directory(string):
    remove_directory(string)

    Path(string).mkdir()


def write_json(path, data):
    json = dumps(data)

    Path(path).write_text(json)
