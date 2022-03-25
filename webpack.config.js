import path from 'path';
import webpack from 'webpack';
import pkg from './package.json';
import TerserPlugin from 'grapesjs-cli/node_modules/terser-webpack-plugin';

const rootDir = path.resolve(__dirname);

export default ({ config }) => ({
  ...config,
  output: {
    ...config.output,
    filename: 'grapes.min.js',
    libraryExport: 'default',
  },
  optimization: {
    minimizer: [new TerserPlugin({
      extractComments: false,
      terserOptions: {
        output: {
          comments: false,
          quote_style: 3, // Preserve original quotes
          preamble: `/*! grapesjs - ${pkg.version} */`,
        }
      }
    })],
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