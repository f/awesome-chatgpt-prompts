import { defineConfig } from "@/lib/config";

export default defineConfig({
  // Branding - customize for white-label
  branding: {
    name: "prompts.chat",
    logo: "/logo.svg",
    favicon: "/favicon.ico",
    description: "Collect, organize, and share AI prompts",
  },

  // Theme - design system configuration
  theme: {
    // Border radius: "none" | "sm" | "md" | "lg"
    radius: "sm",
    // UI style: "flat" | "default" | "brutal"
    variant: "default",
    // Spacing density: "compact" | "default" | "comfortable"
    density: "compact",
    // Colors (hex or oklch)
    colors: {
      primary: "#6366f1", // Indigo
    },
  },

  // Authentication plugin
  auth: {
    // Available: "credentials" | "google" | "azure" | custom
    provider: "credentials",
    // Allow public registration
    allowRegistration: true,
  },

  // Storage plugin for media uploads
  storage: {
    // Available: "url" | "s3" | custom
    provider: "url",
  },

  // Internationalization
  i18n: {
    locales: ["en", "tr", "es", "zh", "ja"],
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
  },
});
