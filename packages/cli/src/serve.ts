import { printRow, buildWebpackArgs, log, normalizeJsonOpt } from './utils';
import webpack from 'webpack';
import webpackDevServer from 'webpack-dev-server';
import webpackConfig from './webpack.config';
import chalk from 'chalk';

interface ServeOptions {
  host?: string;
  port?: number;
  verbose?: boolean;
}

/**
 * Start up the development server
 * @param {Object} opts
 */
export default (opts: ServeOptions = {}) => {
  printRow('Start the development server...');
  const { host, port } = opts;
  const isVerb = opts.verbose;
  const resultWebpackConf = {
    ...webpackConfig({ args: buildWebpackArgs(opts), cmdOpts: opts }),
    ...normalizeJsonOpt(opts, 'webpack'),
  };
  const devServerConf = {
    ...resultWebpackConf.devServer,
    open: true,
    ...normalizeJsonOpt(opts, 'devServer'),
  };

  if (host !== 'localhost') {
    devServerConf.host = host;
  }

  if (port !== 8080) {
    devServerConf.port = port;
  }

  if (isVerb) {
    log(chalk.yellow('Server config:\n'), opts, '\n');
    log(chalk.yellow('DevServer config:\n'), devServerConf, '\n');
  }

  const compiler = webpack(resultWebpackConf);
  const server = new webpackDevServer(devServerConf, compiler);

  server.start();
};
