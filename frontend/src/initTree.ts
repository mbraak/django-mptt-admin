import Cookies from "js-cookie";
import "jqtree";

export interface InitTreeOptions {
    animationSpeed?: number | string;
    autoEscape: boolean;
    autoOpen: boolean | number;
    csrfCookieName: string;
    dragAndDrop: boolean;
    hasAddPermission: boolean;
    hasChangePermission: boolean;
    insertAtUrl?: string;
    mouseDelay?: number;
    rtl: boolean;
    saveState?: string;
    useContextMenu?: boolean;
}

interface JQTreeLoadDataEvent extends JQuery.Event {
    parent_node: INode | null;
}

interface JQTreeLoadingEvent extends JQuery.Event {
    isLoading: boolean;
    node: INode | null;
}

interface JQTreeMoveEvent extends JQuery.Event {
    move_info: {
        do_move: () => void;
        moved_node: INode;
        position: string;
        target_node: INode;
    };
}

interface JQTreeSelectEvent extends JQuery.Event {
    deselected_node: INode | null;
    node: INode | null;
    previous_node: INode | null;
}

function initTree(
    treeElement: HTMLElement,
    {
        animationSpeed,
        autoEscape,
        autoOpen,
        csrfCookieName,
        dragAndDrop,
        hasAddPermission,
        hasChangePermission,
        insertAtUrl,
        mouseDelay,
        rtl,
        saveState,
        useContextMenu
    }: InitTreeOptions
) {
    let errorNode: INode | null = null;
    const baseUrl = "http://example.com";
    const insertAtUrlObject = insertAtUrl ? new URL(insertAtUrl, baseUrl) : undefined;

    function createLi(node: INode, $li: JQuery, isSelected: boolean) {
        if (node.id == null) {
            return;
        }

        const liElement = $li.get(0);

        /* istanbul ignore if */
        if (!liElement) {
            return;
        }

        const titleElement = liElement.querySelector(":scope > .jqtree-element > .jqtree-title")

        /* istanbul ignore if */
        if (!titleElement) {
            return;
        }

        // Create edit link
        const tabindex = isSelected ? 0 : -1;
        const editCaption = hasChangePermission
            ? gettext("edit")
            : gettext("view");

        const editElement = document.createElement("a");
        editElement.className = "edit";
        editElement.href = node.url as string;
        editElement.tabIndex = tabindex;
        editElement.text = `(${editCaption})`;

        titleElement.after(editElement);

        if (hasAddPermission && insertAtUrlObject) {
            insertAtUrlObject.searchParams.set("insert_at", node.id.toString());

            const insertUrlString = insertAtUrlObject
                .toString()
                .substring(baseUrl.length);

            const addElement = document.createElement("a");
            addElement.className = "edit";
            addElement.href = insertUrlString;
            addElement.tabIndex = tabindex;

            const addCaption = gettext("add");
            addElement.text = `(${addCaption})`;

            titleElement.after(addElement);
        }
    }

    function getCsrfToken() {
        function getFromMiddleware() {
            const inputElement = document.querySelector<HTMLInputElement>(
                '[name="csrfmiddlewaretoken"]'
            );
            return inputElement?.value;
        }

        function getFromCookie() {
            if (!csrfCookieName) {
                return null;
            } else {
                return Cookies.get(csrfCookieName);
            }
        }

        return getFromCookie() ?? getFromMiddleware() ?? "";
    }

    function handleMove(eventParam: JQuery.Event) {
        const e = eventParam as JQTreeMoveEvent;
        const info = e.move_info;

        if (!info.moved_node.element) {
            return;
        }

        const htmlElement = info.moved_node.element;

        const body = new URLSearchParams({
            position: info.position,
            target_id: String(info.target_node.id),
        });

        handleLoading(null);

        removeErrorMessage();

        e.preventDefault();

        function handleError() {
            handleLoaded(null);
            const errorElement = document.createElement("span");
            errorElement.className = "mptt-admin-error";
            errorElement.textContent = gettext("move failed");

            const nodeElement = htmlElement.querySelector(":scope > .jqtree-element");
            nodeElement?.append(errorElement);

            errorNode = info.moved_node;
        }

        void fetch(info.moved_node.move_url as string, {
            body,
            headers: {
                // Set Django csrf token
                "X-CSRFToken": getCsrfToken(),
            },
            method: "POST",
        }).then(
            (response) => {
                if (response.ok) {
                    info.do_move();
                    handleLoaded(null);
                } else {
                    handleError();
                }
            },
            () => {
                handleError();
            }
        );

        function removeErrorMessage() {
            if (errorNode?.element) {
                const errorElement = errorNode.element.querySelector(":scope > .jqtree-element > .mptt-admin-error");
                errorElement?.remove();
                errorNode = null;
            }
        }
    }

    function handleLoadFailed() {
        const treeElement = $tree.get(0);

        /* istanbul ignore if */
        if (!treeElement) {
            return;
        }

        treeElement.textContent = gettext("Error while loading the data from the server");
    }

    const spinners: Record<number | string, HTMLElement | null> = {};

    function getSpinnerId(node: INode | null): null | number | string {
        if (!node) {
            return "__root__";
        } else {
            if (node.id == null) {
                return null;
            } else {
                return node.id;
            }
        }
    }

    function handleLoading(node: INode | null) {
        function getContainer() {
            if (node) {
                return node.element;
            } else {
                return $tree.get(0);
            }
        }

        const container = getContainer();
        const spinnerId = getSpinnerId(node);

        if (!container || spinnerId == null) {
            return;
        }

        const spinner = document.createElement("span");
        spinner.className = "jqtree-spin";
        container.append(spinner);
        spinners[spinnerId] = spinner;
    }

    function handleLoaded(node: INode | null) {
        const spinnerId = getSpinnerId(node);

        if (spinnerId == null) {
            return;
        }

        const spinner = spinners[spinnerId];

        if (spinner) {
            spinner.remove();
        }
    }

    function handleSelect(eventParam: JQuery.Event) {
        const e = eventParam as JQTreeSelectEvent;
        const { deselected_node, node, previous_node } = e;

        const deselectedElement = deselected_node?.element ?? previous_node?.element;
        if (deselectedElement) {
            // deselected node: remove tabindex
            const editElements = deselectedElement.querySelectorAll<HTMLElement>(":scope > .jqtree-element > .edit");

            for (const editElement of editElements) {
                editElement.tabIndex = -1;
            }
        }

        // selected: add tabindex
        if (node?.element) {
            const editElements = node.element.querySelectorAll<HTMLElement>(":scope > .jqtree-element > .edit");

            for (const editElement of editElements) {
                editElement.tabIndex = 0;
            }
        }
    }

    function handleLoadingEvent(e: JQuery.Event) {
        const { isLoading, node } = e as JQTreeLoadingEvent;

        if (isLoading) {
            handleLoading(node);
        }
    }

    function handleLoadDataEvent(e: JQuery.Event) {
        const { parent_node } = e as JQTreeLoadDataEvent;

        handleLoaded(parent_node);
    }

    const treeOptions: Record<string, unknown> = {
        autoEscape,
        autoOpen,
        buttonLeft: rtl,
        closedIcon: rtl ? "&#x25c0;" : "&#x25ba;",
        dragAndDrop: dragAndDrop && hasChangePermission,
        onCreateLi: createLi,
        onLoadFailed: handleLoadFailed,
        saveState,
        useContextMenu,
    };

    if (animationSpeed !== undefined) {
        treeOptions.animationSpeed = animationSpeed;
    }

    if (mouseDelay != null) {
        treeOptions.startDndDelay = mouseDelay;
    }

    const $tree = jQuery(treeElement);

    $tree.on("tree.loading_data", handleLoadingEvent);
    $tree.on("tree.load_data", handleLoadDataEvent);
    $tree.on("tree.move", handleMove);
    $tree.on("tree.select", handleSelect);

    $tree.tree(treeOptions);
}

export default initTree;
