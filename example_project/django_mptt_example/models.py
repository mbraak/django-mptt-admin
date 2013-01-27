from django.db import models

from mptt.models import MPTTModel, TreeForeignKey


class Country(MPTTModel):
    class Meta:
        verbose_name_plural = 'countries'

    code = models.CharField(max_length=2, blank=True, null=True)
    name = models.CharField(max_length=50, blank=True, null=True)
    parent = TreeForeignKey('self', null=True, blank=True, related_name='children')