const path = require("path");

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
    entry: {
        django_mptt_admin: ["./django_mptt_admin.ts"],
    },
    output: {
        path: path.resolve(
            __dirname,
            "../django_mptt_admin/static/django_mptt_admin/"
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
        ].filter(Boolean),
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
