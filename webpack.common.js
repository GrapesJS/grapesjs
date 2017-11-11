const webpack = require('webpack');
const pkg = require('./package.json');

const env = process.env.WEBPACK_ENV;
const name = 'grapes';


module.exports = {
  entry: './src',
  output: {
      filename: './dist/' + name + '.js',
      library: 'grapesjs',
      libraryTarget: 'umd',
  },
  externals: {
    jquery: {
      commonjs2: 'jquery',
      commonjs: 'jquery',
      amd: 'jquery',
      root: 'jQuery'
    }
  },
  plugins: [
    new webpack.ProvidePlugin({_: 'underscore'})
  ],
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
  },
}
