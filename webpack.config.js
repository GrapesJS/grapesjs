import path from 'path';
import webpack from 'webpack';
import pkg from './package.json';

const rootDir = path.resolve(__dirname);

export default ({ config }) => ({
  ...config,
  output: {
    ...config.output,
    filename: 'grapes.min.js',
    libraryExport: 'default',
  },
  devServer: {
    headers: { 'Access-Control-Allow-Origin': '*' },
    disableHostCheck: true,
  },
  module: {
    rules: [
      ...config.module.rules,
    ],
  },
  resolve: {
    modules: ['src', 'node_modules'],
    alias: {
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