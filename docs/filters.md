# Filters

If you want to use filters, then you can set the `list_filter` option. See the [Django docs](https://docs.djangoproject.com/en/1.10/ref/contrib/admin/#django.contrib.admin.ModelAdmin.list_filter).

```python
from django_mptt_admin.admin import DjangoMpttAdmin

class CountryAdmin(DjangoMpttAdmin):
    list_filter = ('continent',)
```

Also see the example project for a complete continent filter.
