const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    mode:'development',
    devServer: {
        port: 8080,
        static: './dist',
        hot: true, // hot module replacement. Depends on HotModuleReplacementPlugin
        https: true, // true for self-signed, object for cert authority
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
    ],
};