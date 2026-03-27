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
]);

export default eslintConfig;