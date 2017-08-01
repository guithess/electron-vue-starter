const path = require("path");

module.exports = {
    entry: "./src/scripts/main.js",
    target: "electron-main",
    devtool: "source-map",
    resolve: {
        alias: {
            vue: "vue/dist/vue.js"
        }
    },
    output: {
        path: path.join(__dirname, "./app/scripts"),
        filename: "build.js"
    },
    module: {
        loaders: [
            {
                test: /\.json$/,
                enforce: "pre",
                loader: "json-loader"
            },
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /node_modules/
            },
            {
                test: /\.vue$/,
                loader: "vue-loader",
                options: {
                    loaders: {
                        scss: "vue-style-loader!css-loader!sass-loader",
                        sass: "vue-style-loader!css-loader!sass-loader?indentedSyntax",
                        js: "babel-loader"
                    }
                }
            }
        ]
    }
};
