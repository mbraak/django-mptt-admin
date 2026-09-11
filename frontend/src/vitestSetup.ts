import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement the web animations api, which tree-element uses for the
// open and close animations
Element.prototype.animate = () => {
    const animation = {
        onfinish: null as (() => void) | null,
    };

    queueMicrotask(() => {
        animation.onfinish?.();
    });

    return animation as unknown as Animation;
};

window.gettext = (key) => key;
