import type { Node } from "html-tree";

import { fireEvent, screen, waitFor, within } from "@testing-library/dom";
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

// Record the parameters of the HtmlTree constructor, so that the tests can
// check the options that are passed to it. A real tree is created.
const { treeParameters } = vi.hoisted(() => ({
    treeParameters: [] as Record<string, unknown>[],
}));

vi.mock("html-tree", async (importOriginal) => {
    const actual = await importOriginal<typeof import("html-tree")>();

    return {
        ...actual,
        default: class extends actual.default {
            constructor(params: ConstructorParameters<typeof actual.default>[0]) {
                treeParameters.push(params as unknown as Record<string, unknown>);
                super(params);
            }
        },
    };
});

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
    localStorage.clear();
    treeParameters.length = 0;
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
        autoEscape: false,
        autoOpen: false,
        csrfCookieName: "csrf",
        dragAndDrop: false,
        hasAddPermission: true,
        hasChangePermission: true,
        insertAtUrl: "/add",
        rtl: false,
    };

    const options = { ...defaultOptions, ...paramOptions };

    initTree(treeElement, options);
};

const dispatchTreeEvent = (
    treeElement: HTMLElement,
    name: string,
    detail: Record<string, unknown>
) => {
    treeElement.dispatchEvent(
        new CustomEvent(name, { bubbles: true, cancelable: true, detail })
    );
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
    const treeElement = createTreeElement("/no_data");
    initTestTree(treeElement);

    const spinner = treeElement.querySelector(".jqtree-spin");
    expect(spinner).toBeInTheDocument();
    expect(spinner?.parentElement).toBe(treeElement);

    expect(
        await screen.findByText("Error while loading the data from the server")
    ).toBeInTheDocument();

    // the message replaces the spinner
    expect(document.querySelector(".jqtree-spin")).not.toBeInTheDocument();
});

test("displays a spinner while the data is loading", async () => {
    const treeElement = createTreeElement();
    initTestTree(treeElement);

    const spinner = treeElement.querySelector(".jqtree-spin");
    expect(spinner).toBeInTheDocument();
    expect(spinner?.parentElement).toBe(treeElement);

    expect(await screen.findByRole("tree")).toBeInTheDocument();
    expect(treeElement.querySelector(".jqtree-spin")).not.toBeInTheDocument();
});

