import { beforeEach, describe, expect, test } from "vitest";

import parseTreeOptions from "./parseTreeOptions";

const createTreeElement = (attributes: Record<string, string> = {}) => {
    const treeElement = document.createElement("div");

    for (const [name, value] of Object.entries(attributes)) {
        treeElement.setAttribute(name, value);
    }

    document.body.append(treeElement);

    return treeElement;
};

beforeEach(() => {
    document.body.innerHTML = "";
});

test("returns the default options for an element without data attributes", () => {
    expect(parseTreeOptions(createTreeElement())).toEqual({
        animationSpeed: undefined,
        autoEscape: true,
        autoOpen: false,
        csrfCookieName: "csrf",
        dragAndDrop: false,
        hasAddPermission: false,
        hasChangePermission: false,
        insertAtUrl: undefined,
        mouseDelay: undefined,
        rtl: false,
        saveState: undefined,
        useContextMenu: undefined,
    });
});

test("parses all data attributes", () => {
    const treeElement = createTreeElement({
        "data-auto_open": "2",
        "data-autoescape": "false",
        "data-csrf-cookie-name": "my_csrf",
        "data-drag-and-drop": "true",
        "data-has-add-permission": "true",
        "data-has-change-permission": "true",
        "data-insert_at_url": "/add",
        "data-rtl": "1",
        "data-save_state": "myapp_mymodel",
        "data-tree-animation-speed": "300",
        "data-tree-mouse-delay": "500",
        "data-use_context_menu": "true",
    });

    expect(parseTreeOptions(treeElement)).toEqual({
        animationSpeed: 300,
        autoEscape: false,
        autoOpen: 2,
        csrfCookieName: "my_csrf",
        dragAndDrop: true,
        hasAddPermission: true,
        hasChangePermission: true,
        insertAtUrl: "/add",
        mouseDelay: 500,
        rtl: true,
        saveState: "myapp_mymodel",
        useContextMenu: true,
    });
});

describe("animationSpeed", () => {
    test.each([
        ["300", 300],
        ["fast", "fast"],
        ["", undefined],
    ])("parses %o as %o", (value, expected) => {
        const treeElement = createTreeElement({
            "data-tree-animation-speed": value,
        });

        expect(parseTreeOptions(treeElement).animationSpeed).toEqual(expected);
    });
});

describe("autoOpen", () => {
    test.each([
        ["0", 0],
        ["2", 2],
        ["true", true],
        ["false", false],
        ["", false],
    ])("parses %o as %o", (value, expected) => {
        const treeElement = createTreeElement({ "data-auto_open": value });

        expect(parseTreeOptions(treeElement).autoOpen).toEqual(expected);
    });
});

describe("autoEscape", () => {
    test.each([
        ["true", true],
        ["false", false],
        ["", true],
    ])("parses %o as %o", (value, expected) => {
        const treeElement = createTreeElement({ "data-autoescape": value });

        expect(parseTreeOptions(treeElement).autoEscape).toEqual(expected);
    });
});

describe("csrfCookieName", () => {
    // an empty attribute means that the csrf token is not in a cookie
    // (Django's CSRF_USE_SESSIONS), so it must not fall back to the default
    test("keeps an empty attribute empty", () => {
        const treeElement = createTreeElement({ "data-csrf-cookie-name": "" });

        expect(parseTreeOptions(treeElement).csrfCookieName).toEqual("");
    });

    test("uses the value of the attribute", () => {
        const treeElement = createTreeElement({
            "data-csrf-cookie-name": "other_csrf",
        });

        expect(parseTreeOptions(treeElement).csrfCookieName).toEqual(
            "other_csrf"
        );
    });
});

describe("dragAndDrop", () => {
    test.each([
        ["true", true],
        ["false", false],
        ["", false],
    ])("parses %o as %o", (value, expected) => {
        const treeElement = createTreeElement({ "data-drag-and-drop": value });

        expect(parseTreeOptions(treeElement).dragAndDrop).toEqual(expected);
    });
});

describe("hasAddPermission", () => {
    test.each([
        ["true", true],
        ["false", false],
        ["", false],
    ])("parses %o as %o", (value, expected) => {
        const treeElement = createTreeElement({
            "data-has-add-permission": value,
        });

        expect(parseTreeOptions(treeElement).hasAddPermission).toEqual(expected);
    });
});

describe("hasChangePermission", () => {
    test.each([
        ["true", true],
        ["false", false],
        ["", false],
    ])("parses %o as %o", (value, expected) => {
        const treeElement = createTreeElement({
            "data-has-change-permission": value,
        });

        expect(parseTreeOptions(treeElement).hasChangePermission).toEqual(
            expected
        );
    });
});

describe("mouseDelay", () => {
    test.each([
        ["500", 500],
        ["fast", undefined],
        ["", undefined],
    ])("parses %o as %o", (value, expected) => {
        const treeElement = createTreeElement({
            "data-tree-mouse-delay": value,
        });

        expect(parseTreeOptions(treeElement).mouseDelay).toEqual(expected);
    });
});

describe("rtl", () => {
    // the template renders the attribute without a value, so its presence
    // is what enables rtl
    test.each([
        ["1", true],
        ["", true],
    ])("parses %o as %o", (value, expected) => {
        const treeElement = createTreeElement({ "data-rtl": value });

        expect(parseTreeOptions(treeElement).rtl).toEqual(expected);
    });

    test("is false when the attribute is missing", () => {
        expect(parseTreeOptions(createTreeElement()).rtl).toBe(false);
    });
});

describe("useContextMenu", () => {
    test.each([
        ["true", true],
        ["false", false],
        ["", undefined],
    ])("parses %o as %o", (value, expected) => {
        const treeElement = createTreeElement({
            "data-use_context_menu": value,
        });

        expect(parseTreeOptions(treeElement).useContextMenu).toEqual(expected);
    });
});
