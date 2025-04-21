import { screen, waitFor } from "@testing-library/dom";
import * as cookie from "cookie";
import jQuery from "jquery";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
    vi,
} from "vitest";

import initTree, { InitTreeOptions } from "./initTree";

const defaultTreeData = [
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
let treeData = {};
let csrfTokenInRquest: null | string = null;

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
    treeData = defaultTreeData;
    csrfTokenInRquest = null;

    server.use(
        http.get("/tree", () => HttpResponse.json(treeData)),
        http.get("/no_data", () => new HttpResponse(null, { status: 404 })),
        http.post("/move", ({ request }) => {
            csrfTokenInRquest = request.headers.get("X-CSRFToken");
            return HttpResponse.json({});
        })
    );

    document.body.innerHTML = "";
    document.cookie = cookie.serialize("csrf", "", {
        expires: new Date("1970-01-01"),
    });
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

    const addLinks = screen.queryAllByRole("link", {
        name: "(add)",
    });
    expect(addLinks).toHaveLength(0);
});

test("doesn't add links without node ids", async () => {
    treeData = [
        {
            children: [
                {
                    name: "Africa",
                    url: "/edit/2",
                },
            ],
            name: "root",
            url: "/edit/1",
        },
    ];

    initTestTree(createTreeElement());

    expect(await screen.findByRole("tree")).toBeInTheDocument();
    expect(
        screen.getByRole("treeitem", { name: "Africa" })
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
});

test("renders a link for a closed node with rtl is false", async () => {
    initTestTree(createTreeElement());

    expect(await screen.findByRole("tree")).toBeInTheDocument();
    expect(screen.getByText("►")).toBeInTheDocument();
});

test("renders a link for a closed node with rtl is true", async () => {
    initTestTree(createTreeElement(), { rtl: true });

    expect(await screen.findByRole("tree")).toBeInTheDocument();
    expect(screen.getByText("◀")).toBeInTheDocument();
});

describe("tree.move event", () => {
    const triggerTreeMove = (treeElement: HTMLElement) => {
        const doMove = vi.fn();
        const africaElement = screen.getByRole("treeitem", { name: "Africa" });
        const movedNode = {
            element: africaElement,
            id: 1,
            move_url: "/move",
        };
        const targetNode = {
            id: 2,
        };

        const move_info = {
            do_move: doMove,
            moved_node: movedNode,
            original_event: {},
            position: "after",
            previous_parent: null,
            target_node: targetNode,
        };

        jQuery(treeElement).trigger(jQuery.Event("tree.move", { move_info }));

        return doMove;
    };

    test("calls do_move", async () => {
        const treeElement = createTreeElement();
        initTestTree(treeElement);
        expect(await screen.findByRole("tree")).toBeInTheDocument();

        const doMove = triggerTreeMove(treeElement);

        await waitFor(() => {
            expect(doMove).toHaveBeenCalled();
        });
    });

    test("sets the csrf cookie with a crsf cookie", async () => {
        document.cookie = cookie.serialize("csrf", "csrf1");

        const treeElement = createTreeElement();
        initTestTree(treeElement);
        expect(await screen.findByRole("tree")).toBeInTheDocument();

        const doMove = triggerTreeMove(treeElement);

        await waitFor(() => {
            expect(doMove).toHaveBeenCalled();
        });
        expect(csrfTokenInRquest).toEqual("csrf1");
    });

    test("sets the csrf cookie with a crsf cookie and a csrfCookieName parameter", async () => {
        document.cookie = cookie.serialize("otherName", "value1");

        const treeElement = createTreeElement();
        initTestTree(treeElement, { csrfCookieName: "otherName" });
        expect(await screen.findByRole("tree")).toBeInTheDocument();

        const doMove = triggerTreeMove(treeElement);

        await waitFor(() => {
            expect(doMove).toHaveBeenCalled();
        });
        expect(csrfTokenInRquest).toEqual("value1");
    });

    test("sets the csrf cookie with a crsf cookie and an empty csrfCookieName parameter", async () => {
        document.cookie = cookie.serialize("csrf", "testcsrf");

        const treeElement = createTreeElement();
        initTestTree(treeElement, { csrfCookieName: undefined });
        expect(await screen.findByRole("tree")).toBeInTheDocument();

        const doMove = triggerTreeMove(treeElement);

        await waitFor(() => {
            expect(doMove).toHaveBeenCalled();
        });
        expect(csrfTokenInRquest).toEqual("");
    });

    test("sets the csrf cookie with a hidden csrf input", async () => {
        const csrfInput = document.createElement("input");
        csrfInput.setAttribute("name", "csrfmiddlewaretoken");
        csrfInput.setAttribute("value", "csrf_test");
        csrfInput.setAttribute("type", "hidden");
        document.body.append(csrfInput);

        const treeElement = createTreeElement();
        initTestTree(treeElement);
        expect(await screen.findByRole("tree")).toBeInTheDocument();

        const doMove = triggerTreeMove(treeElement);

        await waitFor(() => {
            expect(doMove).toHaveBeenCalled();
        });
        expect(csrfTokenInRquest).toEqual("csrf_test");
    });
});
