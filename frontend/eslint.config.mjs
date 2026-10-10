import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import compat from "eslint-plugin-compat";
import jestDom from "eslint-plugin-jest-dom";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import-x";
import perfectionistPlugin from "eslint-plugin-perfectionist";
import testingLibrary from "eslint-plugin-testing-library";
import unicorn from "eslint-plugin-unicorn";
import vitest from "@vitest/eslint-plugin";

export default defineConfig([
    { ignores: ["*.config.{js,mjs,ts}"] },
    {
        extends: [
            eslint.configs.recommended,
            compat.configs["flat/recommended"],
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.stylisticTypeChecked,
            importPlugin.flatConfigs.recommended,
            importPlugin.flatConfigs.typescript,
            perfectionistPlugin.configs["recommended-natural"],
        ],
        files: ["**/*.ts"],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            unicorn,
        },
        rules: {
            "unicorn/dom-node-dataset": "error",
            "unicorn/error-message": "error",
            "unicorn/new-for-builtins": "error",
            "unicorn/no-document-cookie": "error",
            "unicorn/no-for-each": "error",
            "unicorn/no-instanceof-builtins": "error",
            "unicorn/no-invalid-remove-event-listener": "error",
            "unicorn/no-return-array-push": "error",
            "unicorn/no-thenable": "error",
            "unicorn/no-unnecessary-fetch-options": "error",
            "unicorn/no-useless-promise-resolve-reject": "error",
            "unicorn/no-useless-spread": "error",
            "unicorn/prefer-add-event-listener": "error",
            "unicorn/prefer-array-find": "error",
            "unicorn/prefer-array-flat-map": "error",
            "unicorn/prefer-array-some": "error",
            "unicorn/prefer-at": "error",
            "unicorn/prefer-direct-iteration": "error",
            "unicorn/prefer-dom-node-append": "error",
            "unicorn/prefer-dom-node-remove": "error",
            "unicorn/prefer-dom-node-replace-children": "error",
            "unicorn/prefer-dom-node-text-content": "error",
            "unicorn/prefer-includes": "error",
            "unicorn/prefer-keyboard-event-key": "error",
            "unicorn/prefer-modern-dom-apis": "error",
            "unicorn/prefer-number-properties": "error",
            "unicorn/prefer-query-selector": "error",
            "unicorn/prefer-string-replace-all": "error",
            "unicorn/prefer-string-starts-ends-with": "error",
            "unicorn/require-css-escape": "error",
            "unicorn/throw-new-error": "error",
            "@typescript-eslint/restrict-template-expressions": "error",
            radix: "error",
        },
    },
    {
        extends: [
            jestDom.configs["flat/recommended"],
            testingLibrary.configs["flat/dom"],
        ],
        files: ["src/**/*.test.ts"],
        plugins: {
            vitest,
        },
        rules: {
            ...vitest.configs.recommended.rules,
            "vitest/consistent-test-it": [
                "error",
                { fn: "test", withinDescribe: "test" },
            ],
            "vitest/no-alias-methods": "error",
            "vitest/no-conditional-in-test": "error",
            "vitest/no-duplicate-hooks": "error",
            "vitest/no-test-return-statement": "error",
            "vitest/padding-around-expect-groups": "error",
            "vitest/prefer-called-once": "error",
            "vitest/prefer-comparison-matcher": "error",
            "vitest/prefer-each": "error",
            "vitest/prefer-equality-matcher": "error",
            "vitest/prefer-hooks-in-order": "error",
            "vitest/prefer-hooks-on-top": "error",
            "vitest/prefer-mock-promise-shorthand": "error",
            "vitest/prefer-spy-on": "error",
            "vitest/prefer-strict-equal": "error",
            "vitest/prefer-to-be": "error",
            "vitest/prefer-to-be-object": "error",
            "vitest/prefer-to-contain": "error",
            "vitest/prefer-to-have-length": "error",
            "vitest/prefer-todo": "error",
            "vitest/prefer-vi-mocked": "error",
            "vitest/require-to-throw-message": "error",
            "compat/compat": "off",
            // Tests set cookies directly; jsdom has no Cookie Store API
            "unicorn/no-document-cookie": "off",
            // The tests check jqtree's DOM structure (spinner and toggler
            // placement, rendered html), which has no accessible queries
            "testing-library/no-node-access": "off",
        },
    },
]);
