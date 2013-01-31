function initTree($tree, tree_data) {
    $tree.tree({
        data: tree_data,
        autoOpen: 0,
        dragAndDrop: true
    });

    /*
    $tree.bind('tree.click', function(e) {
        window.location.href = e.node.url;
    });
    */

    $tree.bind('tree.move', function(e) {
        var info = e.move_info;
        var data = {
            target_id: info.target_node.id,
            position: info.position
        };

        jQuery.ajax({
            type: 'POST',
            url: info.moved_node.move_url,
            data: data,
            beforeSend: function(xhr, settings) {
                var csrftoken = jQuery.cookie('csrftoken');
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        });
    });
}