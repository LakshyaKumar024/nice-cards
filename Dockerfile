# ---------- Base image with build deps ----------
FROM oven/bun:1 AS base

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    pkg-config \
    libpixman-1-dev \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*


# ---------- Install deps (dev + prod) ----------
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile


# ---------- Build application ----------
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps layer
COPY --from=deps /app/node_modules ./node_modules

# Copy full project
COPY . .

# Build-time env vars
ARG DATABASE_URL
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG CLERK_SECRET_KEY

ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV CLERK_SECRET_KEY=$CLERK_SECRET_KEY

# Generate Prisma client
RUN bunx prisma generate

# Build Next.js
RUN bun run build


# ---------- Production Runner ----------
FROM oven/bun:1 AS runner
WORKDIR /app

# Install only runtime dependencies needed for canvas
RUN apt-get update && apt-get install -y \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgif7 \
    librsvg2-2 \
    libjpeg62-turbo \
    && rm -rf /var/lib/apt/lists/*

# Install ONLY production dependencies (small size)
COPY package.json bun.lock ./
RUN bun install --production --frozen-lockfile

# Copy built application from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/.clerk ./.clerk

# IMPORTANT: Copy Prisma folder if generated client is inside /prisma
COPY --from=builder /app/prisma ./prisma

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Expose port
EXPOSE 3000

# Entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/entrypoint.sh"]
