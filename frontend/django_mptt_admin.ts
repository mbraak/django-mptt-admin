import "jqtree";
import * as cookie from "cookie";

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
interface JQTreeMoveEvent extends JQuery.Event {
    move_info: {
        do_move: () => void;
        moved_node: INode;
        position: string;
        target_node: INode;
    };
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
interface JQTreeSelectEvent extends JQuery.Event {
    deselected_node: INode | null;
    node: INode;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
interface JQTreeLoadingEvent extends JQuery.Event {
    isLoading: boolean;
    node: INode | null;
}

interface Parameters {
    animationSpeed: number | string | null;
    autoEscape: boolean;
    autoOpen: boolean | number;
    csrfCookieName: string;
    dragAndDrop: boolean;
    hasAddPermission: boolean;
    hasChangePermission: boolean;
    mouseDelay: number | null;
    rtl: boolean;
}

function initTree(
    $tree: JQuery,
    {
        animationSpeed,
        autoEscape,
        autoOpen,
        csrfCookieName,
        dragAndDrop,
        hasAddPermission,
        hasChangePermission,
        mouseDelay,
        rtl,
    }: Parameters
) {
    let errorNode: INode | null = null;
    const baseUrl = "http://example.com";
    const insertAtUrl = new URL($tree.data("insert_at_url") as string, baseUrl);

    function createLi(node: INode, $li: JQuery, isSelected: boolean) {
        // Create edit link
        const $title = $li.find(".jqtree-title");

        insertAtUrl.searchParams.set(
            "insert_at",
            `${node.id as string | number}`
        );

        const insertUrlString = insertAtUrl
            .toString()
            .substring(baseUrl.length);

        const tabindex = isSelected ? "0" : "-1";
        const editCaption = hasChangePermission
            ? gettext("edit")
            : gettext("view");

        $title.after(
            `<a href="${
                node.url as string
            }" class="edit" tabindex="${tabindex}">(${editCaption})</a>`,
            hasAddPermission
                ? `<a href="${insertUrlString}" class="edit" tabindex="${tabindex}">(${gettext(
                      "add"
                  )})</a>`
                : ""
        );
    }

    function getCsrfToken() {
        function getFromMiddleware() {
            return (
                document.querySelector(
                    '[name="csrfmiddlewaretoken"]'
                ) as HTMLInputElement
            ).value;
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
            position: info.position,
            target_id: info.target_node.id,
        };
        const $el = jQuery(info.moved_node.element);

        handleLoading(true, null);

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
                handleLoading(false, null);
            },
            error: () => {
                handleLoading(false, null);
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

    const spinners: Record<number | string, HTMLElement | null> = {};

    function handleLoading(isLoading: boolean, node: INode | null) {
        function getNodeId(): string | number {
            if (!node) {
                return "__root__";
            } else {
                return node.id as string | number;
            }
        }

        function getContainer() {
            if (node) {
                return node.element;
            } else {
                return $tree.get(0) as HTMLElement;
            }
        }

        const nodeId = getNodeId();

        if (isLoading) {
            const container = getContainer();
            const spinner = document.createElement("span");
            spinner.className = "jqtree-spin";
            container.append(spinner);

            spinners[nodeId] = spinner;
        } else {
            const spinner = spinners[nodeId];

            if (spinner) {
                spinner.remove();
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

    function handleLoadingEvent(e: JQuery.Event) {
        const { isLoading, node } = e as JQTreeLoadingEvent;

        handleLoading(isLoading, node);
    }

    const treeOptions: Record<string, unknown> = {
        autoOpen,
        autoEscape,
        buttonLeft: rtl,
        closedIcon: rtl ? "&#x25c0;" : "&#x25ba;",
        dragAndDrop: dragAndDrop && hasChangePermission,
        onCreateLi: createLi,
        onLoadFailed: handleLoadFailed,
        saveState: $tree.data("save_state") as boolean,
        useContextMenu: Boolean($tree.data("use_context_menu")),
    };

    if (animationSpeed !== null) {
        treeOptions["animationSpeed"] = animationSpeed;
    }

    if (mouseDelay != null) {
        treeOptions["startDndDelay"] = mouseDelay;
    }

    $tree.on("tree.loading_data", handleLoadingEvent);
    $tree.on("tree.move", handleMove);
    $tree.on("tree.select", handleSelect);

    $tree.tree(treeOptions);
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
        const hasAddPermission = Boolean($tree.data("has-add-permission"));
        const hasChangePermission = Boolean(
            $tree.data("has-change-permission")
        );
        const mouseDelay = $tree.data("tree-mouse-delay") as number | null;
        const dragAndDrop = $tree.data("drag-and-drop") as boolean;
        const rtl = $tree.data("rtl") === "1";
        const csrfCookieName = $tree.data("csrf-cookie-name") as string;

        initTree($tree, {
            animationSpeed,
            autoOpen,
            autoEscape,
            csrfCookieName,
            dragAndDrop,
            hasAddPermission,
            hasChangePermission,
            mouseDelay,
            rtl,
        });
    }
});
