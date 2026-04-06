import type { DataBindingImportPolicy } from '../types';

export interface DataSourcesConfig {
  /**
   * If true, data source providers will be autoloaded on project load.
   * @default false
   */
  autoloadProviders?: boolean;

  /**
   * Controls how parsed HTML/CSS string imports interact with existing data-bound
   * component properties, attributes, and styles.
   *
   * This applies when a string import tries to write a static value over an existing
   * data binding, for example via `components().resetFromString(...)` or
   * `Css.addCollection('...')`.
   *
   * Available options:
   * - `'overwrite'`: replace the existing binding with the imported static value.
   * - `'skip'`: ignore the imported static value and keep the current binding.
   * - `'update'`: write the imported static value into the bound data source and keep the binding.
   * - `(context) => action`: decide per imported key based on the binding context.
   *
   * This value acts as the global default and can be overridden per import call with
   * the `dataBindingImportPolicy` option.
   * @default 'overwrite'
   */
  dataBindingImportPolicy?: DataBindingImportPolicy;
}

const config: () => DataSourcesConfig = () => ({
  autoloadProviders: false,
  dataBindingImportPolicy: 'overwrite',
});

export default config;
