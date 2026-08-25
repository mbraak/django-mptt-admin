import type { Node, TreeEvents } from "html-tree";

import HtmlTree from "html-tree";
import Cookies from "js-cookie";

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

interface MoveEventDetail {
    move_info: {
        do_move: () => void;
        moved_node: Node;
        position: string;
        target_node: Node;
    };
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
    let errorNode: Node | null = null;
    const baseUrl = "http://example.com";
    const insertAtUrlObject = insertAtUrl ? new URL(insertAtUrl, baseUrl) : undefined;

    function createLi(node: Node, liElement: HTMLElement, isSelected: boolean) {
        if (node.id == null) {
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

    function handleMove(eventParam: Event) {
        const e = eventParam as CustomEvent<MoveEventDetail>;
        const info = e.detail.move_info;

        if (!info.moved_node.element) {
            return;
        }

        const htmlElement = info.moved_node.element;

        const body = new URLSearchParams({
            position: info.position,
            target_id: String(info.target_node.id),
        });

        handleLoading();

        removeErrorMessage();

        e.preventDefault();

        function handleError() {
            handleLoaded();
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
                    handleLoaded();
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
        treeElement.textContent = gettext("Error while loading the data from the server");
    }

    const spinners: Record<number | string, HTMLElement | null> = {};

    function getSpinnerId(node: Node | undefined): null | number | string {
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

    function handleLoading(node?: Node) {
        function getContainer() {
            if (node) {
                // display the spinner next to the title of the node
                return node.element?.querySelector(":scope > .jqtree-element");
            } else {
                return treeElement;
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

    function handleLoaded(node?: Node) {
        const spinnerId = getSpinnerId(node);

        if (spinnerId == null) {
            return;
        }

        const spinner = spinners[spinnerId];

        if (spinner) {
            spinner.remove();
        }
    }

    function setEditTabIndex(nodeElement: HTMLElement, tabIndex: number) {
        const editElements = nodeElement.querySelectorAll<HTMLElement>(":scope > .jqtree-element > .edit");

        for (const editElement of editElements) {
            editElement.tabIndex = tabIndex;
        }
    }

    function handleSelect(e: CustomEvent<TreeEvents["tree.select"]>) {
        const { deselectedNode, node } = e.detail;

        if (deselectedNode?.element) {
            // deselected node: remove tabindex
            setEditTabIndex(deselectedNode.element, -1);
        }

        // selected: add tabindex
        /* istanbul ignore else */
        if (node.element) {
            setEditTabIndex(node.element, 0);
        }
    }

    function handleDeselect(e: CustomEvent<TreeEvents["tree.deselect"]>) {
        const { node } = e.detail;

        /* istanbul ignore else */
        if (node.element) {
            setEditTabIndex(node.element, -1);
        }
    }

    function handleLoadingEvent(e: CustomEvent<TreeEvents["tree.loading_data"]>) {
        const { isLoading, node } = e.detail;

        if (isLoading) {
            handleLoading(node ?? undefined);
        }
    }

    function handleLoadDataEvent(e: CustomEvent<TreeEvents["tree.load_data"]>) {
        const { parentNode } = e.detail;

        handleLoaded(parentNode);
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

    treeElement.addEventListener("tree.deselect", handleDeselect);
    treeElement.addEventListener("tree.loading_data", handleLoadingEvent);
    treeElement.addEventListener("tree.load_data", handleLoadDataEvent);
    treeElement.addEventListener("tree.move", handleMove);
    treeElement.addEventListener("tree.select", handleSelect);

    new HtmlTree({
        ...treeOptions,
        classPrefix: "jqtree",
        commonClassName: "jqtree_common",
        htmlElement: treeElement,
        treeClassName: "jqtree-tree"
    })
}

export default initTree;
