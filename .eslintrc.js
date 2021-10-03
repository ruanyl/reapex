module.exports = {
  root: true,
  extends: [
    "eslint-config-react-typescript/lib/react",
    "plugin:react/jsx-runtime",
  ],
  env: {
    browser: true,
  },
  parserOptions: {
    project: [
      "./packages/*/tsconfig.eslint.json",
      "./examples/*/tsconfig.json",
    ],
    sourceType: "module",
    tsconfigRootDir: __dirname,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "off",
  },
};
