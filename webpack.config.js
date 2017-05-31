//webpack --display-reasons
var name = 'grapesjs';

module.exports = {
  entry: './src/main',
  output: {
      filename: './dist/' + name + '.min.js',
      library: name,
      libraryTarget: 'umd',
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
  /*
  module: {
    loaders: [
      { test: /underscore/, loader: 'exports?_' },
      { test: /backbone/, loader: 'exports?Backbone!imports?underscore,jquery' },
      { test: /rte/, loader: 'exports?rte!imports?jquery' },
      { test: /backbone-undo/, loader: 'exports?backboneUndo!imports?backbone' },
      { test: /keymaster/, loader: 'exports?keymaster' },
    ]
  }*/
}

/*
amd: { jQuery: true }
var webpack = require('webpack');
var pkg = require('./package.json');
var name = 'grapesjs-plugin-ckeditor';
var env = process.env.WEBPACK_ENV;
var plugins = [];

plugins: [
  new webpack.IgnorePlugin(/^\.\/locale$/, [/moment$/]), // saves ~100k from build
  new webpack.optimize.UglifyJsPlugin({minimize: true}),
  new webpack.BannerPlugin(pkg.name + ' - ' + pkg.version),
  new webpack.DefinePlugin({'process.env.NODE_ENV': '"production"'})
]

module.exports = {
  entry: './src/main',
  output: {
      filename: './dist/' + name + '.min.js',
      library: name,
      libraryTarget: 'umd',
  },
  module: {
    preLoaders: [
        { test: /\.json$/, loader: 'json'},
    ],
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: /src/,
        query: {
          presets: ['es2015']
        }
      },
    ],
  },
  plugins: plugins
};
 */
