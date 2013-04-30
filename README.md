[![Travis Status](https://secure.travis-ci.org/leukeleu/django-mptt-admin.png)](http://travis-ci.org/leukeleu/django-mptt-admin)

[![Coverage Status](https://coveralls.io/repos/leukeleu/django-mptt-admin/badge.png?branch=master)](https://coveralls.io/r/leukeleu/django-mptt-admin)

Django Mptt Admin
=================

*Django-mptt-admin* provides a nice Django Admin interface for Mptt models. The source is available on [https://github.com/leukeleu/django-mptt-admin](https://github.com/leukeleu/django-mptt-admin). It uses the [jqTree](http://mbraak.github.io/jqTree/) library.

![Screenshot](https://raw.github.com/leukeleu/django-mptt-admin/master/screenshot.png)

Requirements
------------

The package is tested with Django 1.4.5 and 1.5.1, and Mptt 0.5.5. Also with Python 2.6 and 2.7.

Installation
------------

Install the package:

    $ pip install django_mptt_admin

Add **django_mptt_admin** to your installed apps in **settings.py**.

    INSTALLED_APPS = (
        ..
        'django_mptt_admin',
    )

Use the DjangoMpttAdmin class in admin.py:

    from django.contrib import admin
    from django_mptt_admin.admin import DjangoMpttAdmin
    from models import Country

    class CountryAdmin(DjangoMpttAdmin):
        pass

    admin.site.register(Country, CountryAdmin)
