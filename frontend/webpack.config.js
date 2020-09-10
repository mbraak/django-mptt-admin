const path = require("path");

const skipCompressJs = Boolean(process.env.SKIP_COMPRESS_JS);
const coverage = Boolean(process.env.COVERAGE);

const minimize = !skipCompressJs && !coverage;

const getOutputFilename = () => {
    if (coverage) {
        return "django_mptt_admin.coverage.js";
    } else if (skipCompressJs) {
        return "django_mptt_admin.debug.js";
    } else {
        return "django_mptt_admin.js";
    }
};

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
                },
            },
            coverage && {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: "@jsdevtools/coverage-istanbul-loader",
                    options: { esModules: true },
                },
                enforce: "post",
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
