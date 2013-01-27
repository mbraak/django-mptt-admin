def get_tree_from_mptt(queryset, on_create_node=None):
    """
    Return tree data that is suitable for jqTree.
    The queryset must be sorted by 'tree_id' and 'left' fields.
    """
    data = []
    node_dict = dict()

    is_first = True
    for node in queryset:
        node_info = dict(
            label=unicode(node),
            id=node.id
        )
        if on_create_node:
            on_create_node(node, node_info)

        if is_first:
            data.append(node_info)
        else:
            parent_info = node_dict.get(node.parent_id)

            # Check for corner case: parent is deleted.
            if parent_info:
                if not 'children' in parent_info:
                    parent_info['children'] = []

                parent_info['children'].append(node_info)

        node_dict[node.id] = node_info
        is_first = False

    return data