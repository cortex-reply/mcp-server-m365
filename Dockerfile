# Multi-stage Dockerfile for MS365 MCP Server
# Stage 1: Build stage
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++ git

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm@latest && \
    pnpm install --frozen-lockfile

# Copy source code and configuration files
COPY src/ ./src/
COPY bin/ ./bin/
COPY openapi/ ./openapi/
COPY tsconfig.json tsup.config.ts ./
COPY remove-recursive-refs.js ./

# Generate client and build the application
RUN pnpm run generate && \
    pnpm run build

# Stage 2: Production stage
FROM node:20-alpine AS production

# Install runtime dependencies and security updates
RUN apk add --no-cache \
    dumb-init \
    curl \
    && apk upgrade --no-cache \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install only production dependencies
RUN npm install -g pnpm@latest && \
    pnpm install --frozen-lockfile --prod && \
    pnpm store prune && \
    npm uninstall -g pnpm && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create necessary directories with proper permissions
RUN mkdir -p logs config && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Set environment variables
ENV NODE_ENV=production \
    LOG_LEVEL=info \
    PORT=3000 \
    HOST=0.0.0.0 \
    LOG_FILE=logs/server.log \
    LOG_CONSOLE=true

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/index.js", "--http", "3000"]
