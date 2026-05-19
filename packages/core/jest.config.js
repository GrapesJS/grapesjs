/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'ts'],
  verbose: true,
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
  modulePaths: ['<rootDir>/src'],
  testMatch: ['<rootDir>/test/specs/**/*.(t|j)s'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
};
