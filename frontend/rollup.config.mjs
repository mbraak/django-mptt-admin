import { babel } from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

const outputDir = "../django_mptt_admin/static/django_mptt_admin";

const createConfig = ({ coverage = false, filename, minify = false }) => ({
    external: ["jquery"],
    input: "src/djangoMpttAdmin.ts",
    output: {
        file: `${outputDir}/${filename}`,
        format: "iife",
        globals: { jquery: "jQuery" },
        plugins: minify ? [terser()] : [],
        sourcemap: true,
    },
    plugins: [
        nodeResolve({ extensions: [".ts", ".js"] }),
        commonjs(),
        babel({
            babelHelpers: "bundled",
            babelrc: false,
            configFile: false,
            exclude: "node_modules/**",
            extensions: [".ts", ".js"],
            plugins: coverage ? ["istanbul"] : [],
            presets: [
                "@babel/preset-typescript",
                ["@babel/preset-env", { targets: "defaults" }],
            ],
        }),
    ],
});

export default [
    createConfig({ filename: "django_mptt_admin.js", minify: true }),
    createConfig({ filename: "django_mptt_admin.debug.js" }),
    createConfig({ coverage: true, filename: "django_mptt_admin.coverage.js" }),
];
