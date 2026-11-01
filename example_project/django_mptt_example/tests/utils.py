from ..models import Country


def get_continents():
    return ",".join(c.name for c in Country.objects.filter(level=1).order_by("lft"))
