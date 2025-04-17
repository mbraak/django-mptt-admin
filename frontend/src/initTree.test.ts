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

import initTree, { InitTreeOptions } from "./initTree";

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
                    url: "/edit/2",
                },
            ],
            id: 1,
            name: "root",
            url: "/edit/1",
        },
    ];

    server.use(
        http.get("/tree", () => HttpResponse.json(treeData)),
        http.get("/no_data", () => new HttpResponse(null, { status: 404 }))
    );

    document.body.innerHTML = "";
});

const createTreeElement = (dataUrl = "/tree") => {
    const treeElement = document.createElement("div");
    treeElement.setAttribute("data-url", dataUrl);
    treeElement.setAttribute("data-insert_at_url", "/add");
    document.body.append(treeElement);

    return treeElement;
};

const initTestTree = (
    treeElement: HTMLElement,
    paramOptions?: Partial<InitTreeOptions>
) => {
    const defaultOptions: InitTreeOptions = {
        animationSpeed: null,
        autoEscape: false,
        autoOpen: false,
        csrfCookieName: "csrf",
        dragAndDrop: false,
        hasAddPermission: true,
        hasChangePermission: true,
        mouseDelay: null,
        rtl: false,
    };

    const $tree = jQuery(treeElement);
    const options = { ...defaultOptions, ...paramOptions };

    initTree($tree, options);
};

test("initializes the tree", async () => {
    initTestTree(createTreeElement());

    expect(await screen.findByRole("tree")).toBeInTheDocument();
    expect(
        screen.getByRole("treeitem", { name: "Africa" })
    ).toBeInTheDocument();
});

test("displays a message when the data cannot be loaded", async () => {
    initTestTree(createTreeElement("/no_data"));

    expect(
        await screen.findByText("Error while loading the data from the server")
    ).toBeInTheDocument();
});

test("adds edit links when hasChangePermission is true", async () => {
    initTestTree(createTreeElement());

    expect(await screen.findByRole("tree")).toBeInTheDocument();

    const editLinks = screen.getAllByRole<HTMLAnchorElement>("link", {
        name: "(edit)",
    });
    expect(editLinks).toHaveLength(2);
    expect(editLinks[0]?.href).toEqual("http://localhost:3000/edit/1");

    expect(screen.queryAllByRole("link", { name: "(view)" })).toHaveLength(0);
});

test("adds view links when hasChangePermission is false", async () => {
    initTestTree(createTreeElement(), { hasChangePermission: false });

    expect(await screen.findByRole("tree")).toBeInTheDocument();

    const editLinks = screen.getAllByRole<HTMLAnchorElement>("link", {
        name: "(view)",
    });
    expect(editLinks).toHaveLength(2);
    expect(editLinks[0]?.href).toEqual("http://localhost:3000/edit/1");

    expect(screen.queryAllByRole("link", { name: "(edit)" })).toHaveLength(0);
});

test("adds add links when hasAddPermission is true", async () => {
    initTestTree(createTreeElement());

    expect(await screen.findByRole("tree")).toBeInTheDocument();

    const addLinks = screen.getAllByRole<HTMLAnchorElement>("link", {
        name: "(add)",
    });
    expect(addLinks).toHaveLength(2);
    expect(addLinks[0]?.href).toEqual("http://localhost:3000/add?insert_at=1");
});

test("doesn't add add links when hasAddPermission is false", async () => {
    initTestTree(createTreeElement(), { hasAddPermission: false });

    expect(await screen.findByRole("tree")).toBeInTheDocument();

    const addLinks = screen.queryAllByRole<HTMLAnchorElement>("link", {
        name: "(add)",
    });
    expect(addLinks).toHaveLength(0);
});
