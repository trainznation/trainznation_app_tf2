const {sass} = require('laravel-mix');
const mix = require('laravel-mix');
const path = require('path');

mix.disableNotifications()

sass('app/assets/sass/styles.scss', 'app/assets/css/styles.css')

module.exports = {
    entry: path.resolve(__dirname, './app/assets/js/uicore.js'),
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            }
        ]
    },
    resolve: {
        extensions: ['*', '.js']
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'bundle.js',
    },
    devServer: {
        contentBase: path.resolve(__dirname, './dist'),
    },
};


