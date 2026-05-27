import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Saved-webpage references kept in the repo for the demo (Wayfair
    // brand cues + hackathon partner logos) — minified vendor JS in
    // these folders is not source we own and should not be linted.
    "Beat The Clock Agent Hack_files/**",
    "Wayfair.com - Online Home Store for Furniture, Decor, Outdoors & More_files/**",
    "*.html",
  ]),
]);

export default eslintConfig;
