const HtmlWebpackPlugin = require('html-webpack-plugin');
const pkg = require('./package.json');
const webpack = require('webpack');
const fs = require('fs');
let plugins = [];

module.exports = env => {

  const output = {
    filename: './dist/grapes.min.js',
    library: 'grapesjs',
    libraryTarget: 'umd',
  };

  if (env == 'prod') {
    plugins = [
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.optimize.UglifyJsPlugin({ minimize:true, compressor: {warnings:false}}),
      new webpack.BannerPlugin(`${pkg.name} - ${pkg.version}`),
    ];
  } else if (env == 'dev') {
    output.filename = './dist/grapes.js';
  } else {
    const index = 'index.html';
    const indexDev = `_${index}`;
    const template = fs.existsSync(indexDev) ? indexDev : index;
    plugins.push(new HtmlWebpackPlugin({ template, inject: false }));
  }

  plugins.push(new webpack.ProvidePlugin({
    _: 'underscore',
    Backbone: 'backbone'
  }));

  return {
    entry: './src',
    output: output,
    plugins: plugins,
    module: {
      loaders: [{
        test: /\/index\.js$/,
        loader: 'string-replace-loader',
        query: {
          search: '<# VERSION #>',
          replace: pkg.version
        }
      },{
        test: /\.js$/,
        loader: 'babel-loader',
        include: /src/
      }],
    },
    resolve: {
      modules: ['src', 'node_modules'],
      alias: {
        jquery: 'cash-dom'
      }
    }
  };
}
