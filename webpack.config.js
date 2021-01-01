import path from 'path';
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
      {
        test: /\/index\.js$/,
        loader: 'string-replace-loader',
        query: {
          search: '<# VERSION #>',
          replace: pkg.version
        }
      },
      ...config.module.rules,
    ],
  },
  resolve: {
    modules: ['src', 'node_modules'],
    alias: {
      jquery: 'cash-dom',
      backbone: `${rootDir}/node_modules/backbone`,
      underscore: `${rootDir}/node_modules/underscore`,
    }
  },
});