const path = require('path');
const rootDir = path.resolve(__dirname);

module.exports = ({ config }) => {
  const { BUILD_MODULE } = process.env;

  return {
    ...config,
    output: {
      ...config.output,
      filename: BUILD_MODULE ? 'index.mjs' : 'index.js',
      ...(BUILD_MODULE
        ? {
            libraryTarget: 'module',
            library: { type: 'module' },
          }
        : {
            library: 'grapesjsWebMcp',
          }),
    },
    optimization: {
      ...config.optimization,
      minimize: !BUILD_MODULE,
    },
    devServer: {
      ...config.devServer,
      // Serve the local GrapesJS build for the demo (index.html)
      static: [rootDir, { directory: path.resolve(rootDir, '../core/dist'), publicPath: '/grapesjs' }],
    },
    experiments: {
      outputModule: !!BUILD_MODULE,
    },
    // GrapesJS is only referenced for types, keep it out of the bundle in any case.
    // The ES module imports zod from the dependencies (deduped with the consumer's copy), UMD bundles it.
    externals: BUILD_MODULE ? { grapesjs: 'grapesjs', 'zod/mini': 'zod/mini' } : { grapesjs: 'grapesjs' },
    ...(BUILD_MODULE ? { externalsType: 'module' } : {}),
  };
};
