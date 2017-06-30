//webpack --display-reasons
//Remove jquery https://github.com/webpack/webpack/issues/1275
var webpack = require('webpack');
var pkg = require('./package.json');
var env = process.env.WEBPACK_ENV;
var name = 'grapes';
var plugins = [];

if(env !== 'dev'){
  plugins = [
    new webpack.optimize.UglifyJsPlugin({
      //sourceMap: true,
      minimize: true,
      compressor: {warnings: false},
    }),
    new webpack.BannerPlugin(pkg.name + ' - ' + pkg.version),
    //v2 new webpack.BannerPlugin({banner: 'Banner v2'});
  ]
}

plugins.push(new webpack.ProvidePlugin({_: 'underscore'}));

module.exports = {
  entry: './src',
  output: {
      filename: './dist/' + name + '.min.js',
      library: 'grapesjs',
      libraryTarget: 'umd',
  },
  externals: {jquery: 'jQuery'},
  plugins: plugins,
  module: {
    loaders: [{
        test: /\.js$/,
        loader: 'babel-loader',
        include: /src/,
        exclude: /node_modules/,
        query: {presets: ['es2015']}
    }],
  },
  resolve: {
    modules: ['src', 'node_modules'],
  },
}
