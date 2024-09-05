import inquirer from 'inquirer';
import { printRow, isUndefined, log, ensureDir } from './utils';
import Listr from 'listr';
import path from 'path';
import fs from 'fs';
import spdxLicenseList from 'spdx-license-list/full';
import template from 'lodash.template';
import { version } from '../package.json';

interface InitOptions {
  license?: string;
  name?: string;
  components?: boolean;
  blocks?: boolean;
  i18n?: boolean;
  verbose?: boolean;
  rName?: string;
  user?: string;
  yes?: boolean;
}

const tmpPath = './template';
const rootPath = process.cwd();

const getName = (str: string) =>
  str
    .replace(/\_/g, '-')
    .split('-')
    .filter((i) => i)
    .map((i) => i[0].toUpperCase() + i.slice(1))
    .join(' ');

const getTemplateFileContent = (pth: string) => {
  const pt = path.resolve(__dirname, `${tmpPath}/${pth}`);
  return fs.readFileSync(pt, 'utf8');
};

const resolveRoot = (pth: string) => {
  return path.resolve(rootPath, pth);
};

const resolveLocal = (pth: string) => {
  return path.resolve(__dirname, `${tmpPath}/${pth}`);
};

const createSourceFiles = async (opts: InitOptions = {}) => {
  const rdmSrc = getTemplateFileContent('README.md');
  const rdmDst = resolveRoot('README.md');
  const indxSrc = getTemplateFileContent('src/index.js');
  const indxDst = resolveRoot('src/index.js');
  const indexCnt = getTemplateFileContent('_index.html');
  const indexDst = resolveRoot('_index.html');
  const license = spdxLicenseList[opts.license];
  const licenseTxt =
    license &&
    (license.licenseText || '')
      .replace('<year>', `${new Date().getFullYear()}-current`)
      .replace('<copyright holders>', opts.name);
  ensureDir(indxDst);
  // write src/_index.html
  fs.writeFileSync(indxDst, template(indxSrc)(opts).trim());
  // write _index.html
  fs.writeFileSync(indexDst, template(indexCnt)(opts));
  // Write README.md
  fs.writeFileSync(rdmDst, template(rdmSrc)(opts));
  // write LICENSE
  licenseTxt && fs.writeFileSync(resolveRoot('LICENSE'), licenseTxt);
  // Copy files
  fs.copyFileSync(resolveLocal('.gitignore-t'), resolveRoot('.gitignore'));
  fs.copyFileSync(resolveLocal('.npmignore-t'), resolveRoot('.npmignore'));
  fs.copyFileSync(resolveLocal('tsconfig.json'), resolveRoot('tsconfig.json'));
};

const createFileComponents = (opts: InitOptions = {}) => {
  const filepath = 'src/components.js';
  const cmpSrc = resolveLocal(filepath);
  const cmpDst = resolveRoot(filepath);
  opts.components && fs.copyFileSync(cmpSrc, cmpDst);
};

const createFileBlocks = (opts: InitOptions = {}) => {
  const filepath = 'src/blocks.js';
  const blkSrc = resolveLocal(filepath);
  const blkDst = resolveRoot(filepath);
  opts.blocks && fs.copyFileSync(blkSrc, blkDst);
};

const createI18n = (opts = {}) => {
  const enPath = 'src/locale/en.js';
  const tmpEn = getTemplateFileContent(enPath);
  const dstEn = resolveRoot(enPath);
  ensureDir(dstEn);
  fs.writeFileSync(dstEn, template(tmpEn)(opts));
};

const createPackage = (opts = {}) => {
  const filepath = 'package.json';
  const cnt = getTemplateFileContent(filepath);
  const dst = resolveRoot(filepath);
  fs.writeFileSync(
    dst,
    template(cnt)({
      ...opts,
      version,
    }),
  );
};

const checkBoolean = (value) => (value && value !== 'false' ? true : false);

export const initPlugin = async (opts: InitOptions = {}) => {
  printRow('Start project creation...');
  opts.components = checkBoolean(opts.components);
  opts.blocks = checkBoolean(opts.blocks);
  opts.i18n = checkBoolean(opts.i18n);

  const tasks = new Listr([
    {
      title: 'Creating initial source files',
      task: () => createSourceFiles(opts),
    },
    {
      title: 'Creating custom Component Type file',
      task: () => createFileComponents(opts),
      enabled: () => opts.components,
    },
    {
      title: 'Creating Blocks file',
      task: () => createFileBlocks(opts),
      enabled: () => opts.blocks,
    },
    {
      title: 'Creating i18n structure',
      task: () => createI18n(opts),
      enabled: () => opts.i18n,
    },
    {
      title: 'Update package.json',
      task: () => createPackage(opts),
    },
  ]);
  await tasks.run();
};

export default async (opts: InitOptions = {}) => {
  const rootDir = path.basename(process.cwd());
  const questions = [];
  const { verbose, name, rName, user, yes, components, blocks, i18n, license } = opts;
  let results = {
    name: name || getName(rootDir),
    rName: rName || rootDir,
    user: user || 'YOUR-USERNAME',
    components: isUndefined(components) ? true : components,
    blocks: isUndefined(blocks) ? true : blocks,
    i18n: isUndefined(i18n) ? true : i18n,
    license: license || 'MIT',
  };
  printRow(`Init the project${verbose ? ' (verbose)' : ''}...`);

  if (!yes) {
    !name &&
      questions.push({
        name: 'name',
        message: 'Name of the project',
        default: results.name,
      });
    !rName &&
      questions.push({
        name: 'rName',
        message: 'Repository name (used also as the plugin name)',
        default: results.rName,
      });
    !user &&
      questions.push({
        name: 'user',
        message: 'Repository username (eg. on GitHub/Bitbucket)',
        default: results.user,
      });
    isUndefined(components) &&
      questions.push({
        type: 'boolean',
        name: 'components',
        message: 'Will you need to add custom Component Types?',
        default: results.components,
      });
    isUndefined(blocks) &&
      questions.push({
        type: 'boolean',
        name: 'blocks',
        message: 'Will you need to add Blocks?',
        default: results.blocks,
      });
    isUndefined(i18n) &&
      questions.push({
        type: 'boolean',
        name: 'i18n',
        message: 'Do you want to setup i18n structure in this plugin?',
        default: results.i18n,
      });
    !license &&
      questions.push({
        name: 'license',
        message: 'License of the project',
        default: results.license,
      });
  }

  const answers = await inquirer.prompt(questions);
  results = {
    ...results,
    ...answers,
  };

  verbose && log({ results, opts });
  await initPlugin(results);
  printRow('Project created! Happy coding');
};
