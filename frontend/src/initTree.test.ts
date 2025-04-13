import { screen } from "@testing-library/dom";
import jQuery from "jquery";
import { expect, test } from "vitest";

import initTree from "./initTree";

test("initializes the tree", () => {
    const treeElement = document.createElement("div");
    document.body.append(treeElement);

    const $tree = jQuery(treeElement);
    initTree($tree, {
        animationSpeed: null,
        autoEscape: false,
        autoOpen: false,
        csrfCookieName: "csrf",
        dragAndDrop: false,
        hasAddPermission: true,
        hasChangePermission: true,
        mouseDelay: null,
        rtl: false,
    });

    expect(screen.getByRole("tree")).toBeInTheDocument();
});
