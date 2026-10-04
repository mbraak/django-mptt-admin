import css from "@eslint/css";
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import compat from "eslint-plugin-compat";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import-x";
import perfectionistPlugin from "eslint-plugin-perfectionist";
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
        files: ["src/**/*.test.ts"],
        plugins: {
            vitest,
        },
        rules: {
            ...vitest.configs.recommended.rules,
            "compat/compat": "off",
        },
    },
    {
        extends: [css.configs.recommended],
        files: ["**/*.scss"],
        language: "css/css",
        plugins: { css },
        rules: {
            // Variables are defined in the Django admin stylesheets
            "css/no-invalid-properties": [
                "error",
                { allowUnknownVariables: true },
            ],
        },
    },
]);
