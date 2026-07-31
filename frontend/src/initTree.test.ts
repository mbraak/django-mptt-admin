import { screen, waitFor, within } from "@testing-library/dom";
import { jQuery } from "jquery";
import Cookies from 'js-cookie';
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
let csrfTokenInRequest: null | string = null;

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
    csrfTokenInRequest = null;

    server.use(
        http.get("/tree", () => HttpResponse.json(treeData)),
        http.get("/no_data", () => new HttpResponse(null, { status: 404 })),
        http.post("/move", ({ request }) => {
            csrfTokenInRequest = request.headers.get("X-CSRFToken");
            return HttpResponse.json({});
        })
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

const getNodeElement = (name: string): HTMLElement => {
    const nodeElement = screen.getByRole("treeitem", { name }).closest("li");

    if (!nodeElement) {
        throw new Error(`Node element not found for '${name}'`);
    }

    return nodeElement;
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
    const triggerTreeMove = (
        treeElement: HTMLElement,
        movedNodeOverrides?: { element?: HTMLElement; move_url?: string }
    ) => {
        const doMove = vi.fn();
        const movedNode = {
            element: getNodeElement("Africa"),
            id: 1,
            move_url: "/move",
            ...movedNodeOverrides,
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

    test("sends a move request to the server", async () => {
        const moveRequests: { body: string; url: string }[] = [];

        server.use(
            http.post("/move", async ({ request }) => {
                moveRequests.push({
                    body: await request.text(),
                    url: request.url,
                });
                return HttpResponse.json({});
            })
        );

        const treeElement = createTreeElement();
        initTestTree(treeElement);
        expect(await screen.findByRole("tree")).toBeInTheDocument();

        triggerTreeMove(treeElement);

        await waitFor(() => {
            expect(moveRequests).toHaveLength(1);
        });
        expect(moveRequests[0]).toEqual({
            body: "position=after&target_id=2",
            url: "http://localhost:3000/move",
        });
    });

    test("doesn't send a request when the moved node has no element", async () => {
        const requestPaths: string[] = [];

        server.use(
            http.post("*", ({ request }) => {
                requestPaths.push(new URL(request.url).pathname);
                return HttpResponse.json({});
            })
        );

        const treeElement = createTreeElement();
        initTestTree(treeElement);
        expect(await screen.findByRole("tree")).toBeInTheDocument();

        // this move is ignored, because the node has no element
        triggerTreeMove(treeElement, {
            element: undefined,
            move_url: "/move_without_element",
        });

        // do a second move that is valid; when its request is handled, a
        // request for the first move would already have been recorded
        const doMove = triggerTreeMove(treeElement);

        await waitFor(() => {
            expect(doMove).toHaveBeenCalled();
        });
        expect(requestPaths).toEqual(["/move"]);
    });

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
        Cookies.set("csrf", "csrf1");

        const treeElement = createTreeElement();
        initTestTree(treeElement);
        expect(await screen.findByRole("tree")).toBeInTheDocument();

        const doMove = triggerTreeMove(treeElement);

        await waitFor(() => {
            expect(doMove).toHaveBeenCalled();
        });
        expect(csrfTokenInRequest).toEqual("csrf1");
    });

    test("sets the csrf cookie with a crsf cookie and a csrfCookieName parameter", async () => {
        Cookies.remove('csrf');
        Cookies.set("otherName", "value1");

        const treeElement = createTreeElement();
        initTestTree(treeElement, { csrfCookieName: "otherName" });
        expect(await screen.findByRole("tree")).toBeInTheDocument();

        const doMove = triggerTreeMove(treeElement);

        await waitFor(() => {
            expect(doMove).toHaveBeenCalled();
        });
        expect(csrfTokenInRequest).toEqual("value1");
    });

    test("sets the csrf cookie with a crsf cookie and an empty csrfCookieName parameter", async () => {
        Cookies.set("csrf", "testcsrf");

        const treeElement = createTreeElement();
        initTestTree(treeElement, { csrfCookieName: undefined });
        expect(await screen.findByRole("tree")).toBeInTheDocument();

        const doMove = triggerTreeMove(treeElement);

        await waitFor(() => {
            expect(doMove).toHaveBeenCalled();
        });
        expect(csrfTokenInRequest).toEqual("");
    });

    test("displays an error message when the move fails", async () => {
        server.use(
            http.post("/move", () => new HttpResponse(null, { status: 500 }))
        );

        const treeElement = createTreeElement();
        initTestTree(treeElement);
        expect(await screen.findByRole("tree")).toBeInTheDocument();

        const doMove = triggerTreeMove(treeElement);

        const africaElement = getNodeElement("Africa");
        expect(
            await within(africaElement).findByText("move failed")
        ).toBeInTheDocument();
        expect(doMove).not.toHaveBeenCalled();
    });

    test("removes the error message when the node is moved again", async () => {
        server.use(
            http.post("/move", () => new HttpResponse(null, { status: 500 }))
        );

        const treeElement = createTreeElement();
        initTestTree(treeElement);
        expect(await screen.findByRole("tree")).toBeInTheDocument();

        triggerTreeMove(treeElement);
        expect(await screen.findByText("move failed")).toBeInTheDocument();

        server.use(http.post("/move", () => HttpResponse.json({})));

        const doMove = triggerTreeMove(treeElement);

        expect(screen.queryByText("move failed")).not.toBeInTheDocument();

        await waitFor(() => {
            expect(doMove).toHaveBeenCalled();
        });
    });

    test("sets the csrf cookie with a hidden csrf input", async () => {
        Cookies.remove('csrf');

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
        expect(csrfTokenInRequest).toEqual("csrf_test");
    });
});

