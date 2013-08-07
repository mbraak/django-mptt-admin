import json

import six

import django
from django.http import HttpResponse


def get_tree_from_queryset(queryset, on_create_node=None, max_level=None):
    """
    Return tree data that is suitable for jqTree.
    The queryset must be sorted by 'tree_id' and 'left' fields.
    """
    pk_attname = queryset.model._meta.pk.attname

    def serialize_id(pk):
        if isinstance(pk, six.integer_types + six.string_types):
            return pk
        else:
            # Nb. special case for uuid field
            return str(pk)

    data = []
    node_dict = dict()
    min_level = None

    for instance in queryset:
        if min_level == None:
            min_level = instance.level

        pk = getattr(instance, pk_attname)
        node_info = dict(
            label=six.text_type(instance),
            id=serialize_id(pk)
        )
        if on_create_node:
            on_create_node(instance, node_info)

        if instance.level == max_level and not instance.is_leaf_node():
            node_info['load_on_demand'] = True

        if instance.level == min_level:
            data.append(node_info)
        else:
            # NB: Use parent.id instead of parent_id for consistent values for uuid
            parent_id = instance.parent.id
            parent_info = node_dict.get(parent_id)

            # Check for corner case: parent is deleted.
            if parent_info:
                if not 'children' in parent_info:
                    parent_info['children'] = []

                parent_info['children'].append(node_info)

        node_dict[pk] = node_info

    return data


def get_javascript_value(value):
    """
    Get javascript value for python value.

    >>> get_javascript_value(True)
    true
    >>> get_javascript_value(10)
    10
    """
    if isinstance(value, bool):
        if value:
            return 'true'
        else:
            return 'false'
    else:
        return json.dumps(value)


class JsonResponse(HttpResponse):
    def __init__(self, data, status=None):
        super(JsonResponse, self).__init__(
            json.dumps(data),
            'application/json',
            status
        )


def get_short_django_version():
    """
    Get first two numbers of Django version.
    E.g. (1, 5)
    """
    return django.VERSION[0:2]