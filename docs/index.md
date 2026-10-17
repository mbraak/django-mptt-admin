# Django Mptt Admin

_Django-mptt-admin_ provides a nice Django Admin interface for [django-mptt models](http://django-mptt.github.io/django-mptt/).

- The source is available on [https://github.com/mbraak/django-mptt-admin](https://github.com/mbraak/django-mptt-admin).
- Documentation is available on [https://mbraak.github.io/django-mptt-admin/](https://mbraak.github.io/django-mptt-admin/).

![Screenshot](https://raw.github.com/mbraak/django-mptt-admin/master/screenshot.png)

## Requirements

The package is tested with Django (5.2, 6.0 and 6.1), and django-mptt (0.18). Also with Python 3.10 - 3.14.

Older versions:

- Version 2.5.x supports Django 4.1.
- Version 2.7.x supports Django 5.0.
- Version 2.8.x supports Django 5.1.
- Version 2.9.x supports Django 4.2.

## Installation

Install the package:

```
$ pip install django-mptt-admin
```

Add **django_mptt_admin** to your installed apps in **settings.py**.

```python
  INSTALLED_APPS = (
      ..
      'django_mptt_admin',
  )
```

Use the DjangoMpttAdmin class in admin.py:

```python
    from django.contrib import admin
    from django_mptt_admin.admin import DjangoMpttAdmin
    from models import Country

    class CountryAdmin(DjangoMpttAdmin):
        pass

    admin.site.register(Country, CountryAdmin)
```

[![Code Issues](https://www.quantifiedcode.com/api/v1/project/dd888e7a1804465798821f28717af384/badge.svg)](https://www.quantifiedcode.com/app/project/dd888e7a1804465798821f28717af384)
