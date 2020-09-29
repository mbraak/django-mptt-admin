from json import dumps
from pathlib import Path
from time import sleep

from ..models import Country


def remove_directory(string):  # pragma: no cover
    path = Path(string)

    if not path.exists():
        return

    for file in path.iterdir():
        file.unlink()

    path.rmdir()


def write_json(path, data):
    json = dumps(data)

    Path(path).write_text(json)


def get_continents():
    return ",".join(c.name for c in Country.objects.filter(level=1).order_by("lft"))


def wait_until(fn):  # pragma: no cover
    for i in range(100):
        if fn():
            return
        sleep(0.1)

    assert False
