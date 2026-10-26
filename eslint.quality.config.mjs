/**
 * eslint.quality.config.mjs
 * Strict ESLint config for the SEN-201 static analysis assignment. It checks type safety and the
 * team coding standards (MaiRu_CodingStandards.md) and is separate from eslint.config.js, which
 * stays the day-to-day config that every commit must pass. Run it with `npm run lint:quality`.
 * Created by Tee (Kittiphon Kijpinyochai), 20 October 2026
 */
import { fixupPluginRules } from "@eslint/compat";
import eslintComments from "@eslint-community/eslint-plugin-eslint-comments";
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import prettier from "eslint-config-prettier";
import importXPlugin from "eslint-plugin-import-x";
import jsdocPlugin from "eslint-plugin-jsdoc";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactNative from "eslint-plugin-react-native";
import globals from "globals";
import { configs as tsConfigs } from "typescript-eslint";

const TS_FILES = ["**/*.{ts,tsx}"];
const TSX_FILES = ["**/*.tsx"];
const NON_TSX_FILES = ["**/*.{ts,js,cjs,mjs}"];
const TEST_FILES = ["**/*.test.{ts,tsx}", "test/**"];
const CONSTANT_FILES = ["src/theme/**", "src/constants/**", "src/api/mocks/**"];

const BOOLEAN_PREFIXES = ["is", "has", "can", "should", "was", "did", "are"];

