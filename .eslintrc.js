module.exports = {
  extends: ['eslint-config-react-typescript/lib/react'],
  env: {
    browser: true,
  },
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
