module.exports = {
  root: true,
  extends: ["eslint-config-react-typescript/lib/react"],
  env: {
    browser: true,
  },
  parserOptions: {
    project: ["./packages/*/tsconfig.eslint.json"],
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
