const path = require("path");

const skipCompressJs = Boolean(process.env.SKIP_COMPRESS_JS);

const minimize = !skipCompressJs;
const outputFilename = skipCompressJs
    ? "django_mptt_admin.debug.js"
    : "django_mptt_admin.js";

module.exports = {
    entry: {
        django_mptt_admin: ["./django_mptt_admin.ts"],
    },
    output: {
        path: path.resolve(
            __dirname,
            "../django_mptt_admin/static/django_mptt_admin/"
        ),
        filename: outputFilename,
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    devtool: "source-map",
    optimization: {
        minimize,
    },
    externals: {
        jquery: "jQuery",
    },
};
