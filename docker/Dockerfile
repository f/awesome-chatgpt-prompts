# prompts.chat All-in-One Docker Image
# Contains Node.js + PostgreSQL for single-container deployment
#
# Usage:
#   docker run -p 80:80 ghcr.io/f/prompts.chat
#   docker run -p 80:80 -e AUTH_SECRET=xxx ghcr.io/f/prompts.chat
#   docker run -p 80:80 --name my-prompts ghcr.io/f/prompts.chat

FROM node:24-bookworm-slim AS builder

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

# Generate Prisma client and build
ENV NEXT_TELEMETRY_DISABLED=1
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
