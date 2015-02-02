from django.db import models

from mptt.models import TreeForeignKey
import mptt


from django_mptt_admin.util import get_short_django_version


class Country(models.Model):
    class Meta:
        verbose_name_plural = 'countries'
        app_label = 'django_mptt_example'

    code = models.CharField(max_length=2, blank=True, null=True)
    name = models.CharField(max_length=50, blank=True, null=True)
    parent = TreeForeignKey('self', null=True, blank=True, related_name='children')

    def __unicode__(self):
        return self.name or self.code or ''

    def __str__(self):
        return self.__unicode__()


if get_short_django_version() < (1, 8):
    mptt.register(Country)
