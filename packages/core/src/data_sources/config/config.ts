export interface DataSourcesConfig {
  /**
   * If true, data source providers will be autoloaded on project load.
   * @default false
   */
  autoloadProviders?: boolean;
}

const config: () => DataSourcesConfig = () => ({
  autoloadProviders: false,
});

export default config;
