/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'ts'],
  testEnvironmentOptions: {
    url: 'http://localhost/',
  },
  testMatch: ['<rootDir>/test/specs/**/*.(t|j)s'],
};
