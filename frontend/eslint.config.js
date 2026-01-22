const { defineConfig } = require("eslint/config");

const { fixupConfigRules } = require("@eslint/compat");

const tsParser = require("@typescript-eslint/parser");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const globals = require("globals");
const js = require("@eslint/js");

const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    ignores: ["src/generated-client/**"],
  },
  ...fixupConfigRules(
    compat.extends(
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:react/jsx-runtime",
      "plugin:react-hooks/recommended",
      "prettier",
    ),
  ),
  {
    languageOptions: {
      parser: tsParser,

      globals: {
        ...globals.browser,
      },
    },

    plugins: {
      "@typescript-eslint": typescriptEslint,
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    ignores: ["src/components/ui/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@elhub/ds-components",
              message: "Import from '@/components/ui' instead.",
            },
          ],
        },
      ],
    },
  },
]);
