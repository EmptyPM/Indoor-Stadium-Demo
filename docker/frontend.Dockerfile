# ─────────────────────────────────────────
# Frontend Dockerfile – Next.js (Node 20)
# ─────────────────────────────────────────
FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat
WORKDIR /app

# ─── Stage 1: Dependencies ───────────────
FROM base AS deps
COPY apps/frontend/package*.json ./
RUN npm install

# ─── Stage 2: Build ──────────────────────
FROM base AS builder
WORKDIR /app

# Build-time env vars
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_NAME

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY apps/frontend/ .

RUN npm run build

# ─── Stage 3: Production ─────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets and built output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
