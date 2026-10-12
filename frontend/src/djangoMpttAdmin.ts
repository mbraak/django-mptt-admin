import initTree from "./initTree";
import parseTreeOptions from "./parseTreeOptions";

addEventListener("DOMContentLoaded", () => {
    const treeElement = document.querySelector<HTMLElement>("#tree");

    if (treeElement) {
        initTree(
            treeElement,
            parseTreeOptions(treeElement)
        );
    }
});
