# ============================================
# Multi-stage Dockerfile for prompts.chat
# ============================================

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:24-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

# Dummy DATABASE_URL for prisma generate (postinstall)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN npm ci

# ============================================
# Stage 2: Builder
# ============================================
FROM node:24-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Override config if prompts.config.custom.ts exists
RUN if [ -f prompts.config.custom.ts ]; then \
      echo "Using custom config: prompts.config.custom.ts"; \
      cp prompts.config.custom.ts prompts.config.ts; \
    fi

RUN npx prisma generate

ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ============================================
# Stage 3: Production Runner
# ============================================
FROM node:24-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl curl netcat-openbsd

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy app files (excluding prisma.config.ts - not needed in production)
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=builder /app/prisma/migrations ./prisma/migrations
COPY --from=builder /app/package.json ./package.json

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Remove prisma.config.ts if copied (causes issues without dotenv)
RUN rm -f /app/prisma.config.ts

# Copy Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Install prisma CLI for migrations
RUN npm install -g prisma@6.19.1

COPY --chmod=755 docker-entrypoint.sh ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/api/healthcheck || exit 1

ENTRYPOINT ["./docker-entrypoint.sh"]
