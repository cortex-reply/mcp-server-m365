# Multi-stage Dockerfile for MS365 MCP Server
# Stage 1: Build stage
FROM node:20-alpine AS builder
# FROM node:20-alpine
# Install build dependencies
RUN apk add --no-cache python3 make g++ git

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm@latest && \
    pnpm install

COPY . .

RUN ls -la
# Install pnpm and dependencies

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

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app


# Copy package files
COPY package.json ./
COPY pnpm-lock.yaml ./
# Install only production dependencies
RUN npm install -g pnpm@latest && \
    pnpm install --frozen-lockfile --production && \
    pnpm store prune


# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Verify the copy worked
RUN ls -la dist/ && echo "Dist files copied successfully" && ls -la package.json

# Copy any config files that might be needed
# Note: .env should be passed via --env-file, not copied into image
# COPY .env ./ # Don't copy .env into image for security

# Create necessary directories with proper permissions
RUN mkdir -p logs config && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Set environment variables
ENV NODE_ENV=production \
    LOG_LEVEL=debug \
    PORT=3000 \
    HOST=0.0.0.0 \
    LOG_FILE=logs/server.log \
    LOG_CONSOLE=true

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application with explicit arguments to avoid CLI parsing issues
CMD ["node", "dist/index.js", "--http", "3000"]
