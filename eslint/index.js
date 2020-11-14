module.exports = {
  extends: ['./env.js', './globals.js', './rules.js', './plugins.js'].map(
    require.resolve,
  ),
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 11,
  },
  rules: {},
}
