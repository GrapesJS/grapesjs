const path = require('path');
const rootDir = path.resolve(__dirname);

module.exports = ({ config, pkg, webpack }) => ({
  ...config,
  output: {
    ...config.output,
    filename: 'grapes.min.js',
    // This will assign all exports to the global object
    library: undefined,
  },
  devServer: {
    ...config.devServer,
    static: [rootDir],
    headers: { 'Access-Control-Allow-Origin': '*' },
    allowedHosts: 'all',
  },
  resolve: {
    ...config.resolve,
    modules: [
      ...(config.resolve && config.resolve.modules),
      'src'
    ],
    alias: {
      ...(config.resolve && config.resolve.alias),
      jquery: 'utils/cash-dom',
      backbone: `${rootDir}/node_modules/backbone`,
      underscore: `${rootDir}/node_modules/underscore`,
    }
  },
  plugins: [
    new webpack.DefinePlugin({ __GJS_VERSION__: `'${pkg.version}'` }),
    ...config.plugins,
  ]
});
