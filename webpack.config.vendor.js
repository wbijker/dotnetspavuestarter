const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = (env) => {
    const isDevBuild = !(env && env.prod);
    const extractCSS = new ExtractTextPlugin('vendor.css');

    return [{
        stats: {
            modules: false
        },
        resolve: {
            extensions: ['.js']
        },
        entry: {
            vendor: [
                'babel-polyfill',
                'vue',
                'axios',
                // 'vue-material',
                './ClientApp/vendor.js',
                
                // CSS
                './ClientApp/css/vendor.css',
                'vue-material/dist/vue-material.min.css',
                'vue-material/dist/theme/default.css',
                'purecss/build/pure-min.css',
                'purecss/build/grids-responsive-min.css'
            ],
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    use: [{
                        loader: 'babel-loader',
                        options: {
                            presets: ['es2015']
                        }
                    }]
                },
                {
                    test: /\.css(\?|$)/,
                    use: extractCSS.extract({
                        use: isDevBuild ? 'css-loader' : 'css-loader?minimize'
                    })
                },
                {
                    test: /\.(png|woff|woff2|eot|ttf|svg)(\?|$)/,
                    use: 'url-loader?limit=100000'
                }
            ]
        },
        output: {
            path: path.join(__dirname, 'wwwroot', 'dist'),
            publicPath: 'dist/',
            filename: '[name].js',
            library: '[name]_[hash]'
        },
        plugins: [
            extractCSS,
            new webpack.DefinePlugin({
                'process.env.NODE_ENV': isDevBuild ? '"development"' : '"production"'
            }),
            new webpack.DllPlugin({
                path: path.join(__dirname, 'wwwroot', 'dist', '[name]-manifest.json'),
                name: '[name]_[hash]'
            })
        ].concat(isDevBuild ? [] : [
            new webpack.optimize.UglifyJsPlugin()
        ])
    }];
};