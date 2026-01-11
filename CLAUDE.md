# CLAUDE.md

> Quick reference for Claude Code when working on prompts.chat

## Project Overview

**prompts.chat** is a social platform for AI prompts built with Next.js 16 App Router, React 19, TypeScript, and PostgreSQL/Prisma. It allows users to share, discover, and collect prompts.

For detailed agent guidelines, see [AGENTS.md](AGENTS.md).

## Quick Commands

```bash
# Development
npm run dev              # Start dev server at localhost:3000
npm run build            # Production build (runs prisma generate)
npm run lint             # Run ESLint

# Database
npm run db:migrate       # Run Prisma migrations
npm run db:push          # Push schema changes
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database

# Type checking
npx tsc --noEmit         # Check TypeScript types
```

## Key Files

| File | Purpose |
|------|---------|
| `prompts.config.ts` | Main app configuration (branding, theme, auth, features) |
| `prisma/schema.prisma` | Database schema |
| `src/lib/auth/index.ts` | NextAuth configuration |
| `src/lib/db.ts` | Prisma client singleton |
| `messages/*.json` | i18n translation files |

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── (auth)/       # Login, register
│   ├── api/          # API routes
│   ├── prompts/      # Prompt CRUD pages
│   └── admin/        # Admin dashboard
├── components/       # React components
│   ├── ui/           # shadcn/ui base components
│   └── prompts/      # Prompt-related components
└── lib/              # Utilities and config
    ├── ai/           # OpenAI integration
    ├── auth/         # NextAuth setup
    └── plugins/      # Auth and storage plugins
```

## Code Patterns

- **Server Components** by default, `"use client"` only when needed
- **Translations:** Use `useTranslations()` or `getTranslations()` from next-intl
- **Styling:** Tailwind CSS with `cn()` utility for conditional classes
- **Forms:** React Hook Form + Zod validation
- **Database:** Prisma client from `@/lib/db`

## Before Committing

1. Run `npm run lint` to check for issues
2. Add translations for any user-facing text
3. Use existing UI components from `src/components/ui/`
4. Never commit secrets (use `.env`)
