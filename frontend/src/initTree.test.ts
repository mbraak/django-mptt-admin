import { screen } from "@testing-library/dom";
import jQuery from "jquery";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, expect, test } from "vitest";

import initTree from "./initTree";

const server = setupServer();
const treeData = [
    {
        children: [
            {
                id: 2,
                name: "Africa",
            },
        ],
        id: 1,
        name: "root",
    },
];
server.use(http.get("/tree", () => new HttpResponse(JSON.stringify(treeData))));

beforeAll(() => {
    server.listen();
});

afterEach(() => {
    server.resetHandlers();
});

afterAll(() => {
    server.close();
});

test("initializes the tree", async () => {
    window.gettext = (key) => key;

    const treeElement = document.createElement("div");
    treeElement.setAttribute("data-url", "/tree");
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

    expect(await screen.findByRole("tree")).toBeInTheDocument();
    expect(
        await screen.findByRole("treeitem", { name: "Africa" })
    ).toBeInTheDocument();
});
