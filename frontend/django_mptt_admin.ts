import "jqtree";
import { Spinner } from "spin.js";
import * as cookie from "cookie";
import * as URL from "url-parse";
import * as qs from "querystringify";

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
interface JQTreeMoveEvent extends JQuery.Event {
    move_info: {
        moved_node: INode;
        position: string;
        target_node: INode;
        do_move: () => void;
    };
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
interface JQTreeSelectEvent extends JQuery.Event {
    deselected_node: INode | null;
    node: INode;
}

interface Parameters {
    animationSpeed: number | string | null;
    autoOpen: boolean | number;
    autoEscape: boolean;
    csrfCookieName: string;
    mouseDelay: number | null;
    rtl: boolean;
}

function initTree(
    $tree: JQuery,
    {
        animationSpeed,
        autoOpen,
        autoEscape,
        csrfCookieName,
        mouseDelay,
        rtl,
    }: Parameters
) {
    let errorNode: INode | null = null;
    const insertAtUrl = new URL($tree.data("insert_at_url"), true);

    function createLi(node: INode, $li: JQuery, isSelected: boolean) {
        // Create edit link
        const $title = $li.find(".jqtree-title");

        insertAtUrl.query.insert_at = `${node.id as string | number}`;

        const insertUrlString = urlToString(insertAtUrl);

        const tabindex = isSelected ? "0" : "-1";

        $title.after(
            `<a href="${
                node.url as string
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

    function handleMove(eventParam: JQuery.Event) {
        const e = eventParam as JQTreeMoveEvent;
        const info = e.move_info;
        const data = {
            target_id: info.target_node.id,
            position: info.position,
        };
        const $el = jQuery(info.moved_node.element);

        handleLoading(true, null, $el);

        removeErrorMessage();

        e.preventDefault();

        void jQuery.ajax({
            type: "POST",
            url: info.moved_node.move_url as string,
            data,
            beforeSend: (xhr) => {
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
            },
        });

        function removeErrorMessage() {
            if (errorNode) {
                jQuery(errorNode.element).find(".mptt-admin-error").remove();
                errorNode = null;
            }
        }
    }

    function handleLoadFailed() {
        $tree.html(gettext("Error while loading the data from the server"));
    }

    const spinners: Record<number | string, Spinner | null> = {};

    function handleLoading(
        isLoading: boolean,
        node: INode | null,
        $el: JQuery
    ) {
        function getNodeId(): string | number {
            if (!node) {
                return "__root__";
            } else {
                return node.id as string | number;
            }
        }

        function getContainer() {
            if (node) {
                return $el.find(".jqtree-element")[0];
            } else {
                return $el[0];
            }
        }

        const nodeId = getNodeId();

        if (isLoading) {
            spinners[nodeId] = new Spinner().spin(getContainer());
        } else {
            const spinner = spinners[nodeId];

            if (spinner) {
                spinner.stop();
                spinners[nodeId] = null;
            }
        }
    }

    function handleSelect(eventParam: JQuery.Event) {
        const e = eventParam as JQTreeSelectEvent;
        const { node, deselected_node } = e;

        if (deselected_node) {
            // deselected node: remove tabindex
            jQuery(deselected_node.element).find(".edit").attr("tabindex", -1);
        }

        if (node) {
            // selected: add tabindex
            jQuery(node.element).find(".edit").attr("tabindex", 0);
        }
    }

    const treeOptions: Record<string, unknown> = {
        autoOpen,
        autoEscape,
        buttonLeft: rtl,
        closedIcon: rtl ? "&#x25c0;" : "&#x25ba;",
        dragAndDrop: true,
        onCreateLi: createLi,
        onLoadFailed: handleLoadFailed,
        onLoading: handleLoading,
        saveState: $tree.data("save_state") as boolean,
        useContextMenu: Boolean($tree.data("use_context_menu")),
    };

    if (animationSpeed !== null) {
        treeOptions["animationSpeed"] = animationSpeed;
    }

    $tree.tree(treeOptions);

    $tree.on("tree.move", handleMove);
    $tree.on("tree.select", handleSelect);
    console.log({ mouseDelay });

    if (mouseDelay != null) {
        $tree.tree("setMouseDelay", mouseDelay);
    }
}

function urlToString(url: URL): string {
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
        const animationSpeed = $tree.data("tree-animation-speed") as
            | number
            | string
            | null;
        const autoOpen = $tree.data("auto_open") as boolean | number;
        const autoEscape = Boolean($tree.data("autoescape"));
        const mouseDelay = $tree.data("tree-mouse-delay") as number | null;
        const rtl = $tree.data("rtl") === "1";
        const csrfCookieName = $tree.data("csrf-cookie-name") as string;

        initTree($tree, {
            animationSpeed,
            autoOpen,
            autoEscape,
            csrfCookieName,
            mouseDelay,
            rtl,
        });
    }
});
