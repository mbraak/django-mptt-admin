import "jqtree";
import { Spinner } from "spin.js";
import * as cookie from "cookie";
import * as URL from "url-parse";
import * as qs from "querystringify";

function initTree(
    $tree: JQuery,
    autoOpen: boolean | number,
    autoEscape: boolean,
    rtl: boolean,
    csrfCookieName: string
) {
    let errorNode: any = null;
    const insertAtUrl = new URL($tree.data("insert_at_url"), true);

    function createLi(node: INode, $li: JQuery, isSelected: boolean) {
        // Create edit link
        const $title = $li.find(".jqtree-title");

        insertAtUrl.query.insert_at = `${node.id}`;

        const insertUrlString = urlToString(insertAtUrl);

        const tabindex = isSelected ? "0" : "-1";

        $title.after(
            `<a href="${
                node.url
            }" class="edit" tabindex="${tabindex}">(${gettext("edit")})</a>`,
            `<a href="${insertUrlString}" class="edit" tabindex="${tabindex}">(${gettext(
                "add"
            )})</a>`
        );
    }

    function getCsrfToken() {
        function getFromMiddleware() {
            return (document.querySelector(
                '[name="csrfmiddlewaretoken"]'
            ) as HTMLInputElement).value;
        }

        function getFromCookie() {
            if (!csrfCookieName) {
                return null;
            } else {
                return cookie.parse(document.cookie)[csrfCookieName];
            }
        }

        return getFromCookie() || getFromMiddleware();
    }

    function handleMove(e: any) {
        const info = e.move_info;
        const data = {
            target_id: info.target_node.id,
            position: info.position
        };
        const $el = jQuery(info.moved_node.element);

        handleLoading(true, null, $el);

        removeErrorMessage();

        e.preventDefault();

        jQuery.ajax({
            type: "POST",
            url: info.moved_node.move_url,
            data,
            beforeSend: xhr => {
                // Set Django csrf token
                xhr.setRequestHeader("X-CSRFToken", getCsrfToken());
            },
            success: () => {
                info.do_move();
                handleLoading(false, null, $el);
            },
            error: () => {
                handleLoading(false, null, $el);
                const $node = $el.find(".jqtree-element");
                $node.append(
                    `<span class="mptt-admin-error">${gettext(
                        "move failed"
                    )}</span>`
                );

                errorNode = info.moved_node;
            }
        });

        function removeErrorMessage() {
            if (errorNode) {
                jQuery(errorNode.element)
                    .find(".mptt-admin-error")
                    .remove();
                errorNode = null;
            }
        }
    }

    function handleLoadFailed() {
        $tree.html(gettext("Error while loading the data from the server"));
    }

    const spinners: any = {};

    function handleLoading(
        isLoading: boolean,
        node: INode | null,
        $el: JQuery
    ) {
        function getNodeId() {
            if (!node) {
                return "__root__";
            } else {
                return node.id;
            }
        }

        function getContainer() {
            if (node) {
                return $el.find(".jqtree-element")[0];
            } else {
                return $el[0];
            }
        }

        const node_id = getNodeId();

        if (isLoading) {
            spinners[node_id] = new Spinner().spin(getContainer());
        } else {
            const spinner = spinners[node_id];

            if (spinner) {
                spinner.stop();
                spinners[node_id] = null;
            }
        }
    }

    function handleSelect(e: any) {
        const { node, deselected_node } = e;

        if (deselected_node) {
            // deselected node: remove tabindex
            jQuery(deselected_node.element)
                .find(".edit")
                .attr("tabindex", -1);
        }

        if (node) {
            // selected: add tabindex
            jQuery(node.element)
                .find(".edit")
                .attr("tabindex", 0);
        }
    }

    $tree.tree({
        autoOpen,
        autoEscape,
        buttonLeft: rtl,
        closedIcon: rtl ? "&#x25c0;" : "&#x25ba;",
        dragAndDrop: true,
        onCreateLi: createLi,
        onLoadFailed: handleLoadFailed,
        onLoading: handleLoading,
        saveState: $tree.data("save_state"),
        useContextMenu: Boolean($tree.data("use_context_menu"))
    });

    $tree.on("tree.move", handleMove);
    $tree.on("tree.select", handleSelect);
}

function urlToString(url: any) {
    const { pathname, query } = url;
    const querystring = qs.stringify(query);

    if (!querystring) {
        return pathname;
    } else {
        return `${pathname}?${querystring}`;
    }
}

jQuery(() => {
    const $tree = jQuery("#tree");

    if ($tree.length) {
        const autoOpen = $tree.data("auto_open");
        const autoEscape = Boolean($tree.data("autoescape"));
        const rtl = $tree.data("rtl") === "1";
        const csrfCookieName = $tree.data("csrf-cookie-name");

        initTree($tree, autoOpen, autoEscape, rtl, csrfCookieName);
    }
});
