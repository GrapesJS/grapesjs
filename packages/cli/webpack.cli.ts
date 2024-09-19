import webpack, { type Configuration } from 'webpack';
import NodeExternals from 'webpack-node-externals';
import CopyPlugin from 'copy-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { resolve } from 'path';

const MODE = process.env.BUILD_MODE === 'production' ? 'production' : 'development';

const config: Configuration = {
  context: process.cwd(),
  mode: MODE,
  entry: './src/cli.ts',
  output: {
    filename: 'cli.js',
    path: resolve(__dirname, 'dist'),
  },
  target: 'node',
  stats: {
    preset: 'minimal',
    warnings: false,
  },
  module: {
    rules: [
      {
        test: /\.(jsx?|tsx?)$/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: ['@babel/preset-typescript'],
            assumptions: {
              setPublicClassFields: false,
            },
          },
        },
        exclude: [/node_modules/],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.d.ts'],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin(),
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
    new CopyPlugin({
      patterns: [
        { from: 'src/banner.txt', to: 'banner.txt' },
        {
          from: 'src/template',
          to: 'template',
          // Terser skip this file for minimization
          info: { minimized: true },
        },
      ],
    }),
  ],
  externalsPresets: { node: true },
  externals: [NodeExternals()],
};

export default config;
