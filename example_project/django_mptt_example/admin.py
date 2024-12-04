from django.contrib import admin
from django.conf import settings

from django_mptt_admin.admin import DjangoMpttAdmin

from .models import Country


class ContinentFilter(admin.SimpleListFilter):
    title = "continent"
    parameter_name = "continent"

    def lookups(self, request, model_admin):
        continents = Country.objects.filter(level=1).order_by("name")

        return [(c.name, c.name) for c in continents]

    def queryset(self, request, queryset):
        value = self.value()

        if not value:
            return queryset
        else:
            continent = Country.objects.get(name=value, level=1)

            return continent.get_descendants(include_self=True)


class CountryAdmin(DjangoMpttAdmin):
    tree_auto_open = 0
    list_display = ("code", "name")
    ordering = ("name",)
    list_filter = (ContinentFilter,)

    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser

    def get_tree_mouse_delay(self):
        if getattr(settings, "DJANGO_TESTING", False):
            return 0
        else:
            return None


# Display the code for countries instead of the name.
class CountryCodeAdmin(CountryAdmin):
    item_label_field_name = 'code_or_name'


# Display a title with html
class CountryWithHtmlAdmin(CountryAdmin):
    autoescape = False
    item_label_field_name = 'html_code_and_name'


class CountryCode(Country):
    class Meta:
        proxy = True


class CountryCodeAndName(Country):
    class Meta:
        proxy = True


admin.site.register(Country, CountryAdmin)
admin.site.register(CountryCode, CountryCodeAdmin)
admin.site.register(CountryCodeAndName, CountryWithHtmlAdmin)
