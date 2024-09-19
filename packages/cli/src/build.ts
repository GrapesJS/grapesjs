import {
  printRow,
  printError,
  buildWebpackArgs,
  normalizeJsonOpt,
  copyRecursiveSync,
  rootResolve,
  babelConfig,
  log,
  writeFile,
} from './utils';
import { generateDtsBundle } from 'dts-bundle-generator';
import webpack from 'webpack';
import fs from 'fs';
import webpackConfig from './webpack.config';
import { exec } from 'child_process';
import chalk from 'chalk';
import rimraf from 'rimraf';
import { transformFileSync } from '@babel/core';

interface BuildOptions {
  verbose?: boolean;
  patch?: boolean;
  statsOutput?: string;
  localePath?: string;
  dts?: 'include' | 'skip' | 'only';
}

/**
 * Build locale files
 * @param {Object} opts
 */
export const buildLocale = async (opts: BuildOptions = {}) => {
  const { localePath } = opts;
  if (!fs.existsSync(rootResolve(localePath))) return;
  printRow('Start building locale files...', { lineDown: 0 });

  await rimraf('locale');

  const localDst = rootResolve('locale');
  copyRecursiveSync(rootResolve(localePath), localDst);

  // Create locale/index.js file
  let result = '';
  fs.readdirSync(localDst).forEach((file) => {
    const name = file.split('.')[0];
    result += `export { default as ${name} } from './${name}'\n`;
  });
  fs.writeFileSync(`${localDst}/index.js`, result);

  // Compile files
  const babelOpts = { ...babelConfig(buildWebpackArgs(opts) as any) };
  fs.readdirSync(localDst).forEach((file) => {
    const filePath = `${localDst}/${file}`;
    const compiled = transformFileSync(filePath, babelOpts).code;
    fs.writeFileSync(filePath, compiled);
  });

  printRow('Locale files building completed successfully!');
};

/**
 * Build TS declaration file
 * @param {Object} opts
 */
export const buildDeclaration = async (opts: BuildOptions = {}) => {
  const filePath = rootResolve('src/index.ts');
  if (!fs.existsSync(filePath)) return;

  printRow('Start building TS declaration file...', { lineDown: 0 });

  const entry = { filePath, output: { noBanner: true } };
  const bundleOptions = { preferredConfigPath: rootResolve('tsconfig.json') };
  const result = generateDtsBundle([entry], bundleOptions)[0];
  await writeFile(rootResolve('dist/index.d.ts'), result);

  printRow('TS declaration file building completed successfully!');
};

/**
 * Build the library files
 * @param {Object} opts
 */
export default (opts: BuildOptions = {}) => {
  printRow('Start building the library...');
  const isVerb = opts.verbose;
  const { dts } = opts;
  isVerb && log(chalk.yellow('Build config:\n'), opts, '\n');

  const buildWebpack = () => {
    const buildConf = {
      ...webpackConfig({
        production: 1,
        args: buildWebpackArgs(opts),
        cmdOpts: opts,
      }),
      ...normalizeJsonOpt(opts, 'config'),
    };

    if (dts === 'only') {
      return buildDeclaration(opts);
    }

    webpack(buildConf, async (err, stats) => {
      const errors = err || (stats ? stats.hasErrors() : false);
      const statConf = {
        hash: false,
        colors: true,
        builtAt: false,
        entrypoints: false,
        modules: false,
        ...normalizeJsonOpt(opts, 'stats'),
      };

      if (stats) {
        opts.statsOutput && fs.writeFileSync(rootResolve(opts.statsOutput), JSON.stringify(stats.toJson()));
        isVerb && log(chalk.yellow('Stats config:\n'), statConf, '\n');
        const result = stats.toString(statConf);
        log(result, '\n');
      }

      await buildLocale(opts);

      if (dts !== 'skip') {
        await buildDeclaration(opts);
      }

      if (errors) {
        printError(`Error during building`);
        console.error(err);
      } else {
        printRow('Building completed successfully!');
      }
    });
  };

  if (opts.patch) {
    isVerb && log(chalk.yellow('Patch the version'), '\n');
    exec('npm version --no-git-tag-version patch', buildWebpack);
  } else {
    buildWebpack();
  }
};
