/* global jQuery, gettext */

function initTree($tree, autoopen, autoescape, rtl) {
    let error_node = null;

    function createLi(node, $li) {
        // Create edit link
        const $title = $li.find(".jqtree-title");

        $title.after(
            `<a href="${node.url}" class="edit">${gettext("edit")}</a>`,
            `<a href="${$tree.data("insert_at_url")}?insert_at=${node.id}" class="edit">${gettext("add")}</a>`
        );
    }

    function handleMove(e) {
        const info = e.move_info;
        const data = {
            target_id: info.target_node.id,
            position: info.position
        };

        removeErrorMessage();

        e.preventDefault();

        jQuery.ajax({
            type: "POST",
            url: info.moved_node.move_url,
            data,
            beforeSend: xhr => {
                // Set Django csrf token
                const csrftoken = jQuery.cookie("csrftoken");
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            },
            success: () => {
                info.do_move();
            },
            error: () => {
                const $node = jQuery(info.moved_node.element).find(".jqtree-element");
                $node.append(`<span class="mptt-admin-error">${gettext("move failed")}</span>`);

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
        $tree.html(gettext("Error while loading the data from the server"));
    }

    $tree.tree({
        autoOpen: autoopen,
        autoEscape: autoescape,
        buttonLeft: !rtl,
        dragAndDrop: true,
        onCreateLi: createLi,
        saveState: $tree.data("save_state"),
        useContextMenu: $tree.data("use_context_menu"),
        onLoadFailed: handleLoadFailed,
        closedIcon: rtl ? "&#x25c0;" : "&#x25ba;"
    });

    $tree.bind("tree.move", handleMove);
}

jQuery(() => {
    const $tree = jQuery("#tree");
    const autoopen = $tree.data("auto_open");
    const autoescape = $tree.data("autoescape");
    const rtl = $tree.data("rtl") === "1";

    initTree($tree, autoopen, autoescape, rtl);
});
