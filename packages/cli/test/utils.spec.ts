import {
  isFunction,
  isObject,
  isString,
  isUndefined,
  printRow,
  printError,
  log,
  ensureDir,
  normalizeJsonOpt,
  buildWebpackArgs,
  copyRecursiveSync,
  babelConfig,
  originalRequire,
  resolve,
  rootResolve,
} from '../src/utils';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import * as process from 'process';

const typeTestValues = {
  undefinedValue: undefined,
  nullValue: null,
  stringValue: 'hello',
  emptyObject: {},
  nonEmptyObject: { key: 'value' },
  emptyArray: [],
  functionValue: () => {},
  numberValue: 42,
  booleanValue: true,
  dateValue: new Date(),
};

function runTypeCheck(typeCheckFunction: (value: any) => boolean) {
  const keysWithPassingTypeChecks = Object.keys(typeTestValues).filter((key) => {
    const value = typeTestValues[key];
    return typeCheckFunction(value);
  });

  return keysWithPassingTypeChecks;
}

jest.mock('fs');
jest.mock('fs/promises');

describe('utils', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isString', () => {
    it('should correctly identify strings', () => {
      const result = runTypeCheck(isString);
      expect(result).toEqual(['stringValue']);
    });
  });

  describe('isUndefined', () => {
    it('should correctly identify undefined values', () => {
      const result = runTypeCheck(isUndefined);
      expect(result).toEqual(['undefinedValue']);
    });
  });

  describe('isFunction', () => {
    it('should correctly identify functions', () => {
      const result = runTypeCheck(isFunction);
      expect(result).toEqual(['functionValue']);
    });
  });

  describe('isObject', () => {
    it('should correctly identify objects', () => {
      const result = runTypeCheck(isObject);
      expect(result).toEqual(['emptyObject', 'nonEmptyObject', 'dateValue']);
    });
  });

  describe('printRow', () => {
    // TODO: We should refactor the function to make lineDown a boolean not a number
    it('should console.log the given string with the specified color and line breaks', () => {
      const str = 'Test string';
      const color = 'blue';
      const lineDown = 1;

      console.log = jest.fn() as jest.Mock;

      printRow(str, { color, lineDown });

      expect(console.log).toHaveBeenCalledTimes(3); // 1 for empty line, 1 for colored string, 1 for line break
      expect((console.log as jest.Mock).mock.calls[1][0]).toEqual(chalk[color].bold(str));
    });

    it('should not add a line break if lineDown is false', () => {
      const str = 'Test string';
      const color = 'green';
      const lineDown = 0;

      console.log = jest.fn();

      printRow(str, { color, lineDown });

      expect(console.log).toHaveBeenCalledTimes(2); // 1 for empty line, 1 for colored string
    });
  });

  describe('printError', () => {
    it('should print the given string in red', () => {
      const str = 'Error message';

      (console.log as jest.Mock).mockImplementation(() => {});

      printError(str);

      expect(console.log).toHaveBeenCalledTimes(3); // 1 for empty line, 1 for red string, 1 for line break
      expect((console.log as jest.Mock).mock.calls[1][0]).toEqual(chalk.red.bold(str));
    });
  });

  describe('log', () => {
    it('should call console.log with the given arguments', () => {
      const arg1 = 'Argument 1';
      const arg2 = 'Argument 2';

      console.log = jest.fn();

      log(arg1, arg2);

      expect(console.log).toHaveBeenCalledWith(arg1, arg2);
    });
  });

  describe('ensureDir', () => {
    it('should return true when the directory already exists', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      const result = ensureDir('/path/to/file.txt');
      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith('/path/to');
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    it('should create the directory when it does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false).mockReturnValueOnce(true);

      const result = ensureDir('/path/to/file.txt');
      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith('/path/to');
      expect(fs.mkdirSync).toHaveBeenCalledWith('/path/to');
    });

    it('should create parent directories recursively when they do not exist', () => {
      (fs.existsSync as jest.Mock)
        .mockReturnValueOnce(false) // Check /path/to (does not exist)
        .mockReturnValueOnce(false) // Check /path (does not exist)
        .mockReturnValueOnce(true); // Check / (root, exists)

      const result = ensureDir('/path/to/file.txt');
      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledTimes(3); // /path/to, /path, /
      expect(fs.mkdirSync).toHaveBeenCalledTimes(2); // /path, /path/to
    });
  });

  describe('normalizeJsonOpt', () => {
    it('should return the object if the option is already an object', () => {
      const opts = { babel: { presets: ['@babel/preset-env'] } };
      const result = normalizeJsonOpt(opts, 'babel');
      expect(result).toEqual(opts.babel);
    });

    it('should parse and return the object if the option is a valid JSON string', () => {
      const opts = { babel: '{"presets":["@babel/preset-env"]}' };
      const result = normalizeJsonOpt(opts, 'babel');
      expect(result).toEqual({ presets: ['@babel/preset-env'] });
    });

    it('should return an empty object if the option is an invalid JSON string', () => {
      const opts = { babel: '{"presets":["@babel/preset-env"]' }; // Invalid JSON
      const result = normalizeJsonOpt(opts, 'babel');
      expect(result).toEqual({});
    });

    it('should return an empty object if the option is not provided', () => {
      const opts = {};
      const result = normalizeJsonOpt(opts, 'babel');
      expect(result).toEqual({});
    });
  });

  describe('buildWebpackArgs', () => {
    it('should return the options with normalized JSON options for babel and htmlWebpack', () => {
      const opts = {
        babel: '{"presets":["@babel/preset-env"]}',
        htmlWebpack: '{"template":"./src/index.html"}',
        otherOption: 'someValue',
      };

      const result = buildWebpackArgs(opts);
      expect(result).toEqual({
        babel: { presets: ['@babel/preset-env'] },
        htmlWebpack: { template: './src/index.html' },
        otherOption: 'someValue',
      });
    });

    it('should return empty objects for babel and htmlWebpack if they are invalid JSON strings', () => {
      const opts = {
        babel: '{"presets":["@babel/preset-env"]', // Invalid JSON
        htmlWebpack: '{"template":"./src/index.html', // Invalid JSON
      };

      const result = buildWebpackArgs(opts);
      expect(result).toEqual({
        babel: {},
        htmlWebpack: {},
      });
    });

    it('should return the original objects if babel and htmlWebpack are already objects', () => {
      const opts = {
        babel: { presets: ['@babel/preset-env'] },
        htmlWebpack: { template: './src/index.html' },
      };

      const result = buildWebpackArgs(opts);
      expect(result).toEqual({
        babel: opts.babel,
        htmlWebpack: opts.htmlWebpack,
      });
    });

    it('should handle missing babel and htmlWebpack keys gracefully', () => {
      const opts = { otherOption: 'someValue' };

      const result = buildWebpackArgs(opts);
      expect(result).toEqual({
        babel: {},
        htmlWebpack: {},
        otherOption: 'someValue',
      });
    });
  });

  describe('copyRecursiveSync', () => {
    // TODO: Maybe this test case is a bit complex and we should think of an easier solution
    it('should copy a directory and its contents recursively', () => {
      /**
       * First call: Mock as a directory with two files
       * Subsequent calls: Mock as a file
       */
      const existsSyncMock = (fs.existsSync as jest.Mock).mockReturnValue(true);
      const statSyncMock = (fs.statSync as jest.Mock)
        .mockReturnValueOnce({ isDirectory: () => true })
        .mockReturnValue({ isDirectory: () => false });
      const readdirSyncMock = (fs.readdirSync as jest.Mock)
        .mockReturnValueOnce(['file1.txt', 'file2.txt'])
        .mockReturnValue([]);
      const copyFileSyncMock = (fs.copyFileSync as jest.Mock).mockImplementation(() => {});

      copyRecursiveSync('/src', '/dest');

      expect(existsSyncMock).toHaveBeenCalledWith('/src');
      expect(statSyncMock).toHaveBeenCalledWith('/src');
      expect(fs.mkdirSync).toHaveBeenCalledWith('/dest');
      expect(readdirSyncMock).toHaveBeenCalledWith('/src');
      expect(copyFileSyncMock).toHaveBeenCalledWith(
        path.normalize('/src/file1.txt'),
        path.normalize('/dest/file1.txt'),
      );
      expect(copyFileSyncMock).toHaveBeenCalledWith(
        path.normalize('/src/file2.txt'),
        path.normalize('/dest/file2.txt'),
      );
    });

    it('should copy a file when source is a file', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue({ isDirectory: () => false });

      copyRecursiveSync('/src/file.txt', '/dest/file.txt');

      expect(fs.existsSync).toHaveBeenCalledWith('/src/file.txt');
      expect(fs.statSync).toHaveBeenCalledWith('/src/file.txt');
      expect(fs.copyFileSync).toHaveBeenCalledWith('/src/file.txt', '/dest/file.txt');
    });

    // Maybe we can change the behavior to throw an error if the `src` doesn't exist
    it('should do nothing when source does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      copyRecursiveSync('/src/file.txt', '/dest/file.txt');

      expect(fs.existsSync).toHaveBeenCalledWith('/src/file.txt');
      expect(fs.statSync).not.toHaveBeenCalled();
      expect(fs.mkdirSync).not.toHaveBeenCalled();
      expect(fs.copyFileSync).not.toHaveBeenCalled();
    });
  });

  describe('rootResolve', () => {
    it('should resolve a relative path to an absolute path', () => {
      const result = rootResolve('src/index.js');

      expect(result).toBe(path.join(process.cwd(), 'src/index.js'));
    });
  });

  describe('originalRequire', () => {
    it('should return the original require.resolve function', () => {
      const originalRequireMock = jest.fn();
      global.__non_webpack_require__ = originalRequireMock;

      const result = originalRequire();

      expect(result).toBe(originalRequireMock);
    });
  });

  describe('resolve', () => {
    it('should resolve a module path using the original require.resolve', () => {
      const originalRequireMock = {
        resolve: jest.fn().mockReturnValue('resolved/path'),
      };
      global.__non_webpack_require__ = originalRequireMock;

      const result = resolve('my-module');

      expect(result).toBe('resolved/path');
      expect(originalRequireMock.resolve).toHaveBeenCalledWith('my-module');
    });
  });

  describe('babelConfig', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return a Babel configuration object with specified presets and plugins', () => {
      const result = babelConfig();

      expect(result).toEqual({
        presets: [[resolve('@babel/preset-env'), { targets: undefined }]],
        plugins: [resolve('@babel/plugin-transform-runtime')],
      });
    });

    it('should include the specified targets in the Babel configuration', () => {
      const result = babelConfig({ targets: 'node 14' });

      expect(result).toEqual({
        presets: [[resolve('@babel/preset-env'), { targets: 'node 14' }]],
        plugins: [resolve('@babel/plugin-transform-runtime')],
      });
    });
  });
});
