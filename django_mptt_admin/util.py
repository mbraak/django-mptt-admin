import json

import six

import django
from django.http import HttpResponse
from django.db.models import Q


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

    # Result tree
    tree = []

    # Dict of all nodes; used for building the tree
    # - key is node id
    # - value is node info (label, id)
    node_dict = dict()

    # The lowest level of the tree; used for building the tree
    # - Initial value is None; set later
    # - For the whole tree this is 0, for a subtree this is higher
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

        if max_level != None and not instance.is_leaf_node():
            # If there is a maximum level and this node has children, then initially set property 'load_on_demand' to true.
            node_info['load_on_demand'] = True

        if instance.level == min_level:
            # This is the lowest level. Skip finding a parent.
            # Add node to the tree
            tree.append(node_info)
        else:
            # NB: Use parent.id instead of parent_id for consistent values for uuid
            parent_id = instance.parent.id

            # Get parent from node dict
            parent_info = node_dict.get(parent_id)

            # Check for corner case: parent is deleted.
            if parent_info:
                if not 'children' in parent_info:
                    parent_info['children'] = []

                # Add node to the tree
                parent_info['children'].append(node_info)

                # If there is a maximum level, then reset property 'load_on_demand' for parent
                if max_level != None:
                    parent_info['load_on_demand'] = False

        # Update node dict
        node_dict[pk] = node_info

    return tree


def get_tree_queryset(model, node_id=None, selected_node_id=None, max_level=None, include_root=True):
    if node_id:
        node = model.objects.get(id=node_id)
        max_level = node.level + 1
        qs = node.get_descendants().filter(level__lte=max_level)
    else:
        qs = model._default_manager.get_query_set()

        if isinstance(max_level, int):
            max_level_filter = Q(level__lte=max_level)

            if selected_node_id:
                selected_node = model._default_manager.get(id=selected_node_id)
            else:
                selected_node = None

            if not (selected_node and selected_node.level > max_level):
                qs = qs.filter(max_level_filter)
            else:
                qs_parents = selected_node.get_ancestors(include_self=True)
                parents_filter = Q(parent__in=qs_parents)
                qs = qs.filter(max_level_filter | parents_filter)

        if not include_root:
            qs = qs.exclude(level=0)

    return qs.order_by('lft')


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