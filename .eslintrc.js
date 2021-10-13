module.exports = {
  root: true,
  extends: [
    "eslint-config-react-typescript/lib/react",
    "plugin:react/jsx-runtime",
  ],
  env: {
    browser: true,
  },
  ignorePatterns: ["**/examples/vue-counter/*"],
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
    "comma-dangle": [
      "error",
      {
        arrays: "always-multiline",
        objects: "always-multiline",
        imports: "always-multiline",
        exports: "always-multiline",
        functions: "never",
      },
    ],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "off",
  },
};
