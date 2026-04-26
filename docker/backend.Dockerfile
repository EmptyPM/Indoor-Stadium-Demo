# ─────────────────────────────────────────
# Backend Dockerfile – NestJS (Node 20)
# ─────────────────────────────────────────
FROM node:20-alpine AS base

# Install OpenSSL (required for Prisma)
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# ─── Stage 1: Dependencies ───────────────
FROM base AS deps
COPY apps/backend/package*.json ./
RUN npm install --omit=dev && \
    cp -R node_modules production_node_modules && \
    npm install

# ─── Stage 2: Build ──────────────────────
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY apps/backend/ .

# Generate Prisma client
RUN npx prisma generate

# Build the NestJS application
RUN npm run build

# ─── Stage 3: Production ─────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy production dependencies
COPY --from=deps /app/production_node_modules ./node_modules

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy Prisma schema & migrations (needed at runtime for migrations)
COPY apps/backend/prisma ./prisma

# Copy entrypoint
COPY docker/backend-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "dist/src/main.js"]
