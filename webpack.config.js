'use strict';

require('dotenv').config();
const path = require('path');
const webpack = require('webpack');
const moment = require('moment');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtensionReloader = require('webpack-extension-reloader');

const srcPath = path.resolve(__dirname, 'src');
const pagesPath = path.resolve(srcPath, 'pages');
const pkg = require('./package');

const fileExtensions = [
  'jpg', 'jpeg', 'png', 'gif',
  'eot', 'otf', 'ttf', 'woff', 'woff2',
];

const {
  npm_package_description,
  npm_package_version,
  NODE_ENV,
  SERVER_HOST,
} = process.env;

const isProd = NODE_ENV === 'production';

const plugins = [
  new webpack.ProgressPlugin(),
  new HtmlWebpackPlugin({
    template: path.join(srcPath, 'template.html'),
    filename: 'options.html',
    chunks: [ 'options' ],
    minify: false,
  }),
  new HtmlWebpackPlugin({
    template: path.join(srcPath, 'template.html'),
    filename: 'background.html',
    chunks: [ 'background' ],
    minify: false,
  }),
  new HtmlWebpackPlugin({
    template: path.join(srcPath, 'template.html'),
    filename: 'sandbox.html',
    chunks: [ 'sandbox' ],
    minify: false,
  }),
  new CopyWebpackPlugin({
    patterns: [
      {
        from: path.join(srcPath, 'manifest.json'),
        transform(content) {
          return Buffer.from(JSON.stringify({
            description: npm_package_description,
            version: npm_package_version,
            ...JSON.parse(content.toString()),
          }, null, 2));
        },
      },
    ],
  }),
  new webpack.DefinePlugin({
    'process.env.VERSION': JSON.stringify(pkg.version),
    'process.env.BUILD_TIME': JSON.stringify(moment().format('MMDDHHmm')),
    'process.env.SERVER_HOST': JSON.stringify(SERVER_HOST),
  }),
];

const entries = {
  contentScript: 'content_scripts',
  background: 'background',
  extensionPage: [
    'options',
    'sandbox',
  ],
};

if (isProd) {
  plugins.unshift(new CleanWebpackPlugin());
} else {
  plugins.push(new ExtensionReloader({
    reloadPage: true,
    entries,
  }));
}

const entry = {
  [entries.background]: path.join(pagesPath, entries.background),
  [entries.contentScript]: path.join(pagesPath, entries.contentScript),
};

entries.extensionPage.map(item => {
  entry[item] = path.join(pagesPath, item);
});

const options = {
  entry,
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      }, {
        test: /\.less$/,
        exclude(filePath) {
          return filePath.endsWith('.module.less');
        },
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'less-loader',
          },
        ],
      }, {
        test: /\.module\.less$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[name]_[local]_[hash:base64:5]',
            },
          },
          {
            loader: 'less-loader',
          },
        ],
      }, {
        test: /.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
        ],
      }, {
        test: new RegExp('\.(' + fileExtensions.join('|') + ')$'),
        loader: 'file-loader?name=[name].[ext]',
        exclude: /node_modules/,
      }, {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    alias: {
      '@': srcPath,
    },
    modules: [
      'node_modules',
    ],
    extensions: [
      '*',
      '.js', '.jsx', '.json',
      '.less', '.css',
    ].concat(fileExtensions.map(item => `.${item}`)),
  },
  plugins,
  devtool: 'cheap-module-eval-source-map',
  watch: !isProd,
  devServer: {
    overlay: true,
    hot: false,
    writeToDisk: true,
    disableHostCheck: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  optimization: {
    minimize: false,
  },
};

module.exports = options;
