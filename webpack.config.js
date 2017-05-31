//webpack --display-reasons
//Remove jquery https://github.com/webpack/webpack/issues/1275
//Migrateing https://webpack.js.org/guides/migrating/
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

plugins.push(new webpack.ProvidePlugin({$: 'jquery'}));
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
        test: /\.js$/,
        loader: 'babel-loader',
        include: /src/,
        exclude: /node_modules/,
        query: {presets: ['es2015']}
    }],
  },
  resolve: {
    modulesDirectories: ['src', 'node_modules'],
    alias: {
      jquery: 'jquery/dist/jquery',
      underscore: 'underscore/underscore',
      backbone: 'backbone/backbone',
      backboneUndo: 'backbone-undo/Backbone.Undo',
      keymaster: 'keymaster/keymaster',
      text: 'requirejs-text/text',
      Spectrum: 'spectrum-colorpicker/spectrum',
      codemirror: 'codemirror',
      formatting: 'codemirror-formatting/formatting',
      PluginManager: 'plugin_manager',
      Abstract: 'domain_abstract',
      Editor: 'editor',
      AssetManager: 'asset_manager',
      BlockManager: 'block_manager',
      TraitManager: 'trait_manager',
      StyleManager: 'style_manager',
      DeviceManager: 'device_manager',
      StorageManager: 'storage_manager',
      PluginManager: 'plugin_manager',
      Navigator: 'navigator',
      DomComponents: 'dom_components',
      RichTextEditor: 'rich_text_editor',
      SelectorManager: 'selector_manager',
      ModalDialog: 'modal_dialog',
      CodeManager: 'code_manager',
      CssComposer: 'css_composer',
      Commands: 'commands',
      Canvas: 'canvas',
      Panels: 'panels',
      Parser: 'parser',
      Utils: 'utils',
    }
  },
}
