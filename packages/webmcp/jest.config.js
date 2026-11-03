/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'ts'],
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
  // Test against the GrapesJS source, no need to build the core
  moduleNameMapper: {
    '^grapesjs$': '<rootDir>/../core/src',
  },
  // Compile with the core Babel config, also used for the GrapesJS source
  transform: {
    '\\.[jt]s$': ['babel-jest', { configFile: require.resolve('../core/babel.config.js') }],
  },
  setupFiles: ['<rootDir>/test/setup.ts'],
  testMatch: ['<rootDir>/src/**/*.test.ts'],
};