export default defineConfig([
  {
    ignores: [
      "node_modules/",
      ".expo/",
      "dist/",
      "build/",
      "coverage/",
      "android/",
      "ios/",
      "web-build/",
      ".claude/",
      "quality_assessment/",
    ],
  },

  // Base: ESLint's own recommended rules for every file.
  js.configs.recommended,

  // Type-aware TypeScript rules (strict + stylistic).
  {
    files: TS_FILES,
    extends: [tsConfigs.strictTypeChecked, tsConfigs.stylisticTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // React (components only live in .tsx files).
  {
    files: TSX_FILES,
    extends: [react.configs.flat.recommended, react.configs.flat["jsx-runtime"]],
    settings: { react: { version: "detect" } },
    plugins: { "react-native": fixupPluginRules(reactNative) },
  },

  // Hooks also live in plain .ts files (src/hooks, useXxx.ts), so rules-of-hooks covers both.
  {
    files: TS_FILES,
    extends: [reactHooks.configs.flat.recommended],
  },

  // Plain JavaScript: Babel, Metro, Jest config and Node scripts. No type information here.
  {
    files: ["**/*.{js,cjs,mjs}"],
    extends: [tsConfigs.disableTypeChecked],
    languageOptions: { globals: globals.node },
  },

  // Plugins used by the extra rules below.
  {
    plugins: {
      jsdoc: jsdocPlugin,
      "import-x": importXPlugin,
      "@eslint-community/eslint-comments": eslintComments,
    },
  },

  // Extra rules, each tied to a coding-standard rule.
  {
    linterOptions: { reportUnusedDisableDirectives: "error" }, // stale disables show up
    rules: {
      eqeqeq: ["error", "always"], // TS rule 8
      "no-var": "error", // TS rule 7
      "prefer-const": "error", // TS rule 7
      curly: ["error", "all"], // Format rule 2 (re-applied after Prettier at the end of this file)
      "no-console": ["warn", { allow: ["warn", "error"] }], // no stray debug output
      complexity: ["warn", 10], // Format rule 4
      "no-warning-comments": ["warn", { terms: ["fixme", "xxx", "hack"] }], // Comment rule 6; TODO(Tee) stays allowed
      "jsdoc/require-jsdoc": [
        "warn",
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true,
            ClassDeclaration: true,
          },
        },
      ], // Comment rule 2
      // Comment rule 2. Destructured props are documented as `@param props.name` (the team style),
      // so the unnamed root is called `props` and needs no @param line of its own.
      "jsdoc/require-param": [
        "warn",
        { unnamedRootBase: ["props"], checkDestructuredRoots: false },
      ],
      "jsdoc/require-returns": "warn", // Comment rule 2
      "import-x/order": [
        "error",
        {
          groups: [
            ["builtin", "external"],
            ["internal", "parent", "sibling", "index"],
          ],
          "newlines-between": "always",
        },
      ], // Format rule 6: external packages first, then project modules, blank line between
      "@eslint-community/eslint-comments/require-description": "error", // every disable says why
      "@eslint-community/eslint-comments/no-unlimited-disable": "error", // no blanket eslint-disable
    },
  },

  // Function length: Format rule 4. Components (.tsx) get 150 lines, everything else 50.
  {
    files: NON_TSX_FILES,
    rules: {
      "max-lines-per-function": ["warn", { max: 50, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: TSX_FILES,
    rules: {
      "max-lines-per-function": ["warn", { max: 150, skipBlankLines: true, skipComments: true }],
    },
  },

  // Type-aware extras.
  {
    files: TS_FILES,
    rules: {
      "@typescript-eslint/no-explicit-any": "error", // TS rule 6
      "@typescript-eslint/no-floating-promises": "error", // TS rule 9
      "@typescript-eslint/no-misused-promises": "error", // TS rule 9
      "@typescript-eslint/no-magic-numbers": [
        "warn",
        {
          ignore: [-1, 0, 1, 2],
          ignoreEnums: true,
          ignoreNumericLiteralTypes: true,
          ignoreReadonlyClassProperties: true,
          ignoreTypeIndexes: true,
        },
      ], // Consideration 3
      // Naming rules 2 to 4. Variables, functions and types only; no property selectors, so
      // field names that are sent to the API are never touched.
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variable",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "variable",
          modifiers: ["const", "global"],
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
        },
        {
          selector: "variable",
          types: ["function"],
          format: ["camelCase", "PascalCase"], // PascalCase for components
        },
        {
          selector: "variable",
          types: ["boolean"],
          format: ["PascalCase"],
          prefix: BOOLEAN_PREFIXES,
        },
        {
          selector: "variable",
          modifiers: ["const", "global"],
          types: ["boolean"],
          format: ["UPPER_CASE", "camelCase"],
        },
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
        },
        {
          selector: "parameter",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        {
          selector: "interface",
          format: ["PascalCase"],
          custom: { regex: "^I[A-Z]", match: false }, // Naming rule 3: no I prefix
        },
      ],
    },
  },

  // React rules.
  {
    files: TSX_FILES,
    rules: {
      "react/prefer-stateless-function": "error", // TS rule 10
      "react/no-unstable-nested-components": "error", // TS rule 10
      "react/no-array-index-key": "error", // TS rule 10
      "react/no-multi-comp": ["warn", { ignoreStateless: false }], // Format rule 5
      "react-native/no-inline-styles": "warn", // TS rule 10
      "react-native/no-unused-styles": "warn", // TS rule 10
      "react-native/no-color-literals": "warn", // Consideration 3
    },
  },

  // Tests: Jest globals; long describe blocks, magic numbers and missing JSDoc are fine here.
  {
    files: TEST_FILES,
    languageOptions: { globals: globals.jest },
    rules: {
      "max-lines-per-function": "off",
      "@typescript-eslint/no-magic-numbers": "off",
      "jsdoc/require-jsdoc": "off",
    },
  },

  // Theme tokens, limits and mock data are where magic numbers and color literals belong.
  {
    files: CONSTANT_FILES,
    rules: {
      "@typescript-eslint/no-magic-numbers": "off",
      "react-native/no-color-literals": "off",
    },
  },

  // Prettier owns formatting, so it comes last and switches off every conflicting rule.
  prettier,

  // eslint-config-prettier also switches off `curly`. Prettier is fine with "all", so turn it back on.
  { rules: { curly: ["error", "all"] } },
]);
