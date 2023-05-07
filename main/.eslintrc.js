module.exports = {
  root: false,
  env: {
    browser: false,
    node: true,
  },

  extends: ["eslint:recommended", "prettier"],
  plugins: [],
  rules: {
    "@typescript-eslint/no-var-requires": ["off"],
    "no-unused-vars": [
      "error",
      { varsIgnorePattern: "_", argsIgnorePattern: "_" },
    ],
  },
};
