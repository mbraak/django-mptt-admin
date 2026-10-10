import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import compat from "eslint-plugin-compat";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import-x";
import perfectionistPlugin from "eslint-plugin-perfectionist";
import testingLibrary from "eslint-plugin-testing-library";
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
        rules: {
            "@typescript-eslint/restrict-template-expressions": "error",
        },
    },
    {
        extends: [testingLibrary.configs["flat/dom"]],
        files: ["src/**/*.test.ts"],
        plugins: {
            vitest,
        },
        rules: {
            ...vitest.configs.recommended.rules,
            "compat/compat": "off",
            // The tests check jqtree's DOM structure (spinner and toggler
            // placement, rendered html), which has no accessible queries
            "testing-library/no-node-access": "off",
        },
    },
]);
