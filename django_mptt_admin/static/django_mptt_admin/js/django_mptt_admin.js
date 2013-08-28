function initTree($tree, auto_open) {
    function createLi(node, $li) {
        // Create edit link
        var $title = $li.find('.jqtree-title');
        $title.after('<a href="'+ node.url +'" class="edit">(edit)</a>');
    }

    function handleMove(e) {
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
                // Set Django csrf token
                var csrftoken = jQuery.cookie('csrftoken');
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        });
    }

    function handleLoadFailed(response) {
        $tree.html('Error while loading the data from the server.');
    }

    $tree.tree({
        autoOpen: auto_open,
        dragAndDrop: true,
        onCreateLi: createLi,
        saveState: $tree.data('save_state'),
        useContextMenu: false,
        onLoadFailed: handleLoadFailed
    });

    $tree.bind('tree.move', handleMove);
}