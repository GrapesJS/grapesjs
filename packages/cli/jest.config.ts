import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  verbose: true,
  modulePaths: ['<rootDir>/src'],
  testMatch: ['<rootDir>/test/**/*.(t|j)s'],
};

export default config;
