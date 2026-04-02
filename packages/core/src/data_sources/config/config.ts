import type { DataSourcePropertyHandler } from '../types';

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
  onDataSourceProperty?: DataSourcePropertyHandler;
}

const config: () => DataSourcesConfig = () => ({
  autoloadProviders: false,
  onDataSourceProperty: 'overwrite',
});

export default config;
