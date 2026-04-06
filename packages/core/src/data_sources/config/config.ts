import type { DataBindingImportPolicy } from '../types';

export interface DataSourcesConfig {
  /**
   * If true, data source providers will be autoloaded on project load.
   * @default false
   */
  autoloadProviders?: boolean;

  /**
   * Controls how parsed static HTML/CSS updates interact with existing data source bindings.
   * @default 'overwrite'
   */
  dataBindingImportPolicy?: DataBindingImportPolicy;
}

const config: () => DataSourcesConfig = () => ({
  autoloadProviders: false,
  dataBindingImportPolicy: 'overwrite',
});

export default config;
