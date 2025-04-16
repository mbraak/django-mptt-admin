import { screen } from "@testing-library/dom";
import jQuery from "jquery";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    expect,
    test,
} from "vitest";

import initTree from "./initTree";

const server = setupServer();

beforeAll(() => {
    server.listen();
});

afterEach(() => {
    server.resetHandlers();
});

afterAll(() => {
    server.close();
});

beforeEach(() => {
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

    server.use(
        http.get("/tree", () => HttpResponse.json(treeData)),
        http.get("/no_data", () => new HttpResponse(null, { status: 404 }))
    );
});

const createTreeElement = (dataUrl = "/tree") => {
    const treeElement = document.createElement("div");
    treeElement.setAttribute("data-url", dataUrl);
    document.body.append(treeElement);

    return treeElement;
};

const initTestTree = (treeElement: HTMLElement) => {
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
};

test("initializes the tree", async () => {
    initTestTree(createTreeElement());

    expect(await screen.findByRole("tree")).toBeInTheDocument();
    expect(
        await screen.findByRole("treeitem", { name: "Africa" })
    ).toBeInTheDocument();
});

test("displays a message when the data cannot be loaded", async () => {
    initTestTree(createTreeElement("/no_data"));

    expect(
        await screen.findByText("Error while loading the data from the server")
    ).toBeInTheDocument();
});
