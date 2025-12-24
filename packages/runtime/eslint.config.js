// eslint.config.js
// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig(
  // Apply ESLint's built-in recommended rules
  eslint.configs.recommended,

  // Apply TypeScript ESLint's recommended rules
  ...tseslint.configs.recommended,
  
  // Custom configuration for specific files
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json", // Enable type-aware linting
      },
    },
    rules: {
      // Additional or override rules for TypeScript files
      "@typescript-eslint/explicit-module-boundary-types": "error",
      quotes: ["error", "single", { "avoidEscape": true }],
    },
  },

  // Global ignores configuration
  {
    ignores: ["dist"],
  }
);

