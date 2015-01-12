function initTree($tree, autoopen, autoescape) {
    var error_node = null;

    function createLi(node, $li) {
        // Create edit link
        var $title = $li.find('.jqtree-title');
        $title.after('<a href="'+ node.url +'" class="edit">('+ $tree.data('label-edit') +')</a>');
    }

    function handleMove(e) {
        var info = e.move_info;
        var data = {
            target_id: info.target_node.id,
            position: info.position
        };

        removeErrorMessage();

        e.preventDefault();

        jQuery.ajax({
            type: 'POST',
            url: info.moved_node.move_url,
            data: data,
            beforeSend: function(xhr, settings) {
                // Set Django csrf token
                var csrftoken = jQuery.cookie('csrftoken');
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            },
            success: function() {
                info.do_move();
            },
            error: function() {
                var $node = $(info.moved_node.element).find('.jqtree-element');
                $node.append('<span class="mptt-admin-error">'+ $tree.data('label-move-failed') +'</span>');

                error_node = info.moved_node;
            }
        });

        function removeErrorMessage() {
            if (error_node) {
                $(error_node.element).find('.mptt-admin-error').remove();
                error_node = null;
            }
        }
    }

    function handleLoadFailed(response) {
        $tree.html($tree.data('label-error'));
    }

    $tree.tree({
        autoOpen: autoopen,
        autoEscape: autoescape,
        dragAndDrop: true,
        onCreateLi: createLi,
        saveState: $tree.data('save_state'),
        useContextMenu: false,
        onLoadFailed: handleLoadFailed,
        closedIcon: $tree.data('rtl') == '1' ? '&#x25c0;' : '&#x25ba;'
    });

    $tree.bind('tree.move', handleMove);
}

jQuery(function() {
    var $tree = jQuery('#tree');
    var autoopen = $tree.data('auto_open');
    var autoescape = $tree.data('autoescape');

    initTree($tree, autoopen, autoescape);
});
