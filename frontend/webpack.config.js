const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  const isDevelopment = !isProduction;

  return {
    // Entry point of the application
    entry: {
      main: './src/index.js',
    },

    // Output configuration
    output: {
      path: path.resolve(__dirname, 'build'),
      filename: isProduction 
        ? 'static/js/[name].[contenthash:8].js' 
        : 'static/js/bundle.js',
      chunkFilename: isProduction 
        ? 'static/js/[name].[contenthash:8].chunk.js' 
        : 'static/js/[name].chunk.js',
      assetModuleFilename: 'static/media/[name].[hash][ext]',
      publicPath: '/',
    },

    // Module resolution
    resolve: {
      extensions: ['.js', '.jsx', '.json', '.css', '.scss', '.ts', '.tsx'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@hooks': path.resolve(__dirname, 'src/hooks'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@store': path.resolve(__dirname, 'src/store'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@context': path.resolve(__dirname, 'src/context'),
        '@assets': path.resolve(__dirname, 'src/assets'),
      },
      fallback: {
        fs: false,
        path: false,
        os: false,
        crypto: false,
      },
    },

    // Module rules
    module: {
      rules: [
        // JavaScript/JSX files
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { modules: false }],
                ['@babel/preset-react', { runtime: 'automatic' }]
              ],
              plugins: [
                '@babel/plugin-transform-runtime',
                '@babel/plugin-proposal-class-properties',
                '@babel/plugin-proposal-optional-chaining',
                '@babel/plugin-proposal-nullish-coalescing-operator',
              ],
              cacheDirectory: true,
              cacheCompression: false,
            },
          },
        },

        // CSS files
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                sourceMap: isDevelopment,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  ident: 'postcss',
                  plugins: [
                    require('tailwindcss'),
                    require('autoprefixer'),
                  ],
                },
                sourceMap: isDevelopment,
              },
            },
          ],
        },

        // SCSS/SASS files
        {
          test: /\.(scss|sass)$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 2,
                sourceMap: isDevelopment,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [require('tailwindcss'), require('autoprefixer')],
                },
                sourceMap: isDevelopment,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: isDevelopment,
              },
            },
          ],
        },

        // Images
        {
          test: /\.(png|svg|jpg|jpeg|gif|webp|ico)$/,
          type: 'asset/resource',
          generator: {
            filename: 'static/images/[name].[hash:8][ext]',
          },
        },

        // Fonts
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource',
          generator: {
            filename: 'static/fonts/[name].[hash:8][ext]',
          },
        },

        // Videos
        {
          test: /\.(mp4|webm)$/,
          type: 'asset/resource',
          generator: {
            filename: 'static/videos/[name].[hash:8][ext]',
          },
        },
      ],
    },

    // Plugins
    plugins: [
      // Clean build folder
      new CleanWebpackPlugin(),

      // Generate HTML file
      new HtmlWebpackPlugin({
        template: './public/index.html',
        filename: 'index.html',
        favicon: './public/favicon.ico',
        manifest: './public/manifest.json',
        inject: true,
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        } : false,
      }),

      // Extract CSS into separate files
      new MiniCssExtractPlugin({
        filename: isProduction 
          ? 'static/css/[name].[contenthash:8].css' 
          : 'static/css/[name].css',
        chunkFilename: isProduction 
          ? 'static/css/[name].[contenthash:8].chunk.css' 
          : 'static/css/[name].chunk.css',
      }),

      // Copy static assets
      new CopyWebpackPlugin({
        patterns: [
          { from: 'public/robots.txt', to: 'robots.txt', noErrorOnMissing: true },
          { from: 'public/sitemap.xml', to: 'sitemap.xml', noErrorOnMissing: true },
          { from: 'public/logo192.png', to: 'logo192.png', noErrorOnMissing: true },
          { from: 'public/logo512.png', to: 'logo512.png', noErrorOnMissing: true },
        ],
      }),

      // Define environment variables
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(process.env),
      }),

      // Provide React as global
      new webpack.ProvidePlugin({
        React: 'react',
      }),

      // Enable HMR for development
      isDevelopment && new webpack.HotModuleReplacementPlugin(),

      // Ignore moment.js locale files (reduces bundle size)
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      }),
    ].filter(Boolean),

    // Optimization
    optimization: {
      minimize: isProduction,
      minimizer: [
        // Minify JavaScript
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction,
              drop_debugger: isProduction,
              pure_funcs: isProduction ? ['console.log', 'console.info', 'console.debug'] : [],
            },
            format: {
              comments: false,
            },
          },
          extractComments: false,
          parallel: true,
        }),
        // Minify CSS
        new CssMinimizerPlugin({
          parallel: true,
        }),
      ],
      
      // Split chunks for better caching
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // React vendor
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom|react-router)[\\/]/,
            name: 'react-vendor',
            chunks: 'all',
            priority: 20,
          },
          // UI vendor
          ui: {
            test: /[\\/]node_modules[\\/](framer-motion|react-icons|recharts|chart.js)[\\/]/,
            name: 'ui-vendor',
            chunks: 'all',
            priority: 15,
          },
          // API/HTTP vendor
          api: {
            test: /[\\/]node_modules[\\/](axios|socket.io-client)[\\/]/,
            name: 'api-vendor',
            chunks: 'all',
            priority: 10,
          },
          // All other vendors
          vendors: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 5,
          },
          // Common chunks
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 0,
            reuseExistingChunk: true,
          },
        },
      },
      
      // Runtime chunk
      runtimeChunk: {
        name: 'runtime',
      },
      
      // Module ids
      moduleIds: isProduction ? 'deterministic' : 'named',
      chunkIds: isProduction ? 'deterministic' : 'named',
      
      // Used exports
      usedExports: true,
      sideEffects: true,
    },

    // Development server
    devServer: {
      port: 3000,
      hot: true,
      open: true,
      historyApiFallback: true,
      compress: true,
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
        logging: 'info',
        progress: true,
      },
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          pathRewrite: { '^/api': '/api' },
        },
        '/ws': {
          target: 'ws://localhost:8000',
          ws: true,
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        },
      },
      static: {
        directory: path.join(__dirname, 'public'),
        publicPath: '/',
      },
      setupMiddlewares: (middlewares, devServer) => {
        if (!devServer) {
          throw new Error('webpack-dev-server is not attached');
        }

        devServer.app.get('/health', (req, res) => {
          res.json({ status: 'OK', timestamp: Date.now() });
        });

        return middlewares;
      },
    },

    // Performance hints
    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000,
      assetFilter: (assetFilename) => {
        return assetFilename.endsWith('.js') || assetFilename.endsWith('.css');
      },
    },

    // Source maps
    devtool: isProduction ? 'source-map' : 'eval-source-map',

    // Cache
    cache: {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
      cacheDirectory: path.resolve(__dirname, '.webpack-cache'),
      compression: 'gzip',
    },

    // Stats
    stats: {
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false,
      assets: true,
      errors: true,
      errorDetails: true,
      warnings: true,
    },

    // Target
    target: 'web',

    // Bail on first error
    bail: isProduction,
  };
};