from django.contrib import admin

from django_mptt_admin.admin import DjangoMpttAdmin

from models import Country


class CountryAdmin(DjangoMpttAdmin):
    pass


admin.site.register(Country, CountryAdmin)