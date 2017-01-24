/* global jQuery, gettext */

import "jqtree";
import Spinner from "spin";
import cookie from "cookie";
import urljoin from "url-join";


function initTree($tree, autoopen, autoescape, rtl) {
    let error_node = null;
    const insert_at_url = $tree.data("insert_at_url");

    function createLi(node, $li) {
        // Create edit link
        const $title = $li.find(".jqtree-title");

        const insert_at_url_for_node = urljoin(insert_at_url, `?insert-at=${node.id}`);

        $title.after(
            `<a href="${node.url}" class="edit">(${gettext("edit")})</a>`,
            `<a href="${insert_at_url_for_node}" class="edit">(${gettext("add")})</a>`
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
                const csrftoken = cookie.parse(document.cookie).csrftoken || document.querySelector('[name="csrfmiddlewaretoken"]').value;
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

    const spinners = {};

    function handleLoading(is_loading, node, $el) {
        function getNodeId() {
            if (!node) {
                return "__root__";
            }
            else {
                return node.id;
            }
        }

        function getContainer() {
            if (node) {
                return $el.find(".jqtree-element")[0];
            }
            else {
                return $el[0];
            }
        }

        const node_id = getNodeId();

        if (is_loading) {
            spinners[node_id] = new Spinner().spin(getContainer());
        }
        else {
            const spinner = spinners[node_id];

            if (spinner) {
                spinner.stop();
                spinners[node_id] = null;
            }
        }
    }

    $tree.tree({
        autoOpen: autoopen,
        autoEscape: autoescape,
        buttonLeft: rtl,
        dragAndDrop: true,
        onCreateLi: createLi,
        saveState: $tree.data("save_state"),
        useContextMenu: $tree.data("use_context_menu"),
        onLoadFailed: handleLoadFailed,
        closedIcon: rtl ? "&#x25c0;" : "&#x25ba;",
        onLoading: handleLoading
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
