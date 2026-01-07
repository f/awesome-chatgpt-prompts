import raycastConfig from "@raycast/eslint-config";

export default [
  {
    ignores: ["node_modules/**", "dist/**"],
  },
  ...raycastConfig,
];
