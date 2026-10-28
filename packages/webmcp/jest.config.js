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
  setupFiles: ['<rootDir>/test/setup.js'],
  testMatch: ['<rootDir>/test/specs/**/*.(t|j)s'],
};
