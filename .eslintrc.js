module.exports = {
  extends: ['eslint-config-react-typescript/lib/react'],
  env: {
    browser: true,
  },
  parserOptions: {
    project: 'tsconfig.eslint.json',
    sourceType: 'module',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
  },
}
