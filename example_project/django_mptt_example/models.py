from six import python_2_unicode_compatible

from django.db import models

from mptt.models import TreeForeignKey
import mptt


@python_2_unicode_compatible
class Country(models.Model):
    class Meta:
        verbose_name_plural = 'countries'
        app_label = 'django_mptt_example'

    code = models.CharField(max_length=2, blank=True, null=True)
    name = models.CharField(max_length=50, blank=True, null=True)
    parent = TreeForeignKey('self', null=True, blank=True, related_name='children')

    def __str__(self):
        return self.name or self.code or ''


mptt.register(Country)
