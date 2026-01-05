# prompts.chat All-in-One Docker Image
# Contains Node.js + PostgreSQL for single-container deployment
#
# Usage:
#   docker build -t my-prompts .
#   docker build --build-arg BRAND_NAME="My App" --build-arg BRAND_COLOR="#ff0000" -t my-prompts .
#   docker run -p 80:80 my-prompts
#
# Build Arguments (all optional):
#   BRAND_NAME, BRAND_DESCRIPTION, BRAND_LOGO, BRAND_COLOR
#   AUTH_PROVIDERS (comma-separated: github,google,credentials)
#   LOCALES (comma-separated: en,es,fr)

FROM node:24-bookworm-slim AS builder

# Build arguments for whitelabel branding
ARG BRAND_NAME="My Prompt Library"
ARG BRAND_DESCRIPTION="Collect, organize, and share AI prompts"
ARG BRAND_LOGO="/logo.svg"
ARG BRAND_LOGO_DARK=""
ARG BRAND_FAVICON="/logo.svg"
ARG BRAND_COLOR="#6366f1"
ARG THEME_RADIUS="sm"
ARG THEME_VARIANT="default"
ARG THEME_DENSITY="default"
ARG AUTH_PROVIDERS="credentials"
ARG ALLOW_REGISTRATION="true"
ARG LOCALES="en"
ARG DEFAULT_LOCALE="en"
ARG FEATURE_PRIVATE_PROMPTS="true"
ARG FEATURE_CHANGE_REQUESTS="true"
ARG FEATURE_CATEGORIES="true"
ARG FEATURE_TAGS="true"
ARG FEATURE_COMMENTS="true"
ARG FEATURE_AI_SEARCH="false"
ARG FEATURE_AI_GENERATION="false"
ARG FEATURE_MCP="false"

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev for build)
RUN npm ci

# Copy application files
COPY . .

# Remove unnecessary files
RUN rm -rf .github .claude packages .git

# Run docker-setup.js to generate prompts.config.ts with branding
ENV BRAND_NAME=${BRAND_NAME}
ENV BRAND_DESCRIPTION=${BRAND_DESCRIPTION}
ENV BRAND_LOGO=${BRAND_LOGO}
ENV BRAND_LOGO_DARK=${BRAND_LOGO_DARK}
ENV BRAND_FAVICON=${BRAND_FAVICON}
ENV BRAND_COLOR=${BRAND_COLOR}
ENV THEME_RADIUS=${THEME_RADIUS}
ENV THEME_VARIANT=${THEME_VARIANT}
ENV THEME_DENSITY=${THEME_DENSITY}
ENV AUTH_PROVIDERS=${AUTH_PROVIDERS}
ENV ALLOW_REGISTRATION=${ALLOW_REGISTRATION}
ENV LOCALES=${LOCALES}
ENV DEFAULT_LOCALE=${DEFAULT_LOCALE}
ENV FEATURE_PRIVATE_PROMPTS=${FEATURE_PRIVATE_PROMPTS}
ENV FEATURE_CHANGE_REQUESTS=${FEATURE_CHANGE_REQUESTS}
ENV FEATURE_CATEGORIES=${FEATURE_CATEGORIES}
ENV FEATURE_TAGS=${FEATURE_TAGS}
ENV FEATURE_COMMENTS=${FEATURE_COMMENTS}
ENV FEATURE_AI_SEARCH=${FEATURE_AI_SEARCH}
ENV FEATURE_AI_GENERATION=${FEATURE_AI_GENERATION}
ENV FEATURE_MCP=${FEATURE_MCP}

RUN node scripts/docker-setup.js

# Generate Prisma client and build
# DATABASE_URL is needed at build time for Prisma, but not used
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate && npm run build

# Production image
FROM node:24-bookworm-slim

# Labels for GitHub Container Registry
LABEL org.opencontainers.image.source="https://github.com/f/awesome-chatgpt-prompts"
LABEL org.opencontainers.image.description="prompts.chat - Self-hosted AI prompt library"
LABEL org.opencontainers.image.licenses="MIT"

# Environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production
ENV PORT=80
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="postgresql://prompts:prompts@localhost:5432/prompts?schema=public"

# Install PostgreSQL, supervisor, and utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-15 \
    postgresql-contrib-15 \
    supervisor \
    curl \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /var/run/postgresql /var/log/supervisor \
    && chown -R postgres:postgres /var/run/postgresql

WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prompts.csv ./prompts.csv
COPY --from=builder /app/messages ./messages
COPY --from=builder /app/prompts.config.ts ./prompts.config.ts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy node_modules for prisma CLI (needed for migrations)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Copy Docker configuration files
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create data directory for PostgreSQL
RUN mkdir -p /data/postgres && chown -R postgres:postgres /data/postgres

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD curl -f http://localhost:80/api/health || exit 1

# Entrypoint
ENTRYPOINT ["/entrypoint.sh"]
CMD []
