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
    // Compiled outputs
    "packages/*/dist/**",
    // Packages with their own ESLint config
    "packages/raycast-extension/**",
    // Scripts - may use CommonJS
    "scripts/**",
    // Prisma scripts
    "prisma/**",
  ]),
  // Downgrade strict rules to warnings for gradual adoption
  {
    rules: {
      // React hooks compiler rules - many false positives in complex state patterns
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      // JSX entity escaping - affects many existing components
      "react/no-unescaped-entities": "warn",
      // Function type - affects test mocks
      "@typescript-eslint/no-unsafe-function-type": "warn",
      // Display name - affects anonymous components
      "react/display-name": "warn",
      // HTML links - sometimes needed for external/special navigation
      "@next/next/no-html-link-for-pages": "warn",
      // Children as props - used in some component patterns
      "react/no-children-prop": "warn",
    },
  },
]);

export default eslintConfig;
