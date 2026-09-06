const path = require("path");
const MinimizerPlugin = require("minimizer-webpack-plugin");

const skipCompressJs = Boolean(process.env.SKIP_COMPRESS_JS);
const coverage = Boolean(process.env.COVERAGE);

const getOutputFilename = () => {
    if (coverage) {
        return "django_mptt_admin.coverage.js";
    } else if (skipCompressJs) {
        return "django_mptt_admin.debug.js";
    } else {
        return "django_mptt_admin.js";
    }
};

const minimize = !skipCompressJs && !coverage;

module.exports = {
    devtool: false,
    entry: {
        django_mptt_admin: ["./src/djangoMpttAdmin.ts"],
    },
    output: {
        path: path.resolve(
            __dirname,
            "../django_mptt_admin/static/django_mptt_admin/",
        ),
        filename: getOutputFilename(),
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            "@babel/preset-typescript",
                            ["@babel/preset-env", { targets: "defaults" }],
                        ],
                        plugins: coverage ? ["istanbul"] : [],
                    },
                },
            },
            {
                test: /\.js$/,
                use: path.resolve(__dirname, "stripSourceMapComments.js"),
            },
        ].filter(Boolean),
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    optimization: {
        minimize,
        minimizer: [
            new MinimizerPlugin({
                // Terser is the default minifier. Also mangle property names
                // that start with an underscore (internal/private members).
                minimizerOptions: {
                    mangle: {
                        properties: {
                            regex: /^_/,
                        },
                    },
                },
            }),
        ],
    },
};
