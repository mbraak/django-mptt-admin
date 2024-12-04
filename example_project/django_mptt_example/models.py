from django.db import models
from django.utils.html import format_html

from mptt.models import TreeForeignKey, MPTTModel


class Country(MPTTModel):
    class Meta:
        verbose_name_plural = "countries"
        app_label = "django_mptt_example"

    code = models.CharField(max_length=2, blank=True, null=True)
    name = models.CharField(max_length=50, blank=True, null=True)
    parent = TreeForeignKey(
        "self", null=True, blank=True, related_name="children", on_delete=models.CASCADE
    )

    def __str__(self):
        return self.name or self.code or ""

    # Return the code if there is one, otherwise the name.
    @property
    def code_or_name(self):
        return self.code or self.name

    # Return the code and the name. Contains html.
    # * Return only the name for continents.
    @property
    def html_code_and_name(self):
        if self.code:
            return format_html("<strong>{}</strong> {}", self.code, self.name)
        else:
            return format_html("<strong>{}</strong>", self.name)
