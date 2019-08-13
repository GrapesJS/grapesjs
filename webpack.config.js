const HtmlWebpackPlugin = require('html-webpack-plugin');
const pkg = require('./package.json');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const rootDir = path.resolve(__dirname);
let plugins = [];

module.exports = env => {
  const name = pkg.name;
  const isProd = env === 'prod';
  const output = {
    path: path.join(__dirname),
    filename: 'dist/grapes.min.js',
    library: name,
    libraryExport: 'default',
    libraryTarget: 'umd',
  };

  if (isProd) {
    plugins = [
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.BannerPlugin(`${name} - ${pkg.version}`),
    ];
  } else if (env === 'dev') {
    output.filename = 'dist/grapes.js';
  } else {
    const index = 'index.html';
    const indexDev = `_${index}`;
    const template = fs.existsSync(indexDev) ? indexDev : index;
    plugins.push(new HtmlWebpackPlugin({ template, inject: false }));
  }

  return {
    entry: './src',
    output: output,
    plugins: plugins,
    mode: isProd ? 'production' : 'development',
    devtool: isProd ? 'source-map' : (!env ? 'cheap-module-eval-source-map' : false),
    devServer: {
      headers: { 'Access-Control-Allow-Origin': '*' },
      disableHostCheck: true,
    },
    module: {
      rules: [{
        test: /\/index\.js$/,
        loader: 'string-replace-loader',
        query: {
          search: '<# VERSION #>',
          replace: pkg.version
        }
      }, {
        test: /\.js$/,
        loader: 'babel-loader',
        include: /src/,
        options: { cacheDirectory: true },
      }],
    },
    resolve: {
      modules: ['src', 'node_modules'],
      alias: {
        jquery: 'cash-dom',
        backbone: `${rootDir}/node_modules/backbone`,
        underscore: `${rootDir}/node_modules/underscore`,
      }
    }
  };
}
