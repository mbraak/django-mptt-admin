import initTree from "./initTree";

const parseAnimationSpeed = (value?: string) => {
    const numberValue = parseNumber(value);

    if (numberValue === undefined) {
        return value;
    } else {
        return numberValue;
    }
}

const parseAutoOpen = (value?: string) => {
    return parseNumber(value) ?? parseBoolean(value);
}

const parseBoolean = (value?: string) => {
    switch (value) {
        case "false":
            return false;
        case "true":
            return true;
        default:
            return undefined;
    }
}

const parseNumber = (value?: string) => {
    if (!value) {
        return undefined;
    }

    const numberValue = parseInt(value);

    if (isNaN(numberValue)) {
        return undefined;
    } else {
        return numberValue;
    }
}

addEventListener("DOMContentLoaded", () => {
    const treeElement = document.getElementById("tree");

    if (treeElement) {
        const animationSpeed = parseAnimationSpeed(treeElement.dataset["tree-animation-speed"]);

        const autoOpen = parseAutoOpen(treeElement.dataset.auto_open) ?? false;
        const autoEscape = parseBoolean(treeElement.dataset.autoescape) ?? true;
        const csrfCookieName = treeElement.dataset["csrf-cookie-name"] ?? "csrf";
        const dragAndDrop = parseBoolean(treeElement.dataset["drag-and-drop"]) ?? false;
        const hasAddPermission = parseBoolean(treeElement.dataset["has-add-permission"]) ?? false;
        const hasChangePermission = parseBoolean(treeElement.dataset["has-change-permission"]) ?? false;
        const insertAtUrl = treeElement.dataset.insert_at_url;
        const mouseDelay = parseNumber(treeElement.dataset["tree-mouse-delay"]);
        const rtl = treeElement.dataset.rtl === "1";
        const saveState = treeElement.dataset.save_state;
        const useContextMenu = parseBoolean(treeElement.dataset.use_context_menu);

        initTree(
            treeElement,
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
            }
        );
    }
});
