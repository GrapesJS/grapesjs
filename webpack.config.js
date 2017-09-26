var webpack = require('webpack');
var pkg = require('./package.json');
var env = process.env.WEBPACK_ENV;
var name = 'grapes';
var plugins = [];

if(env !== 'dev') {
  plugins = [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      compressor: {warnings: false},
    }),
    new webpack.BannerPlugin(pkg.name + ' - ' + pkg.version),
  ]
}

plugins.push(new webpack.ProvidePlugin({
  _: 'underscore',
  Backbone: 'backbone'
}));

module.exports = {
  entry: './src',
  output: {
      filename: './dist/' + name + '.min.js',
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
