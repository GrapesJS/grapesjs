const name = 'grapes';

const webpack = require('webpack');
const merge = require('webpack-merge');

const pkg = require('./package.json');
const commonConfig = require('./webpack.common.js');


module.exports = merge(commonConfig, {
  output: {
    filename: './dist/' + name + '.min.js',
    library: 'grapesjs',
    libraryTarget: 'umd',
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      compressor: {warnings: false},
    }),
    new webpack.BannerPlugin(pkg.name + ' - ' + pkg.version),
  ]
});
