# Options

**tree_animation_speed**

The speed of the open/close animation in milliseconds. The default is 200 milliseconds.

**tree_auto_open**

Auto-open node. Default value is 1.

Values:

- **True**: autopen all nodes
- **False**: do not autoopen
- **integer**: autopen until this level

**tree_load_on_demand**

Load on demand (True / False / level). Default is True.

- **True**: load nodes on demand
- **False**: do not load nodes on demand
- **int**: load nodes on demand until this level

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

**is_drag_and_drop_enabled**

Override the **is_drag_and_drop_enabled** method to disable drag-and-drop. By default drag-and-drop is enabled.

```python
class CountryAdmin(DjangoMpttAdmin):
  def is_drag_and_drop_enabled(self):
    return False
```

**use_context_menu**

Capture the contextmenu event. NB: the contextmenu event is triggered when you click with the right mouse button.

- True: Capture the contextmenu event.
  - This is useful if you want to write custom javascript to catch the `tree.contextmenu` event.
  - Also see https://mbraak.github.io/jqTree/#usecontextmenu and https://mbraak.github.io/jqTree/#event-tree-contextmenu
- False (default): do not capture the contextmenu event.

**item_label_field_name**

Define which field of the model should be the label for tree items.

Possible values are:

- string: name of the model field or model property method to use as tree items label
- None (default): model unicode used ad tree item label

Example:

```python
class MyMpttModel(MPTTModel):
    title = models.CharField(......

    @property
    def title_for_admin(self):
          return '%s %s' % (self.pk, self.title)

class MyMpttModelAdminClass(MPTTModelAdmin):
    item_label_field_name = 'title_for_admin'
```
