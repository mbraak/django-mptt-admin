# Changelog

**development**

- Fix: include the app label in the key for the saved tree state. Models with the same name in different apps no longer share their saved state. The saved state (open and selected nodes) is reset once after upgrading.
- Fix: preserve the active filters correctly in the URLs of the tree nodes. Returning to the tree after editing a node now keeps the filter.

**3.1.1** (November 1 2026)

- Make the tree readable for screen readers.

**3.1.0** (October 17 2026)

- Accessibility improvements:
  - Add screen reader titles to buttons.
  - Add aria-label to the tree.
  - Support reduced motion.
  - Make the toggle button larger.
  - Hide the toggle button for screen readers.
  - Add keyboard support for Home and End.
- Add Dutch translations.

**3.0.1** (October 10 2026)

- Make rendering faster by using templates.
- Make rendering faster by only rendering visible nodes.
- Add aria role to loading spinner so it is recognized by screen readers.
- Add missing 'view' translation.

**3.0.0** (September 11 2026)

- Use a different JavaScript library for displaying the tree. Everything works the same.
  The jqtree library is replaced by tree-element. Tree-element does the same as jqtree, but without jQuery.

**2.11.0** (September 6 2026)

- Issue #782. Use CSS animations (instead of jQuery animations).
- Publish releases to PyPI from a GitHub Actions workflow. The package metadata moved from `setup.py` to `pyproject.toml`.

**2.10.0** (August 6 2026)

- Issue #754. Support Django 6.1. Drop support for Django 4.2.

**2.9.1** (July 20 2026)

- Issue #768. Use js-cookie. Everything should still work the same.
- Issue #777. Do not raise an exception when a node is deselected.
- Issue #778. Fix the tab index when a node is selected and then deselected.

**2.9.0** (December 2025)

- Support Django 6.0; drop support for Django 5.1

**2.8.0** (April 7 2025)

- Support Django 5.2; drop support for Django 5.0

**2.7.2** (January 9 2025)

- Issue #605: fix missing map file

**2.7.1** (January 8 2025)

- Issue #604: delay before opening a folder during drag and drop

**2.7.0** (August 13 2024)

- Issue #557: support Django 5.1; drop support for Django 3.2

**2.6.2** (April 13 2024)

- Issue #509: use CSS for the loading spinner. Support dark mode.
- Issue #541: fix JavaScript import error in Django 3.2 (thanks to scottp-dpaw)

**2.6.1** (December 9 2023)

- Issue #505: fix collectstatic error

**2.6.0** (December 7 2023)

- Issue #495: support Django 5.0

**2.5.1** (May 6 2023)

- Support dark mode (thanks to Sumit Kumar)

**2.5.0** (April 4 2023)

- Support Django 4.2

**2.4.1** (February 1 2023)

- Issue #431: fix `get_tree_mouse_delay` error

**2.4.0** (January 31 2023)

- Issue #426: handle permissions:
  - 'Add' link: only display it if the admin user has the 'Add' permission
  - 'Edit' link: only display it if the admin user has the 'Edit' permission
    - Otherwise: still display it but change the text to 'view'
  - Drag and drop: only enable it if the admin user has the 'Edit' permission
    - It's also possible to disable drag and drop by overriding the `is_drag_and_drop_enabled` method.

**2.3.0** (August 4 2022)

- Update jqtree to 1.6.2. This fixes an issue with the keyboard focus when using on demand loading.
- Support Django 4.1

**2.2.0** (December 8 2021)

- Support Django 4.0

**2.1.0** (April 6 2021)

- Issue #353: support Django 3.2

**2.0.3** (March 1 2021)

- Issue #341: update jqtree to 1.6.0
- Issue #345: add option to disable drag-and-drop (thanks to Maxim Popov)

**2.0.2** (October 27 2020)

- Issue #328: fix DJANGO_MPTT_ADMIN_COVERAGE_JS (thanks to Andrew Kh)

**2.0.1** (October 26 2020)

- Issue #309: add option for animation speed
- Issue #325: update jqtree to 1.5.2

**2.0.0** (August 7 2020)

- Support Django 3.1

**1.0.2** (June 26 2020)

- Issue #287: add Catalan and Spanish translations (thanks to Joan Marc Soler)

**1.0.1** (February 14 2020)

- Issue #282: add German translations (thanks to Christian Wiegand)
- Issue #284: add Polish translations (thanks to Paweł Chojnowski)

**1.0.0** (December 5 2019)

- Issue #271: support Django 3
- Issue #276: fix movement during drag-and-drop

**0.7.2** (October 19 2019)

- Issue #270: support media class (thanks to Sencer H.)

**0.7.1** (April 23 2019)

- Issue #254: upgrade jqtree to 1.4.10
- Issue #255: test with django-mptt 0.10
- Issue #258: include jqtree.CSS in django_mptt_admin.CSS

**0.7.0** (April 5 2019)

- Issue #242: minified build
- Issue #243: upgrade jqTree to 1.4.9
- Issue #252: support Django 2.2

**0.6.0** (August 4 2018)

- Issue #232: support Django 2.1
- Issue #233: upgrade jqTree to 1.4.7

**0.5.1** (April 8 2018)

- Issue #220: upgrade jqTree to 1.4.5
- Issue #224: add a spinner for the move action (thanks to Riccardo Magliocchetti)

**0.5.0** (December 7 2017)

- Issue #217: Support Django 2.0

**0.4.7** (September 29 2017)

- Issue #212: Fix unsafe reference to instance.parent (thanks to John D'Ambrosio)
- Issue #211: Make ChangeList configurable using `change_list_tree_class` (thanks to Riccardo Magliocchetti)

**0.4.6** (June 7 2017)

