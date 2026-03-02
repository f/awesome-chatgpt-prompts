import { defineConfig, type Plugin } from "vite";
import vinext from "vinext";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vite plugin that replicates what next-intl's createNextIntlPlugin does
 * for webpack/turbopack: it aliases `next-intl/config` to the project's
 * i18n request configuration file (src/i18n/request.ts).
 *
 * Without this alias, next-intl's internal `next-intl/config` module throws
 * "Couldn't find next-intl config file" because VineXT doesn't use webpack
 * and the createNextIntlPlugin wrapper is removed.
 */
function nextIntlPlugin(requestConfigPath: string): Plugin {
  const resolvedPath = path.resolve(__dirname, requestConfigPath);
  return {
    name: "vite-plugin-next-intl",
    enforce: "pre",
    resolveId(source) {
      // Match both bare specifier and subpath export forms
      if (source === "next-intl/config" || source === "next-intl/config.js") {
        return resolvedPath;
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [
    // Alias next-intl/config -> src/i18n/request.ts (must come first)
    nextIntlPlugin("./src/i18n/request.ts"),
    // vinext auto-registers @vitejs/plugin-rsc when app/ is detected
    vinext(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
