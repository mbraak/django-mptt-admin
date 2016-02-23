"use strict";

/* global jQuery */

function initTree($tree, autoopen, autoescape) {
    var error_node = null;

    function createLi(node, $li) {
        // Create edit link
        var $title = $li.find(".jqtree-title");

        $title.after("<a href=\"" + node.url + "\" class=\"edit\">(" + $tree.data("label-edit") + ")</a>", "<a href=\"" + $tree.data("insert_at_url") + "?insert_at=" + node.id + "\" class=\"edit\">(" + $tree.data("label-add") + ")</a>");
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
            type: "POST",
            url: info.moved_node.move_url,
            data: data,
            beforeSend: function beforeSend(xhr) {
                // Set Django csrf token
                var csrftoken = jQuery.cookie("csrftoken");
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            },
            success: function success() {
                info.do_move();
            },
            error: function error() {
                var $node = jQuery(info.moved_node.element).find(".jqtree-element");
                $node.append("<span class=\"mptt-admin-error\">" + $tree.data("label-move-failed") + "</span>");

                error_node = info.moved_node;
            }
        });

        function removeErrorMessage() {
            if (error_node) {
                jQuery(error_node.element).find(".mptt-admin-error").remove();
                error_node = null;
            }
        }
    }

    function handleLoadFailed() {
        $tree.html($tree.data("label-error"));
    }

    $tree.tree({
        autoOpen: autoopen,
        autoEscape: autoescape,
        buttonLeft: false,
        dragAndDrop: true,
        onCreateLi: createLi,
        saveState: $tree.data("save_state"),
        useContextMenu: $tree.data("use_context_menu"),
        onLoadFailed: handleLoadFailed,
        closedIcon: $tree.data("rtl") === "1" ? "&#x25c0;" : "&#x25ba;"
    });

    $tree.bind("tree.move", handleMove);
}

jQuery(function () {
    var $tree = jQuery("#tree");
    var autoopen = $tree.data("auto_open");
    var autoescape = $tree.data("autoescape");

    initTree($tree, autoopen, autoescape);
});