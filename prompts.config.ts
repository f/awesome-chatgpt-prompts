import { defineConfig } from "@/lib/config";

// Set to true to use clone branding (hide prompts.chat repo branding)
const useCloneBranding = false;

export default defineConfig({
  // Branding - customize for white-label
  branding: {
    name: "prompts.chat",
    logo: "/logo.svg",
    logoDark: "/logo-dark.svg",
    favicon: "/logo.svg",
    description: "Collect, organize, and share AI prompts",
  },

  // Theme - design system configuration
  theme: {
    // Border radius: "none" | "sm" | "md" | "lg"
    radius: "sm",
    // UI style: "flat" | "default" | "brutal"
    variant: "default",
    // Spacing density: "compact" | "default" | "comfortable"
    density: "default",
    // Colors (hex or oklch)
    colors: {
      primary: "#6366f1", // Indigo
    },
  },

  // Authentication plugins
  auth: {
    // Available: "credentials" | "google" | "azure" | "github" | "apple" | custom
    // Use `providers` array to enable multiple auth providers
    providers: ["github", "google", "apple"],
    // Allow public registration (only applies to credentials provider)
    allowRegistration: false,
  },

  // Internationalization
  i18n: {
    locales: ["en", "tr", "es", "zh", "ja", "ar", "pt", "fr", "it", "de", "ko", "ru", "he", "el", "az", "fa"],
    defaultLocale: "en",
  },

  // Features
  features: {
    // Allow users to create private prompts
    privatePrompts: true,
    // Enable change request system for versioning
    changeRequests: true,
    // Enable categories
    categories: true,
    // Enable tags
    tags: true,
    // Enable AI-powered semantic search (requires OPENAI_API_KEY)
    aiSearch: true,
    // Enable AI-powered generation features (requires OPENAI_API_KEY)
    aiGeneration: true,
    // Enable MCP (Model Context Protocol) features including API key generation
    mcp: true,
    // Enable comments on prompts
    comments: true,
  },

  // Homepage customization
  homepage: {
    // Set to true to hide prompts.chat repo branding and use your own branding
    useCloneBranding,
    achievements: {
      enabled: !useCloneBranding,
    },
    sponsors: {
      enabled: !useCloneBranding,
      items: [
        // Add sponsors here
        { name: "Clemta", logo: '/sponsors/clemta.webp', url: "https://clemta.com/?utm_source=prompts.chat" },
        { name: "Wiro.ai", className: 'p-1', darkLogo: '/sponsors/wiro.png', logo: '/sponsors/wiro.png', url: "https://wiro.ai/?utm_source=prompts.chat" },
        { name: "Cognition", logo: "/sponsors/cognition.svg", url: "https://wind.surf/prompts-chat" },
        { name: "warp.dev", className: 'p-2', logo: '/sponsors/warp.svg', url: "https://warp.dev/?utm_source=prompts.chat" },
      ],
    },
  },
});
