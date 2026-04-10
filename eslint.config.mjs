import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import cssModules from "eslint-plugin-css-modules";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "next-env.d.ts",
  ]),
  {
    files: ["**/*.tsx", "**/*.ts"],
    plugins: {
      "css-modules": cssModules,
    },
    rules: {
      "css-modules/no-undef-class": ["warn", { camelCase: true }],
      "css-modules/no-unused-class": ["warn", { camelCase: true }],
    },
  },
  {
    files: ["**/Readonly*.tsx", "**/Preview*.tsx"],
    rules: {
      "css-modules/no-undef-class": "off",
    },
  },
]);

export default eslintConfig;
