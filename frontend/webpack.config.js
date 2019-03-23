var path = require("path");

module.exports = {
    entry: {
        django_mptt_admin: ["./django_mptt_admin.ts"]
    },
    output: {
        path: path.resolve(
            __dirname,
            "../django_mptt_admin/static/django_mptt_admin/"
        ),
        filename: "[name].js"
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: "ts-loader"
                }
            }
        ]
    },
    externals: {
        jquery: "jQuery"
    }
};
