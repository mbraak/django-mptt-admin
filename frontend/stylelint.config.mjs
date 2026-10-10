export default {
    extends: ["stylelint-config-standard-scss"],
    rules: {
        // Kebab-case, plus jqtree_common which is defined by jqtree
        "selector-class-pattern": [
            "^(?:jqtree_common|[a-z][a-z0-9]*(?:-[a-z0-9]+)*)$",
            {
                message: (selector) =>
                    `Expected class selector "${selector}" to be kebab-case`,
            },
        ],
    },
};
