var HtmlWebpackPlugin = require('html-webpack-plugin');
var pkg = require('./package.json');
var webpack = require('webpack');
var fs = require('fs');
var plugins = [];

if (process.env.WEBPACK_ENV !== 'dev') {
  plugins = [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.UglifyJsPlugin({ minimize:true, compressor: {warnings:false}}),
    new webpack.BannerPlugin(pkg.name + ' - ' + pkg.version),
  ]
} else {
  var index = 'index.html';
  var indexDev = '_' + index;
  plugins.push(new HtmlWebpackPlugin({
    template: fs.existsSync(indexDev) ? indexDev : index
  }));
}

plugins.push(new webpack.ProvidePlugin({
  _: 'underscore',
  Backbone: 'backbone'
}));

module.exports = {
  entry: './src',
  output: {
      filename: './dist/grapes.min.js',
      library: 'grapesjs',
      libraryTarget: 'umd',
  },
  plugins: plugins,
  module: {
    loaders: [{
        test: /grapesjs\/index\.js$/,
        loader: 'string-replace-loader',
        query: {
          search: '<# VERSION #>',
          replace: pkg.version
        }
      },{
        test: /\.js$/,
        loader: 'babel-loader',
        include: /src/,
        exclude: /node_modules/
    }],
  },
  resolve: {
    modules: ['src', 'node_modules'],
    alias: {
      jquery: 'cash-dom'
    }
  },
}
