# ---- Base ----
FROM node:24-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma/
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN npm ci --legacy-peer-deps --ignore-scripts && \
    npx prisma generate

# ---- Development ----
FROM base AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
ENV PORT=3000
CMD ["npx", "vinext", "dev"]

# ---- Builder ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
# Provide a dummy DATABASE_URL so Prisma schema validation passes during build
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public"
RUN npx vinext build

# ---- Production runner ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

# Copy Prisma schema and generated client for runtime migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=deps /app/node_modules ./node_modules

# Copy VineXT build output
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Copy public assets
COPY --from=builder /app/public ./public

# Copy entrypoint script
COPY --chmod=755 docker/entrypoint.sh ./entrypoint.sh

USER appuser
EXPOSE 3000
ENV PORT=3000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["npx", "vinext", "start"]
