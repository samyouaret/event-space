const path = require("path")
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: "development",
    // target: 'node', // in order to ignore built-in modules like path, fs, etc. 
    entry: {
        index: path.join(__dirname, "/src/js/index.js"),
    },
    optimization: {
        minimizer: [new TerserPlugin()],
    },
    output: {
        path: path.join(__dirname, "/public/build/js"),
        filename: "[name].bundle.js",
        chunkFilename: '[name].bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        "presets": [
                            "@babel/env",
                            "@babel/react"
                        ]
                    }
                },
            },
        ],
    },
    devServer: {

        // Serve index.html as the base
        contentBase: path.join(__dirname, "/public"),

        // Enable compression
        // compress: true,

        // Enable hot reloading
        hot: true,
        historyApiFallback: true,
        port: 3000,

        // Public path is root of content base
        publicPath: '/',
    },
    plugins: [
    ],
    resolve: {
        extensions: ['.js', '.jsx'],
    },
}