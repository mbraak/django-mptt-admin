.. image:: https://secure.travis-ci.org/leukeleu/django-mptt-admin.png
  :target: https://travis-ci.org/leukeleu/django-mptt-admin

=================
Django Mptt Admin
=================

*Django-mptt-admin* provides a nice Django Admin interface for Mptt models. The source is available on https://github.com/leukeleu/django-mptt-admin.

Requirements
============

The package is tested with Django 1.3.7, 1.4.5 and 1.5c2, and Mptt 0.5.5. Also with Python 2.6 and 2.7.

Installation
============

Install the package:

::

    $ pip install django_mptt_admin

Add ``django_mptt_admin`` to your installed apps in ``settings.py``.

::

    INSTALLED_APPS = (
        ..
        'django_mptt_admin',
    )

Use the DjangoMpttAdmin class in admin.py:

::

    from django.contrib import admin
    from django_mptt_admin.admin import DjangoMpttAdmin
    from models import Country

    class CountryAdmin(DjangoMpttAdmin):
        pass

    admin.site.register(Country, CountryAdmin)