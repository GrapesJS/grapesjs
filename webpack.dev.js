const name = 'grapes';

const webpack = require('webpack');
const merge = require('webpack-merge');

const pkg = require('./package.json');
const commonConfig = require('./webpack.common.js');

module.exports = merge(commonConfig, {
  output: {
    filename: './dist/' + name + '.js',
    library: 'grapesjs',
    libraryTarget: 'umd',
  },
});