- Issue #200: Upgrade to jqtree 1.4.1
- Issue #201: Make 'edit' and 'add' buttons not focusable
- Issue #203: 'Add' URL path must end with '/'

**0.4.5** (April 5 2017)

- Issue #188: Handle CSRF_COOKIE_NAME option
- Issue #189: Handle Django CSRF_USE_SESSIONS option (new option in Django 1.11)
- Issue #191: Only initialize the tree on the tree page (thanks to Stanislav Zholudev)
- Issue #197: Support Django 1.11

**0.4.4** (January 30 2017)

- Issue #185: Support preserved filters (thanks to Riccardo Magliocchetti)
- Issue #186: Move `list_filter` option to DjangoMpttAdmin class

**0.4.3** (January 18 2017)

- Issue 178: Added Hungarian translations (thanks to roodie)
- Issue 182: Add option to configure node label (thanks to Claudio Bartolini)
- Issue 183: Update jqtree to 1.3.7

**0.4.2** (November 10 2016)

- Issue 170: Added FilterableDjangoMpttAdmin (thanks to Riccardo Magliocchetti)
- Issue 172: Update jqtree to 1.3.6
- Issue 173: Move translations to djangojs domain
- Issue 174: Added French translations (thanks to Vhotz)
- Issue 175: Fixed: can't move items in tree view with CSRF_COOKIE_HTTPONLY = True (thanks to Vhotz)

**0.4.1** (September 21 2016)

- Issue 162: Add request parameter to `filter_tree_queryset` signature (thanks to Max Perreault)
- Issue 163: Update to jqtree 1.3.5

**0.4.0** (August 3 2016)

- Issue 152: Django 1.10 support.
  - Drop support for Django 1.7

**0.3.8** (July 27 2016)

- Issue 142: use the Django admin static tag for CSS / JavaScript (thanks to Alex Tomkins)
- Issue 143: update jqtree to 1.3.4

**0.3.7** (June 1 2016)

- Issue 132: use MPTTModelAdmin for DjangoMpttAdmin (thanks to Alex Tomkins)
  - MPTTModelAdmin contains fixes for mass deletions and TreeForeignKey
- Issue 139: update to jqtree 1.3.3

**0.3.6** (March 28 2016)

- Issue 125: fix jQuery.cookie error (thanks to Patrick Colmant)

**0.3.5** (March 28 2016)

- Issue 126: add missing jqtree-circle.png (thanks to Generalov)

**0.3.4** (March 25 2016)

- Issue 115: implemented 'add' button (thanks to Andrew Dodd)
- Issue 116: fix block-style layout for right-to-left-languages
- Issue 119: display transparent loading image

**0.3.3** (February 10 2016)

- Issue 112: correctly override media (thanks to Generalov)

**0.3.2** (January 29 2016)

- Issue 103: use jQuery from Django admin itself
- Issue 105: added Turkish translation (thanks to Tagmat)
- Issue 106: use the same colors as the Django admin
- Issue 109: include locale files in package

**0.3.1** (December 2 2015)

- Issue 82: make admin views easily extendable (thanks to Vsevolod Novikov)
- Issue 93: flat styling
- Issue 95: update jqtree to 1.3.0
- Issue 96: cannot move to the top of the tree
- Issue 97: support Django 1.9

**0.3.0** (August 21 2015)

- Issue 67: update jqtree to 1.2.1
- Issue 68: drop support for Django 1.6 and older
  - Note that version 0.2.1 supports these versions.
- Issue 71: added `use_context_menu` option (thanks to ITCase)
- Issue 75: added Russian translation (thanks to Mike Silonov)
- Issue 80: fix wrong URL resolving with multiple admin sites (thanks to Hubert Bielenia)

**0.2.1** (March 29 2015)

- Issue 65: support Django 1.8

**0.2.0** (January 12 2015)

- Issue 23: fixed save-state for load-on-demand
- Issue 35: fixed auto-open for load-on-demand
- Issue 40: use jqtree 1.0.0
- Issue 45: added i18n support and Hebrew translation (thanks to Udi Oron)
- Issue 47: added `filter_tree_queryset` method

**0.1.10** (September 24 2014)

- Issue 31: added autoescape option
- Issue 34: use the default change list in popup mode (thanks to hstanev)
- Issue 36: the option `tree_load_on_demand = False` does not work

**0.1.9** (July 12 2014)

- Issue 25: update jqtree to 0.21.0
- Issue 28: fixing problems related to working with model's pk-field, named other than "id" (thanks to Igor Gai)
- Issue 29: fix path to spinner.gif (thanks to Igor Gai)

**0.1.8** (February 2 2014)

- Issue 17: handle error when moving node
- Issue 18: do not use inline JavaScript
- Issue 19: support Django 1.7 alpha

**0.1.7** (January 3 2014)

- Issue 16: moving a node fails if the node id is a UUID

**0.1.6** (October 10 2013)

- Issue 8: removing node from the tree causes the tree view to crash

**0.1.5** (August 27 2013)

- Issue 6: save the tree state
- Issue 7: do not handle the right mouse click

**0.1.4** (August 8 2013)

- Issue 5: Support for UUID ids

**0.1.3** (May 2 2013)

_This version drops support for Django 1.3.7_

- Issue 2: Posting a screenshot in the README would be really useful (thanks to Andy Baker)
- Issue 3: Use static templatetag for CDN-compatible file paths (thanks to Alex Holmes)
- Added [Coveralls](https://coveralls.io/r/mbraak/django-mptt-admin) support

**0.1.2** (March 12 2013)

- Issue 1: Grid view doesn't link correctly to object change pages (thanks to Kris Fields)

**0.1.1** (February 25 2013)

- Added experimental Python 3 support

**0.1** (February 7 2013)

- Initial version
