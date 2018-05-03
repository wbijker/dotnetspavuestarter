const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const bundleOutputDir = './wwwroot/dist';

// Module can be a NPM module or a relative path library
function isIncluded(module, entry) {

    if (entry.charAt(0) == '.') {
        return path.join(module.context, entry) == module.resource
    }
    // Module
    var entryPath = path.join(__dirname, 'node_modules', entry) + path.sep
    // String.startsWith
    return module.context.indexOf(entryPath) == 0
}

function createCommonChunk(entry) {
    var obj = {
        name: entry.chunkName,
        chunks: entry.targetChunks || null,
        minChunks: 2
    }
    // var type = typeof entry.modules
    if (Array.isArray(entry.modules)) {
        obj.minChunks = function(module, count) {
            // return true if some of the modules is included in path
            return entry.modules.some(e => isIncluded(module, e))
        }
    } else if (typeof entry.modules == 'function') {
        obj.minChunks = entry.modules
    }

    return new webpack.optimize.CommonsChunkPlugin(obj)
}

var createRules = function(api) {
    var rules = [
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true,
                    presets: ['env']
                }
            }
        },
        {
            test: /\.vue$/,
            include: /ClientApp/,
            loader: 'vue-loader',
            options: {
                loaders: {
                    scss: 'style-loader!css-loader!sass-loader',
                    js: 'babel-loader'
                }
            }
        },
        {
            test: /\.s[a|c]ss$/,
            loader: 'style-loader!css-loader!sass-loader'
        },
        {
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        },
        {
            test: /\.(png|jpg|jpeg|gif|svg)$/,
            use: 'url-loader?limit=25000'
        }
    ]
    // extract common CSS into seperate chunks
    // rules.concat(rules, config.extractCSS.map(e => 
    //     ({    
    //         // maybe rule.Condition?
    //         test: e.test,
    //         use: extractCSS.extract(['css-loader', 'postcss-loader'])
    //     })
    // ))
    return rules
}

var createPlugins = function(api) 
{
    var plugins = [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(api._config.isDev ? 'development' : 'production')
            }
        }),
        // new webpack.DllReferencePlugin({
        //     context: __dirname,
        //     manifest: require('./wwwroot/dist/vendor-manifest.json')
        // }),
        new webpack.SourceMapDevToolPlugin({
            filename: '[file].map', // Remove this line if you prefer inline source maps
            moduleFilenameTemplate: path.relative(api._config.outputDir, '[resourcePath]') // Point sourcemap entries to the original file locations on disk
        })
    ]

    // Add commonChunks plugin
    // api._extracts.forEach(entry => plugins.push(createCommonChunk(entry)))

    // console.log('CommonsChunkdPlugin created');

    plugins.push(new webpack.optimize.CommonsChunkPlugin({
        minChunks: function(module, count) {
            // console.log('Min chunks ran!' +  module.resource + ':' + count)
        //     // return module.resource == '/Users/willem/projects/taxtitan/src/Web/ClientApp/library.js'
            // return module.resource.indexOf('vue') != 1
            return module.resource == '/Users/willem/projects/taxtitan/src/Web/ClientApp/library.js'
        },
        name: 'chunk_common'
      }))

    plugins.push(new webpack.optimize.CommonsChunkPlugin({
        minChunks: function(module, count) {
            console.log('vuenext:: Min chunks ran!' +  module.resource + ':' + count)
        //     // return module.resource == '/Users/willem/projects/taxtitan/src/Web/ClientApp/library.js'
            // return module.resource.indexOf('vue') != 1
            return module.resource == '/Users/willem/projects/taxtitan/src/Web/node_modules/vue/dist/vue.runtime.esm.js'
        },
        name: 'vue',
        // minChunks: 'infinity'
        // chunks: ['main', 'app', 'chunk_common'],
        children: true
        // chunks: '*'
      }))
      
      
    // plugins.push(new webpack.optimize.CommonsChunkPlugin({
    //     // minChunks: function(module, count) {
    //     //     // console.log('Min chunks ran!' +  module.resource + ':' + count)
    //     //     // return module.resource == '/Users/willem/projects/taxtitan/src/Web/ClientApp/library.js'
    //     //     // return count >= 2
    //     //     return module.resource.indexOf('vue') != 1
    //     // },
    //     name: 'library',
    //     chunks: ['common']
    //   }))

          
    // plugins.push(new webpack.optimize.CommonsChunkPlugin({
    //     // minChunks: function(module, count) {
    //     //     // console.log('Min chunks ran!' +  module.resource + ':' + count)
    //     //     // return module.resource == '/Users/willem/projects/taxtitan/src/Web/ClientApp/library.js'
    //     //     // return count >= 2
    //     //     return module.resource.indexOf('vue') != 1
    //     // },
    //     name: 'commoncommon'
    //   }))
      



    return plugins
}

// Elegant wrapper around webpack's config file
module.exports = {
    _entries: {},
    _extracts: [],
    _config: {
        // All webpack rules
        rules: [],
        // Base folder for all entry points
        entryBase: './ClientApp/',
        // output.filename
        filename: '[name].js',
        // output.publcPath
        publicPath: 'dist/',
        outputDir: './wwwroot/dist',
        // Set mode. Production or development
        isDev: true
    },

    setConfig(config) {
        // Merge default config with config
        for (var k in config) {
            this._config[k] = config[k]
        }
    },

    js(chunkname, relPath) {
        this._entries[chunkname] = this._config.entryBase + relPath
    },

    extract(modules, chunkName, commonChunks = null) {
    
        // use modules as array
        this._extracts.push({
            modules: Array.isArray(modules) ? modules : [modules],
            chunkName,
            commonChunks
        })
    },

    // Generate webpack.config definition
    generate() {
        return {
            stats: {
                modules: false
            },
            context: __dirname,
            resolve: {
                extensions: ['.js']
            },
            // entry: this._entries,
            entry: {
                main: './ClientApp/boot.js',
                app: './ClientApp/app.js'
            },
            module: {
                rules: createRules(this)
            },
            output: {
                path: path.join(__dirname, bundleOutputDir),
                filename: '[name].js',
                publicPath: 'dist/'
            },
            plugins: createPlugins(this)
        }
    }
}