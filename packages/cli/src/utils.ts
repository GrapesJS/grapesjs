import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import fsp from 'fs/promises';

export const isString = (val: any): val is string => typeof val === 'string';

export const isUndefined = (value: any) => typeof value === 'undefined';

export const isFunction = (value: any): value is Function => typeof value === 'function';

export const isObject = (val: any) => val !== null && !Array.isArray(val) && typeof val === 'object';

export const printRow = (str: string, { color = 'green', lineDown = 1 } = {}) => {
  console.log('');
  console.log(chalk[color].bold(str));
  lineDown && console.log('');
};

export const printError = (str: string) => {
  printRow(str, { color: 'red' });
};

export const log = (...args: any[]) => console.log.apply(this, args);

export const ensureDir = (filePath: string) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) return true;
  fs.mkdirSync(dirname);
  return ensureDir(dirname);
};

/**
 * Normalize JSON options
 * @param opts Options
 * @param key Options name to normalize
 * @returns {Object}
 */
export const normalizeJsonOpt = (opts: Record<string, any>, key: string) => {
  let devServerOpt = opts[key] || {};

  if (isString(devServerOpt)) {
    try {
      devServerOpt = JSON.parse(devServerOpt);
    } catch (e) {
      printError(`Error while parsing "${key}" option`);
      printError(e);
      devServerOpt = {};
    }
  }

  return devServerOpt;
};

export const buildWebpackArgs = (opts: Record<string, any>) => {
  return {
    ...opts,
    babel: normalizeJsonOpt(opts, 'babel'),
    htmlWebpack: normalizeJsonOpt(opts, 'htmlWebpack'),
  };
};

export const copyRecursiveSync = (src: string, dest: string) => {
  const exists = fs.existsSync(src);
  const isDir = exists && fs.statSync(src).isDirectory();

  if (isDir) {
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach((file) => {
      copyRecursiveSync(path.join(src, file), path.join(dest, file));
    });
  } else if (exists) {
    fs.copyFileSync(src, dest);
  }
};

export const isPathExists = async (path: string) => {
  try {
    await fsp.access(path);
    return true;
  } catch {
    return false;
  }
};

export const writeFile = async (filePath: string, data: string) => {
  try {
    const dirname = path.dirname(filePath);
    const exist = await isPathExists(dirname);
    if (!exist) {
      await fsp.mkdir(dirname, { recursive: true });
    }

    await fsp.writeFile(filePath, data, 'utf8');
  } catch (err) {
    throw new Error(err);
  }
};

export const rootResolve = (val: string) => path.resolve(process.cwd(), val);

export const originalRequire = () => {
  // @ts-ignore need this to use the original 'require.resolve' as it's replaced by webpack
  return __non_webpack_require__;
};

export const resolve = (value: string) => {
  return originalRequire().resolve(value);
};

export const babelConfig = (opts: { targets?: string } = {}) => ({
  presets: [
    [
      resolve('@babel/preset-env'),
      {
        targets: opts.targets,
        // useBuiltIns: 'usage', // this makes the build much bigger
        // corejs: 3,
      },
    ],
  ],
  plugins: [resolve('@babel/plugin-transform-runtime')],
});
