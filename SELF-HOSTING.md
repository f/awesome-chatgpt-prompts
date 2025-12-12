# Self-Hosting Guide

## Capabilities

- **Curated Prompt Library** — Access 100+ high-quality, community-tested prompts for ChatGPT, Claude, Gemini, Llama, Mistral, and other AI models
- **Discover & Browse** — Explore prompts by categories, tags, or AI-powered semantic search
- **Create & Share Prompts** — Submit your own prompts with support for text, structured (JSON/YAML), and media-enhanced formats
- **Version Control** — Track prompt changes with built-in versioning and change request system (similar to PRs)
- **Personalized Feed** — Subscribe to categories and get a curated feed of prompts matching your interests
- **Private Prompts** — Keep your prompts private or share them with the community
- **Voting & Leaderboard** — Upvote prompts and discover the most popular ones via PromptMasters leaderboard
- **Multi-language Support** — Available in English, Spanish, Japanese, Turkish, and Chinese

## Benefits

- **Unlock AI Potential:** Stop struggling with prompt engineering — use battle-tested prompts from 139k+ GitHub stars community
- **Save Time:** Copy prompts with one click, customize variables inline, and use them instantly in any AI chat
- **Community-Driven Quality:** Every prompt is curated and refined by the community through change requests and voting
- **Self-Hostable:** Deploy your own white-labeled prompt library for your team or organization with customizable branding, themes, and authentication
- **CC0 Licensed:** All prompts are public domain — use them freely for any purpose, commercial or personal

## Getting Started

**Requirements:**
- **Plan:** Free and open-source (CC0 license)
- **User Permissions:** No account needed to browse; sign in via GitHub/Google to create & save prompts
- **Availability:** Generally Available at [prompts.chat](https://prompts.chat)

---

This guide explains how to deploy **prompts.chat** on your own private server for enhanced privacy and customization.

## Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** database
- **npm** or **yarn**

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/prompts"

# Authentication (choose one provider)
# GitHub OAuth
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"

# Or Google OAuth
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# NextAuth
AUTH_SECRET="generate-a-random-secret"

# Optional: AI-powered semantic search
OPENAI_API_KEY="your-openai-api-key"
```

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/f/awesome-chatgpt-prompts.git
   cd awesome-chatgpt-prompts
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure your environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database and auth credentials
   ```

4. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

5. **Seed initial data** (optional)
   ```bash
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Build for production**
   ```bash
   npm run build
   npm run start
   ```

## Configuration

Customize your instance by editing `prompts.config.ts`:

```typescript
// Set to true to use your own branding instead of prompts.chat branding
const useCloneBranding = true;

export default defineConfig({
  // Branding
  branding: {
    name: "Your Prompt Library",
    logo: "/your-logo.svg",
    logoDark: "/your-logo-dark.svg",
    description: "Your custom description",
  },

  // Theme
  theme: {
    radius: "sm",        // "none" | "sm" | "md" | "lg"
    variant: "default",  // "flat" | "default" | "brutal"
    colors: {
      primary: "#6366f1",
    },
  },

  // Authentication
  auth: {
    provider: "github",  // "credentials" | "github" | "google" | "azure"
    allowRegistration: true,
  },

  // Features
  features: {
    privatePrompts: true,
    changeRequests: true,
    categories: true,
    tags: true,
    aiSearch: false,  // Requires OPENAI_API_KEY
  },

  // Homepage
  homepage: {
    useCloneBranding,  // Use your branding on homepage
    achievements: {
      enabled: !useCloneBranding,  // Hide prompts.chat achievements
    },
    sponsors: {
      enabled: !useCloneBranding,  // Hide prompts.chat sponsors
    },
  },

  // Internationalization
  i18n: {
    locales: ["en", "es", "ja", "tr", "zh"],
    defaultLocale: "en",
  },
});
```

### Clone Branding Mode

When `useCloneBranding` is set to `true`, the homepage will:

- Display your **branding name** as the hero title
- Show your **branding description** below the title
- Use your **logo** as a watermark background instead of the video
- Hide the "Clone on GitHub" button
- Hide the achievements section (Forbes, GitHub stars, etc.)
- Hide the sponsor links and "Become a Sponsor" CTA

This is ideal for organizations that want to deploy their own white-labeled prompt library without prompts.chat branding.

## Docker Deployment

Coming soon.

## Support

For issues and questions, please open a [GitHub Issue](https://github.com/f/awesome-chatgpt-prompts/issues).
