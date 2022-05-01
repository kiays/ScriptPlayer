module.exports = {
  env: {
    browser: false,
    es2021: true,
    node: true,
  },
  extends: ["eslint:recommended", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: false,
    },
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: [],
  rules: {
    "@typescript-eslint/no-unused-vars": ["off"],
    "@typescript-eslint/no-var-requires": ["off"],
  },
};
