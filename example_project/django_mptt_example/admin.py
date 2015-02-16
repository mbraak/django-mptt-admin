from django.contrib import admin

from django_mptt_admin.admin import DjangoMpttAdmin

from .models import Country


class CountryAdmin(DjangoMpttAdmin):
    tree_auto_open = 0
    list_display = ('code', 'name')
    ordering = ('name',)

    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser


admin.site.register(Country, CountryAdmin)
