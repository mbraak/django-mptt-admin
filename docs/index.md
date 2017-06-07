# Django Mptt Admin

*Django-mptt-admin* provides a nice Django Admin interface for [django-mptt models](http://django-mptt.github.io/django-mptt/).

* The source is available on [https://github.com/mbraak/django-mptt-admin](https://github.com/mbraak/django-mptt-admin).
* Documentation is available on [https://pythonhosted.org/django-mptt-admin/](https://pythonhosted.org/django-mptt-admin/).

![Screenshot](https://raw.github.com/mbraak/django-mptt-admin/master/screenshot.png)

## Requirements

The package is tested with Django (1.8 - 1.11), and django-mptt (0.8.x). Also with Python 2.7, 3.3-3.6.

Note that version 0.3.8 also supports Django 1.7.

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

## Options

**tree_auto_open**

Auto-open node. Default value is 1.

Values:
* **True**: autopen all nodes
* **False**: do not autoopen
* **integer**: autopen until this level

**tree_load_on_demand**

Load on demand (True / False / level). Default is True.

* **True**: load nodes on demand
* **False**: do not load nodes on demand
* **int**: load nodes on demand until this level

**autoescape**

Autoescape (True / False). Default is True.

Autoescape titles in tree.

**filter_tree_queryset**

Override the **filter_tree_queryset** method to filter the queyset for the tree.

```python
class CountryAdmin(DjangoMpttAdmin):
  def filter_tree_queryset(self, queryset):
    return queryset.filter(name='abc')
```

**use_context_menu**

True / False. Default is False.

"useContextMenu" option for tree.

**item_label_field_name**

Define which field of the model should be the label for tree items.

Possible values are:
* string: name of the model field or model property method to use as tree items label
* None (default): model unicode used ad tree item label

Example:

```
class MyMpttModel(MPTTModel):
    title = models.CharField(......

    @property
    def title_for_admin(self):
          return '%s %s' % (self.pk, self.title)

class MyMpttModelAdminClass(MPTTModelAdmin):
    item_label_field_name = 'title_for_admin'
```

## Filters

If you want to use filters, then you can set the `list_filter` option. See the [Django docs](https://docs.djangoproject.com/en/1.10/ref/contrib/admin/#django.contrib.admin.ModelAdmin.list_filter).

```python
from django_mptt_admin.admin import DjangoMpttAdmin

class CountryAdmin(DjangoMpttAdmin):
    list_filter = ('continent',)
```

Also see the example project for a complete continent filter.

## Changelog

**0.4.6** (june 7 2017)

* Issue #200: Upgrade to jqtree 1.4.1
* Issue #201: Make 'edit' and 'add' buttons not focusable
* Issue #203: 'Add' url path must end with '/'

**0.4.5** (april 5 2017)

* Issue #188: Handle CSRF_COOKIE_NAME option
* Issue #189: Handle Django CSRF_USE_SESSIONS option (new option in Django 1.11)
* Issue #191: Only initialize the tree on the tree page (thanks to Stanislav Zholudev)
* Issue #197: Support Django 1.11

**0.4.4** (january 30 2017)

* Issue #185: Support preserved filters (thanks to Riccardo Magliocchetti)
* Issue #186: Move list_filter option to DjangoMpttAdmin class

**0.4.3** (january 18 2017)

* Issue 178: Added Hungarian translations (thanks to roodie)
* Issue 182: Add option to configure node label (thanks to Claudio Bartolini)
* Issue 183: Update jqtree to 1.3.7

**0.4.2** (november 10 2016)

* Issue 170: Added FilterableDjangoMpttAdmin (thanks to Riccardo Magliocchetti)
* Issue 172: Update jqtree to 1.3.6
* Issue 173: Move translations to djangojs domain
* Issue 174: Added French translations (thanks to Vhotz)
* Issue 175: Fixed: can't move items in tree view with CSRF_COOKIE_HTTPONLY = True (thanks to Vhotz)

**0.4.1** (september 21 2016)

* Issue 162: Add request parameter to filter_tree_queryset signature (thanks to Max Perreault)
* Issue 163: Update to jqtree 1.3.5

**0.4.0** (august 3 2016)

* Issue 152: Django 1.10 support.
    * Drop support for Django 1.7

**0.3.8** (july 27 2016)

* Issue 142: use the Django admin static tag for CSS / Javascript (thanks to Alex Tomkins)
* Issue 143: update jqtree to 1.3.4

**0.3.7** (june 1 2016)

* Issue 132: use MPTTModelAdmin for DjangoMpttAdmin (thanks to Alex Tomkins)
    * MPTTModelAdmin contains fixes for mass deletions and TreeForeignKey
* Issue 139: update to jqtree 1.3.3

**0.3.6** (march 28 2016)

* Issue 125: fix jQuery.cookie error (thanks to Patrick Colmant)

**0.3.5** (march 28 2016)

* Issue 126: add missing jqtree-circle.png (thanks to Generalov)

**0.3.4** (march 25 2016)

* Issue 115: implemented 'add' button (thanks to Andrew Dodd)
* Issue 116: fix block-style layout for right-to-left-languages
* Issue 119: display transparent loading image

**0.3.3** (february 10 2016)

* Issue 112: correctly override media (thanks to Generalov)

**0.3.2** (january 29 2016)

* Issue 103: use jquery from django admin itself
* Issue 105: added Turkish translation (thanks to Tagmat)
* Issue 106: use the same colors as the Django admin
* Issue 109: include locale files in package

**0.3.1** (december 2 2015)

* Issue 82: make admin views easily extendable (thanks to Vsevolod Novikov)
* Issue 93: flat styling
* Issue 95: update jqtree to 1.3.0
* Issue 96: cannot move to the top of the tree
* Issue 97: support Django 1.9

**0.3.0** (august 21 2015)

* Issue 67: update jqtree to 1.2.1
* Issue 68: drop support for Django 1.6 and older
    * Note that version 0.2.1 supports these versions.
* Issue 71: added use_context_menu option (thanks to ITCase)
* Issue 75: added Russian translation (thanks to Mike Silonov)
* Issue 80: fix wrong url resolving with multiple admin sites (thanks to Hubert Bielenia)

**0.2.1** (march 29 2015)

* Issue 65: support Django 1.8

**0.2.0** (january 12 2015)

* Issue 23: fixed save-state for load-on-demand
* Issue 35: fixed auto-open for load-on-demand
* Issue 40: use jqtree 1.0.0
* Issue 45: added i18n support and Hebrew translation (thanks to Udi Oron)
* Issue 47: added filter_tree_queryset method

**0.1.10** (september 24 2014)

* Issue 31: added autoescape option
* Issue 34: use the default change list in popup mode (thanks to hstanev)
* Issue 36: the option tree_load_on_demand = False does not work

**0.1.9** (july 12 2014)

* Issue 25: update jqtree to 0.21.0
* Issue 28: fixing problems related to working with model's pk-field, named other than "id" (thanks to Igor Gai)
* Issue 29: fix path to spinner.gif (thanks to Igor Gai)

**0.1.8** (februari 2 2014)

* Issue 17: handle error when moving node
* Issue 18: do not use inline javascript
* Issue 19: support Django 1.7 alpha

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
* Added [Coveralls](https://coveralls.io/r/mbraak/django-mptt-admin) support

**0.1.2** (march 12 2013)

* Issue 1: Grid view doesn't link correctly to object change pages (thanks to Kris Fields)

**0.1.1** (februari 25 2013)

* Added experimental Python 3 support

**0.1** (februari 7 2013)

* Initial version

[![Code Issues](https://www.quantifiedcode.com/api/v1/project/dd888e7a1804465798821f28717af384/badge.svg)](https://www.quantifiedcode.com/app/project/dd888e7a1804465798821f28717af384)
