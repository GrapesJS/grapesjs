/** @type {import('@babel/core')} */
module.exports = {
  env: {
    test: {
      // Same as the core, also used to compile the GrapesJS source in tests
      presets: ['@babel/preset-env', '@babel/preset-typescript'],
    },
  },
};