test("displays a spinner while the data of a node is loading", async () => {
    treeData = [
        {
            id: 1,
            load_on_demand: true,
            name: "root",
            url: "/edit/1",
        },
    ];

    // the request for the children of the root node is delayed, so that the
    // test can check the spinner while the node is loading
    let sendChildren = () => {
        // do nothing
    };
    const childrenRequested = new Promise<void>((resolve) => {
        sendChildren = resolve;
    });

    server.use(
        http.get("/tree", async ({ request }) => {
            const nodeId = new URL(request.url).searchParams.get("node");

            if (nodeId !== "1") {
                return HttpResponse.json(treeData);
            }

            await childrenRequested;
            return HttpResponse.json([
                { id: 2, name: "Africa", url: "/edit/2" },
            ]);
        })
    );

    // autoOpen opens the root node, which loads its children from the server
    initTestTree(createTreeElement(), { autoOpen: true });

    // the spinner is displayed next to the title of the node
    await waitFor(() => {
        expect(
            getNodeElement("root").querySelector(
                ":scope > .jqtree-element > .jqtree-spin"
            )
        ).toBeInTheDocument();
    });

    sendChildren();

    expect(
        await screen.findByRole("treeitem", { name: "Africa" })
    ).toBeInTheDocument();
    expect(document.querySelector(".jqtree-spin")).not.toBeInTheDocument();
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

describe("autoOpen", () => {
    test("opens the nodes when autoOpen is true", async () => {
        initTestTree(createTreeElement(), { autoOpen: true });

        expect(await screen.findByRole("tree")).toBeInTheDocument();
        expect(screen.getByRole("treeitem", { name: "root" })).toHaveAttribute(
            "aria-expanded",
            "true"
        );
    });

    test("opens the nodes up to the level of autoOpen", async () => {
        initTestTree(createTreeElement(), { autoOpen: 0 });

        expect(await screen.findByRole("tree")).toBeInTheDocument();
        expect(screen.getByRole("treeitem", { name: "root" })).toHaveAttribute(
            "aria-expanded",
            "true"
        );
    });

    test("keeps the nodes closed when autoOpen is false", async () => {
        initTestTree(createTreeElement(), { autoOpen: false });

        expect(await screen.findByRole("tree")).toBeInTheDocument();
        expect(screen.getByRole("treeitem", { name: "root" })).toHaveAttribute(
            "aria-expanded",
            "false"
        );
    });
});

describe("autoEscape", () => {
    beforeEach(() => {
        treeData = [
            {
                children: [],
                id: 1,
                name: "<b>root</b>",
                url: "/edit/1",
            },
        ];
    });

    test("escapes the node name when autoEscape is true", async () => {
        initTestTree(createTreeElement(), { autoEscape: true });

        expect(await screen.findByRole("tree")).toBeInTheDocument();

        const title = screen.getByRole("treeitem", { name: "<b>root</b>" });
        expect(title).toHaveTextContent("<b>root</b>");
        expect(title.querySelector("b")).toBeNull();
    });

    test("renders the node name as html when autoEscape is false", async () => {
        initTestTree(createTreeElement(), { autoEscape: false });

        expect(await screen.findByRole("tree")).toBeInTheDocument();

        const title = screen.getByRole("treeitem", { name: "<b>root</b>" });
        expect(title).toHaveTextContent("root");
        expect(title.querySelector("b")).toBeInTheDocument();
    });
});

describe("dragAndDrop", () => {
    test("enables drag and drop", async () => {
        initTestTree(createTreeElement(), {
            dragAndDrop: true,
            hasChangePermission: true,
        });

        expect(await screen.findByRole("tree")).toHaveClass("jqtree-dnd");
    });

    test("doesn't enable drag and drop when dragAndDrop is false", async () => {
        initTestTree(createTreeElement(), {
            dragAndDrop: false,
            hasChangePermission: true,
        });

        expect(await screen.findByRole("tree")).not.toHaveClass(
            "jqtree-dnd"
        );
    });

    test("doesn't enable drag and drop without change permission", async () => {
        initTestTree(createTreeElement(), {
            dragAndDrop: true,
            hasChangePermission: false,
        });

        expect(await screen.findByRole("tree")).not.toHaveClass(
            "jqtree-dnd"
        );
    });
});

describe("saveState", () => {
    test("saves the state of the tree", async () => {
        initTestTree(createTreeElement(), { saveState: "myapp_mymodel" });

        expect(await screen.findByRole("tree")).toBeInTheDocument();

        // open the root node
        screen.getByText("►").click();

        expect(localStorage.getItem("myapp_mymodel")).toEqual(
            JSON.stringify({ open_nodes: [1], selected_node: [] })
        );
    });

    test("doesn't save the state when saveState is undefined", async () => {
        initTestTree(createTreeElement(), { saveState: undefined });

        expect(await screen.findByRole("tree")).toBeInTheDocument();

        screen.getByText("►").click();

        expect(localStorage).toHaveLength(0);
    });
});

describe("useContextMenu", () => {
    const rightClickNode = (name: string) => {
        screen.getByRole("treeitem", { name }).dispatchEvent(
            new MouseEvent("contextmenu", {
                bubbles: true,
                cancelable: true,
            })
        );
    };

    test("triggers a contextmenu event when useContextMenu is true", async () => {
        const treeElement = createTreeElement();
        const handleContextMenu = vi.fn();
        treeElement.addEventListener("tree.contextmenu", handleContextMenu);

        initTestTree(treeElement, { autoOpen: true, useContextMenu: true });
        expect(await screen.findByRole("tree")).toBeInTheDocument();

        rightClickNode("Africa");

        expect(handleContextMenu).toHaveBeenCalledOnce();

        const event = handleContextMenu.mock.calls[0]?.[0] as CustomEvent<{
            node: Node;
        }>;
        expect(event.detail.node.name).toEqual("Africa");
    });

    test("doesn't trigger a contextmenu event when useContextMenu is undefined", async () => {
        const treeElement = createTreeElement();
        const handleContextMenu = vi.fn();
        treeElement.addEventListener("tree.contextmenu", handleContextMenu);

        initTestTree(treeElement, { autoOpen: true });
        expect(await screen.findByRole("tree")).toBeInTheDocument();

        rightClickNode("Africa");

        expect(handleContextMenu).not.toHaveBeenCalled();
    });
});

describe("html-tree options", () => {
    // animationSpeed and mouseDelay have no observable effect on the dom, so
    // check the options that are passed to html-tree
    const getTreeOptions = (paramOptions?: Partial<InitTreeOptions>) => {
        initTestTree(createTreeElement(), paramOptions);

        return treeParameters[0];
    };

    test("passes the animation speed", () => {
        expect(getTreeOptions({ animationSpeed: 300 })).toMatchObject({
            animationSpeed: 300,
        });
    });

    test("doesn't pass an animation speed when it is undefined", () => {
        expect(getTreeOptions({ animationSpeed: undefined })).not.toHaveProperty(
            "animationSpeed"
        );
    });

    test("passes the mouse delay as startDndDelay", () => {
        expect(getTreeOptions({ mouseDelay: 500 })).toMatchObject({
            startDndDelay: 500,
        });
    });

    test("doesn't pass a startDndDelay when the mouse delay is undefined", () => {
        expect(getTreeOptions({ mouseDelay: undefined })).not.toHaveProperty(
            "startDndDelay"
        );
    });

    test("passes buttonLeft and closedIcon for rtl", () => {
        expect(getTreeOptions({ rtl: true })).toMatchObject({
            buttonLeft: true,
            closedIcon: "&#x25c0;",
        });
    });
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

        dispatchTreeEvent(treeElement, "tree.move", { move_info });

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

describe("selecting a node", () => {
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

    const clickNode = (name: string) => {
        fireEvent.click(screen.getByRole("treeitem", { name }));
    };

    test("sets the tabindex of the edit links when a node is selected", async () => {
        const treeElement = createTreeElement();
        initTestTree(treeElement);
        expect(await screen.findByRole("tree")).toBeInTheDocument();

        const africaElement = getNodeElement("Africa");
        const { addLink, editLink } = getNodeLinks(africaElement);

        expect(editLink).toHaveAttribute("tabindex", "-1");
        expect(addLink).toHaveAttribute("tabindex", "-1");

        clickNode("Africa");

        expect(editLink).toHaveAttribute("tabindex", "0");
        expect(addLink).toHaveAttribute("tabindex", "0");
    });

    test("resets the tabindex of the edit links when a node is deselected", async () => {
        const treeElement = createTreeElement();
        initTestTree(treeElement);
        expect(await screen.findByRole("tree")).toBeInTheDocument();

        const { addLink, editLink } = getNodeLinks(getNodeElement("Africa"));

        clickNode("Africa");

        expect(editLink).toHaveAttribute("tabindex", "0");
        expect(addLink).toHaveAttribute("tabindex", "0");

        // clicking the selected node deselects it
        clickNode("Africa");

        expect(editLink).toHaveAttribute("tabindex", "-1");
        expect(addLink).toHaveAttribute("tabindex", "-1");
    });

    test("doesn't change the tabindex of the edit links of child nodes", async () => {
        const treeElement = createTreeElement();
        initTestTree(treeElement);
        expect(await screen.findByRole("tree")).toBeInTheDocument();

        const rootLinks = getNodeLinks(getNodeElement("root"));
        const africaLinks = getNodeLinks(getNodeElement("Africa"));

        clickNode("root");

        expect(rootLinks.editLink).toHaveAttribute("tabindex", "0");
        expect(rootLinks.addLink).toHaveAttribute("tabindex", "0");
        expect(africaLinks.editLink).toHaveAttribute("tabindex", "-1");
        expect(africaLinks.addLink).toHaveAttribute("tabindex", "-1");

        clickNode("Africa");

        expect(rootLinks.editLink).toHaveAttribute("tabindex", "-1");
        expect(rootLinks.addLink).toHaveAttribute("tabindex", "-1");
        expect(africaLinks.editLink).toHaveAttribute("tabindex", "0");
        expect(africaLinks.addLink).toHaveAttribute("tabindex", "0");
    });
});
