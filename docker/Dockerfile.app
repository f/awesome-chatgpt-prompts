# prompts.chat App-Only Dockerfile
# For use with docker-compose (separate database container)
#
# Build with branding:
#   docker build --build-arg BRAND_NAME="My App" -f docker/Dockerfile.app -t my-prompts .

FROM node:24-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder

# Build arguments for whitelabel branding
ARG BRAND_NAME="My Prompt Library"
ARG BRAND_DESCRIPTION="Collect, organize, and share AI prompts"
ARG BRAND_LOGO="/logo.svg"
ARG BRAND_LOGO_DARK=""
ARG BRAND_FAVICON="/logo.svg"
ARG BRAND_COLOR="#6366f1"
ARG THEME_RADIUS="sm"
ARG THEME_VARIANT="default"
ARG AUTH_PROVIDERS="credentials"
ARG LOCALES="en"

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Remove unnecessary files
RUN rm -rf .github .claude packages docker .git

# Run docker-setup.js to generate prompts.config.ts with branding
ENV BRAND_NAME=${BRAND_NAME} \
    BRAND_DESCRIPTION=${BRAND_DESCRIPTION} \
    BRAND_LOGO=${BRAND_LOGO} \
    BRAND_LOGO_DARK=${BRAND_LOGO_DARK} \
    BRAND_FAVICON=${BRAND_FAVICON} \
    BRAND_COLOR=${BRAND_COLOR} \
    THEME_RADIUS=${THEME_RADIUS} \
    THEME_VARIANT=${THEME_VARIANT} \
    AUTH_PROVIDERS=${AUTH_PROVIDERS} \
    LOCALES=${LOCALES}

RUN node scripts/docker-setup.js

# DATABASE_URL is needed at build time for Prisma, but not used
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install netcat for health checks
RUN apk add --no-cache netcat-openbsd curl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prompts.csv ./prompts.csv

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy entrypoint
COPY docker/entrypoint-app.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "server.js"]
