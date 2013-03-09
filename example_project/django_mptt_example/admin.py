from django.contrib import admin

from django_mptt_admin.admin import DjangoMpttAdmin

from .models import Country


class CountryAdmin(DjangoMpttAdmin):
    tree_auto_open = 0
    list_display = ('code', 'name')
    ordering = ('code', 'name')


admin.site.register(Country, CountryAdmin)