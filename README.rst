.. image:: https://secure.travis-ci.org/leukeleu/django-mptt-admin.png
  :target: https://travis-ci.org/leukeleu/django-mptt-admin

=================
Django Mptt Admin
=================

*Django_mptt_admin* provides a nice Django Admin interface for Mptt models.

Requirements
============

The package is tested with Django 1.3.5, 1.4.3 and 1.5c1, and Mptt 0.5.5. Also with Python 2.6 and 2.7.

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