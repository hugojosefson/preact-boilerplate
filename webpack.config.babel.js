const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const autoprefixer = require('autoprefixer');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ReplacePlugin = require('replace-bundle-webpack-plugin');
const OfflinePlugin = require('offline-plugin');
const isProduction = require('is-production');
const path = require('path');

const {port, actualServerPort} = require('./src/server/config');
const ENV = process.env.NODE_ENV || 'development';
const CSS_MAPS = !isProduction();

module.exports = {
    context: path.resolve(__dirname, 'src/client'),
    entry: './index.js',

    output: {
        path: path.resolve(__dirname, 'build/client'),
        publicPath: '/',
        filename: 'bundle.js'
    },

    resolve: {
        extensions: ['.jsx', '.js', '.json', '.less'],
        modules: [
            path.resolve(__dirname, 'src/client/lib'),
            path.resolve(__dirname, 'node_modules'),
            'node_modules'
        ],
        alias: {
            components: path.resolve(__dirname, 'src/client/components'),    // used for tests
            style: path.resolve(__dirname, 'src/client/style'),
            'react': 'preact-compat',
            'react-dom': 'preact-compat'
        }
    },

    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: path.resolve(__dirname, 'src'),
                enforce: 'pre',
                use: 'source-map-loader'
            },
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        sourceMaps: true,
                        presets: [
                            [
                                'env',
                                {
                                    modules: false,
                                    targets: {
                                        browsers: [
                                            'last 2 versions'
                                        ]
                                    }
                                }
                            ]
                        ],
                        plugins: [
                            'transform-class-properties',
                            [
                                'transform-react-jsx',
                                {
                                    pragma: 'h'
                                }
                            ]
                        ]
                    }
                }
            },
            {
                // Transform our own .(less|css) files with PostCSS and CSS-modules
                test: /\.(less|css)$/,
                include: [path.resolve(__dirname, 'src/client/components')],
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {modules: true, sourceMap: CSS_MAPS, importLoaders: 1}
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: CSS_MAPS,
                                plugins: () => {
                                    autoprefixer({browsers: ['last 2 versions']});
                                }
                            }
                        },
                        {
                            loader: 'less-loader',
                            options: {sourceMap: CSS_MAPS}
                        }
                    ]
                })
            },
            {
                test: /\.(less|css)$/,
                exclude: [path.resolve(__dirname, 'src/client/components')],
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {sourceMap: CSS_MAPS, importLoaders: 1}
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                sourceMap: CSS_MAPS,
                                plugins: () => {
                                    autoprefixer({browsers: ['last 2 versions']});
                                }
                            }
                        },
                        {
                            loader: 'less-loader',
                            options: {sourceMap: CSS_MAPS}
                        }
                    ]
                })
            },
            {
                test: /\.json$/,
                use: 'json-loader'
            },
            {
                test: /\.(xml|html|txt|md)$/,
                use: 'raw-loader'
            },
            {
                test: /\.(svg|woff2?|ttf|eot|jpe?g|png|gif)(\?.*)?$/i,
                use: isProduction() ? 'file-loader' : 'url-loader'
            }
        ]
    },
    plugins: ([
        new webpack.NoEmitOnErrorsPlugin(),
        new ExtractTextPlugin({
            filename: 'style.css',
            allChunks: true,
            disable: !isProduction()
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(ENV)
        }),
        new HtmlWebpackPlugin({
            template: './index.ejs',
            minify: {collapseWhitespace: true}
        }),
        new CopyWebpackPlugin([
            {from: './manifest.json', to: './'},
            {from: './favicon.ico', to: './'}
        ])
    ]).concat(isProduction() ? [
        new webpack.optimize.UglifyJsPlugin({
            output: {
                comments: false
            },
            compress: {
                /* eslint-disable camelcase */
                unsafe_comps: true,
                properties: true,
                keep_fargs: false,
                pure_getters: true,
                collapse_vars: true,
                unsafe: true,
                warnings: false,
                screw_ie8: true,
                sequences: true,
                dead_code: true,
                drop_debugger: true,
                comparisons: true,
                conditionals: true,
                evaluate: true,
                booleans: true,
                loops: true,
                unused: true,
                hoist_funs: true,
                if_return: true,
                join_vars: true,
                cascade: true,
                drop_console: true
                /* eslint-enable camelcase */
            }
        }),

        // strip out babel-helper invariant checks
        new ReplacePlugin([{
            // this is actually the property name https://github.com/kimhou/replace-bundle-webpack-plugin/issues/1
            partten: /throw\s+(new\s+)?[a-zA-Z]+Error\s*\(/g,
            replacement: () => 'return;('
        }]),
        new OfflinePlugin({
            relativePaths: false,
            AppCache: false,
            excludes: ['_redirects'],
            ServiceWorker: {
                events: true
            },
            cacheMaps: [
                {
                    match: /.*/,
                    to: '/',
                    requestTypes: ['navigate']
                }
            ],
            publicPath: '/'
        })
    ] : []),

    stats: {colors: true},

    node: {
        global: true,
        process: false,
        Buffer: false,
        __filename: false,
        __dirname: false,
        setImmediate: false
    },

    devtool: 'source-map',

    devServer: {
        port,
        host: 'localhost',
        publicPath: '/',
        contentBase: './src/client',
        historyApiFallback: true,
        open: true,
        proxy: {
            '/api/**': {
                target: 'http://localhost:' + actualServerPort
            }
        }
    }
};
