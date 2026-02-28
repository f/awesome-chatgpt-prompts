import { defineConfig, type Plugin } from "vite";
import vinext from "vinext";

/**
 * VineXT's next/font/google shim only pre-exports ~20 common fonts.
 * ESM named imports for unlisted fonts (e.g. Noto_Sans_Arabic, Schoolbell)
 * resolve to undefined because they bypass the Proxy default export.
 *
 * This plugin rewrites font imports so that unlisted fonts are accessed
 * through the Proxy default export instead of as named imports.
 */
function vinextFontPatch(): Plugin {
  // Fonts and utilities already exported by VineXT's shim (no patching needed)
  const preExported = new Set([
    // Common fonts
    "Inter", "Roboto", "Roboto_Mono", "Open_Sans", "Lato", "Poppins",
    "Montserrat", "Source_Code_Pro", "Noto_Sans", "Raleway", "Ubuntu",
    "Nunito", "Playfair_Display", "Merriweather", "PT_Sans", "Fira_Code",
    "JetBrains_Mono", "Geist", "Geist_Mono",
    // Internal VineXT utilities
    "getSSRFontLinks", "getSSRFontStyles", "getSSRFontPreloads",
    "buildGoogleFontsUrl",
  ]);

  return {
    name: "vinext-font-patch",
    enforce: "pre",
    transform(code, id) {
      if (!code.includes("next/font/google")) return null;
      if (id.includes("node_modules")) return null;
      // Skip virtual modules (VineXT's own RSC entry, etc.)
      if (id.startsWith("\0") || id.includes("virtual:")) return null;

      const importRe = /import\s*\{([^}]+)\}\s*from\s*['"]next\/font\/google['"]/;
      const match = code.match(importRe);
      if (!match) return null;

      // Parse import specifiers, handling "Name as Alias" syntax
      const specifiers = match[1].split(",").map((s) => s.trim()).filter(Boolean);
      const parsed = specifiers.map((spec) => {
        const parts = spec.split(/\s+as\s+/);
        return { name: parts[0].trim(), alias: (parts[1] || parts[0]).trim() };
      });

      const missing = parsed.filter((p) => !preExported.has(p.name));
      if (missing.length === 0) return null;

      // Keep pre-exported fonts as named imports, access others via default Proxy
      const kept = parsed.filter((p) => preExported.has(p.name));
      const keptClause = kept.length > 0
        ? `{ ${kept.map((p) => p.name === p.alias ? p.name : `${p.name} as ${p.alias}`).join(", ")} }`
        : "";
      const defaultClause = "__googleFonts";
      const importParts = [defaultClause, keptClause].filter(Boolean).join(", ");

      let replacement = `import ${importParts} from "next/font/google";\n`;
      for (const { name, alias } of missing) {
        replacement += `const ${alias} = __googleFonts.${name};\n`;
      }

      return code.replace(match[0], replacement);
    },
  };
}

export default defineConfig({
  plugins: [
    vinextFontPatch(),
    vinext(),
  ],
});