describe("tree.select event", () => {
    const getNodeLinks = (nodeElement: HTMLElement) => {
        const elementDiv = nodeElement.querySelector<HTMLElement>(
            ":scope > .jqtree-element"
        );

        if (!elementDiv) {
            throw new Error("Element div not found");
        }

        return {
            addLink: within(elementDiv).getByRole("link", { name: "(add)" }),
            editLink: within(elementDiv).getByRole("link", { name: "(edit)" }),
        };
    };

    const triggerTreeSelect = (
        treeElement: HTMLElement,
        {
            deselected_node = null,
            node = null,
            previous_node = null,
        }: {
            deselected_node?: null | object;
            node?: null | object;
            previous_node?: null | object;
        }
    ) => {
        jQuery(treeElement).trigger(
            jQuery.Event("tree.select", { deselected_node, node, previous_node })
        );
    };

    test("sets the tabindex of the edit links when a node is selected", async () => {
        const treeElement = createTreeElement();
        initTestTree(treeElement);
        expect(await screen.findByRole("tree")).toBeInTheDocument();

        const africaElement = getNodeElement("Africa");
        const editLink = within(africaElement).getByRole("link", {
            name: "(edit)",
        });
        const addLink = within(africaElement).getByRole("link", {
            name: "(add)",
        });

        expect(editLink).toHaveAttribute("tabindex", "-1");
        expect(addLink).toHaveAttribute("tabindex", "-1");

        triggerTreeSelect(treeElement, {
            node: { element: africaElement, id: 2 },
        });

        expect(editLink).toHaveAttribute("tabindex", "0");
        expect(addLink).toHaveAttribute("tabindex", "0");
    });

    test("resets the tabindex of the edit links when a node is deselected", async () => {
        const treeElement = createTreeElement();
        initTestTree(treeElement);
        expect(await screen.findByRole("tree")).toBeInTheDocument();

        const africaElement = getNodeElement("Africa");
        const { addLink, editLink } = getNodeLinks(africaElement);

        triggerTreeSelect(treeElement, {
            node: { element: africaElement, id: 2 },
        });

        expect(editLink).toHaveAttribute("tabindex", "0");
        expect(addLink).toHaveAttribute("tabindex", "0");

        triggerTreeSelect(treeElement, {
            deselected_node: { element: africaElement, id: 2 },
        });

        expect(editLink).toHaveAttribute("tabindex", "-1");
        expect(addLink).toHaveAttribute("tabindex", "-1");
    });

    test("resets the tabindex of the edit links using previous_node when deselected_node is empty", async () => {
        const treeElement = createTreeElement();
        initTestTree(treeElement);
        expect(await screen.findByRole("tree")).toBeInTheDocument();

        const africaElement = getNodeElement("Africa");
        const { addLink, editLink } = getNodeLinks(africaElement);

        triggerTreeSelect(treeElement, {
            node: { element: africaElement, id: 2 },
        });

        expect(editLink).toHaveAttribute("tabindex", "0");
        expect(addLink).toHaveAttribute("tabindex", "0");

        triggerTreeSelect(treeElement, {
            previous_node: { element: africaElement, id: 2 },
        });

        expect(editLink).toHaveAttribute("tabindex", "-1");
        expect(addLink).toHaveAttribute("tabindex", "-1");
    });

    test("doesn't change the tabindex of the edit links of child nodes", async () => {
        const treeElement = createTreeElement();
        initTestTree(treeElement);
        expect(await screen.findByRole("tree")).toBeInTheDocument();

        const rootElement = getNodeElement("root");
        const africaElement = getNodeElement("Africa");

        const rootLinks = getNodeLinks(rootElement);
        const africaLinks = getNodeLinks(africaElement);

        triggerTreeSelect(treeElement, {
            node: { element: rootElement, id: 1 },
        });

        expect(rootLinks.editLink).toHaveAttribute("tabindex", "0");
        expect(rootLinks.addLink).toHaveAttribute("tabindex", "0");
        expect(africaLinks.editLink).toHaveAttribute("tabindex", "-1");
        expect(africaLinks.addLink).toHaveAttribute("tabindex", "-1");

        triggerTreeSelect(treeElement, {
            deselected_node: { element: rootElement, id: 1 },
            node: { element: africaElement, id: 2 },
        });

        expect(rootLinks.editLink).toHaveAttribute("tabindex", "-1");
        expect(rootLinks.addLink).toHaveAttribute("tabindex", "-1");
        expect(africaLinks.editLink).toHaveAttribute("tabindex", "0");
        expect(africaLinks.addLink).toHaveAttribute("tabindex", "0");
    });
});

