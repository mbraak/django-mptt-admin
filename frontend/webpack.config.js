var path = require("path");
var webpack = require("webpack");
var UglifyJsPlugin = require("uglifyjs-webpack-plugin");

const banner = "This file is generated\n";

module.exports = {
    entry: {
        "django_mptt_admin": ["./django_mptt_admin.js"],
    },
    output: {
        path: path.resolve(__dirname, "../django_mptt_admin/static/django_mptt_admin/"),
        filename: "[name].js"
    },
    module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: "babel-loader"
                    }
                }
            ]
        },
    externals: {
        "jquery": "jQuery"
    },
    plugins: [
        new UglifyJsPlugin(),
        new webpack.BannerPlugin(banner)
    ]
};
