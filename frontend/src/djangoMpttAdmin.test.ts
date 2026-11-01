import { afterEach, beforeEach, expect, test, vi } from "vitest";

import initTree from "./initTree";
import parseTreeOptions from "./parseTreeOptions";

vi.mock("./initTree");
vi.mock("./parseTreeOptions");

// Importing the module registers the DOMContentLoaded handler; the module is imported
// once, so each test dispatches the event again
await import("./djangoMpttAdmin");

const dispatchDOMContentLoaded = () => {
    window.dispatchEvent(new Event("DOMContentLoaded"));
};

beforeEach(() => {
    document.body.replaceChildren();
});

afterEach(() => {
    vi.clearAllMocks();
});

test("initializes the tree on DOMContentLoaded", () => {
    const treeElement = document.createElement("div");
    treeElement.id = "tree";
    document.body.append(treeElement);

    // The options are passed through to initTree; their contents don't matter here
    const treeOptions = {} as ReturnType<typeof parseTreeOptions>;
    vi.mocked(parseTreeOptions).mockReturnValue(treeOptions);

    dispatchDOMContentLoaded();

    expect(parseTreeOptions).toHaveBeenCalledExactlyOnceWith(treeElement);
    expect(initTree).toHaveBeenCalledExactlyOnceWith(treeElement, treeOptions);
});

test("does nothing when there is no tree element", () => {
    dispatchDOMContentLoaded();

    expect(parseTreeOptions).not.toHaveBeenCalled();
    expect(initTree).not.toHaveBeenCalled();
});
