function initTree($tree, auto_open) {
    function createLi(node, $li) {
        var $title = $li.find('.jqtree-title');
        $title.after('<a href="'+ node.url +'" class="edit">(edit)</a>');
    }

    $tree.tree({
        autoOpen: auto_open,
        dragAndDrop: true,
        onCreateLi: createLi
    });

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