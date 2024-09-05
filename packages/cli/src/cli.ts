import yargs from 'yargs';
import fs from 'fs';
import path from 'path';
import { serve, build, init } from './main';
import chalk from 'chalk';
import { printError } from './utils';
import { version } from '../package.json';

yargs.usage(chalk.green.bold(fs.readFileSync(path.resolve(__dirname, './banner.txt'), 'utf8') + `\nv${version}`));

const webpackOptions = (yargs) => {
  yargs
    .positional('config', {
      describe: 'webpack configuration options',
      type: 'string',
      default: '{}',
    })
    .positional('babel', {
      describe: 'Babel configuration object',
      type: 'string',
      default: '{}',
    })
    .positional('targets', {
      describe: 'Browser targets in browserslist query',
      type: 'string',
      default: '> 0.25%, not dead',
    })
    .positional('entry', {
      describe: 'Library entry point',
      type: 'string',
      default: 'src/index',
    })
    .positional('output', {
      describe: 'Build destination directory',
      type: 'string',
      default: 'dist',
    });
};

export const createCommands = (yargs) => {
  return yargs
    .command(
      ['serve [port]', 'server'],
      'Start the server',
      (yargs) => {
        yargs
          .positional('devServer', {
            describe: 'webpack-dev-server options',
            type: 'string',
            default: '{}',
          })
          .positional('host', {
            alias: 'h',
            describe: 'Host to bind on',
            type: 'string',
            default: 'localhost',
          })
          .positional('port', {
            alias: 'p',
            describe: 'Port to bind on',
            type: 'number',
            default: 8080,
          })
          .positional('htmlWebpack', {
            describe: 'html-webpack-plugin options',
            type: 'string',
            default: '{}',
          });
        webpackOptions(yargs);
      },
      (argv) => serve(argv),
    )
    .command(
      'build',
      'Build the source',
      (yargs) => {
        yargs
          .positional('stats', {
            describe: 'Options for webpack Stats instance',
            type: 'string',
            default: '{}',
          })
          .positional('statsOutput', {
            describe: 'Specify the path where to output webpack stats file (eg. "stats.json")',
            type: 'string',
            default: '',
          })
          .positional('patch', {
            describe: 'Increase automatically the patch version',
            type: 'boolean',
            default: true,
          })
          .positional('localePath', {
            describe: 'Path to the directory containing locale files',
            type: 'string',
            default: 'src/locale',
          })
          .positional('dts', {
            describe: 'Generate typescript dts file ("include", "skip", "only")',
            type: 'string',
            default: 'include',
          });
        webpackOptions(yargs);
      },
      (argv) => build(argv),
    )
    .command(
      'init',
      'Init GrapesJS plugin project',
      (yargs) => {
        yargs
          .positional('yes', {
            alias: 'y',
            describe: 'All default answers',
            type: 'boolean',
            default: false,
          })
          .positional('name', {
            describe: 'Name of the project',
            type: 'string',
          })
          .positional('rName', {
            describe: 'Repository name',
            type: 'string',
          })
          .positional('user', {
            describe: 'Repository username',
            type: 'string',
          })
          .positional('components', {
            describe: 'Indicate to include custom component types API',
            type: 'boolean',
          })
          .positional('blocks', {
            describe: 'Indicate to include blocks API',
            type: 'boolean',
          })
          .positional('i18n', {
            describe: 'Indicate to include the support for i18n',
            type: 'boolean',
          })
          .positional('license', {
            describe: 'License of the project',
            type: 'string',
          });
      },
      (argv) => init(argv),
    )
    .options({
      verbose: {
        alias: 'v',
        description: 'Run with verbose logging',
        type: 'boolean', // boolean | number | string
        default: false,
      },
    })
    .recommendCommands()
    .strict();
};

export const argsToOpts = async () => {
  return await createCommands(yargs).parse();
};

export const run = async (opts = {}) => {
  try {
    let options = await argsToOpts();
    if (!options._.length) yargs.showHelp();
  } catch (error) {
    printError((error.stack || error).toString());
  }
};

run();
