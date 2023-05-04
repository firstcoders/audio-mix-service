module.exports = {
  globals: {
    process: true,
  },
  env: {
    browser: false,
    node: true,
    mocha: true,
  },
  rules: {
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
  },
};
