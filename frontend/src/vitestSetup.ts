import jQuery from "jquery";
import "@testing-library/jest-dom/vitest";

declare global {
    interface Window {
        $: JQueryStatic;
        jQuery: JQueryStatic;
    }
}

window.$ = jQuery;
window.jQuery = jQuery;
