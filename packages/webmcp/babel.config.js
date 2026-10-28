/** @type {import('@babel/core')} */
module.exports = {
  env: {
    test: {
      presets: [['@babel/preset-env', { targets: { node: 'current' } }], '@babel/preset-typescript'],
    },
  },
};
