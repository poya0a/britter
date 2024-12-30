import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "eslint.config.js", "**/*.d.ts"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, "plugin:prettier/recommended"],
    files: ["**/*.{ts, tsx, js, jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals,
    },
    rules: {
      "react/jsx-no-target-blank": "off",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  }
);
