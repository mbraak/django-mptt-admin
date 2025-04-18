import initTree from "./initTree";

jQuery(() => {
    const $tree = jQuery("#tree");

    if ($tree.length) {
        const animationSpeed = $tree.data("tree-animation-speed") as
            | null
            | number
            | string;
        const autoOpen = $tree.data("auto_open") as boolean | number;
        const autoEscape = Boolean($tree.data("autoescape"));
        const hasAddPermission = Boolean($tree.data("has-add-permission"));
        const hasChangePermission = Boolean(
            $tree.data("has-change-permission")
        );
        const mouseDelay = $tree.data("tree-mouse-delay") as null | number;
        const dragAndDrop = $tree.data("drag-and-drop") as boolean;
        const rtl = $tree.data("rtl") === "1";
        const csrfCookieName = $tree.data("csrf-cookie-name") as string;

        initTree($tree, {
            animationSpeed,
            autoEscape,
            autoOpen,
            csrfCookieName,
            dragAndDrop,
            hasAddPermission,
            hasChangePermission,
            mouseDelay,
            rtl,
        });
    }
});
