const path = require('path');
const rootDir = path.resolve(__dirname);

module.exports = ({ config, pkg, webpack }) => {
  const { BUILD_MODULE } = process.env;

  return {
    ...config,
    output: {
      ...config.output,
      filename: BUILD_MODULE ? 'grapes.mjs' : 'grapes.min.js',
      ...(BUILD_MODULE ? {
        libraryTarget: 'module',
        library: { type: 'module' },
      } : {
        libraryExport: 'default'
      })
    },
    optimization: {
      ...config.optimization,
      minimize: !BUILD_MODULE,
    },
    devServer: {
      ...config.devServer,
      static: [rootDir],
      headers: { 'Access-Control-Allow-Origin': '*' },
      allowedHosts: 'all',
    },
    experiments: {
      outputModule: !!BUILD_MODULE,
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
  }
};
