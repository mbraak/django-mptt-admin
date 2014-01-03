[![Travis Status](https://secure.travis-ci.org/leukeleu/django-mptt-admin.png)](http://travis-ci.org/leukeleu/django-mptt-admin)

[![Coverage Status](https://coveralls.io/repos/leukeleu/django-mptt-admin/badge.png?branch=master)](https://coveralls.io/r/leukeleu/django-mptt-admin)

[![Downloads](https://pypip.in/d/django-mptt-admin/badge.png)](https://pypi.python.org/pypi/django-mptt-admin/)

[![Version](https://pypip.in/v/django-mptt-admin/badge.png)](https://pypi.python.org/pypi/django-mptt-admin/)

[![Violations](https://coviolations.io/projects/leukeleu/django-mptt-admin/badge/?)](http://coviolations.io/projects/leukeleu/django-mptt-admin/)

Django Mptt Admin
=================

*Django-mptt-admin* provides a nice Django Admin interface for Mptt models. The source is available on [https://github.com/leukeleu/django-mptt-admin](https://github.com/leukeleu/django-mptt-admin). It uses the [jqTree](http://mbraak.github.io/jqTree/) library.

![Screenshot](https://raw.github.com/leukeleu/django-mptt-admin/master/screenshot.png)

Requirements
------------

The package is tested with Django 1.4 - 1.6, and Mptt 0.6.0. Also with Python 2.6, 2.7 and 3.3.

* This version is not compatible with Django 1.3. Please use django-mptt-admin 0.1.2 for Django 1.3 support.

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

Changelog
---------
**0.1.7** (january 3 2014)

* Issue 16: moving a node fails if the node id is a uuid

**0.1.6** (october 10 2013)

* Issue 8: removing node from the tree causes the tree view to crash

**0.1.5** (august 27 2013)

* Issue 6: save the tree state
* Issue 7: do not handle the right mouse click

**0.1.4** (august 8 2013)

* Issue 5: Support for uuid ids

**0.1.3** (may 2 2013)

*This version drops support for Django 1.3.7*

* Issue 2: Posting a screenshot in the readme would be really useful (thanks to Andy Baker)
* Issue 3: Use static templatetag for CDN-compatible file paths (thanks to Alex Holmes)
* Added [Coveralls](https://coveralls.io/r/leukeleu/django-mptt-admin) support

**0.1.2** (march 12 2013)

* Issue 1: Grid view doesn't link correctly to object change pages (thanks to Kris Fields)

**0.1.1** (februari 25 2013)

* Added experimental Python 3 support

**0.1** (februari 7 2013)

* Initial version

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/leukeleu/django-mptt-admin/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

