# Configuration Guide

Complete guide for configuring the Microsoft 365 MCP Server with environment variables, command-line options, and advanced settings.

## 🎯 Overview

The MS365 MCP Server can be configured through:
- **Environment variables** (`.env` file or system environment)
- **Command-line arguments** (runtime options)
- **Configuration files** (advanced scenarios)

## 📝 Environment Variables

### Required Variables

```bash
# REQUIRED: Azure AD Application (Client) ID
MS365_MCP_CLIENT_ID=12345678-1234-1234-1234-123456789abc
```

### Authentication Variables

```bash
# Azure AD Tenant ID (default: "common")
# Options: "common", "organizations", "consumers", or specific tenant ID
MS365_MCP_TENANT_ID=common

# Client Secret (for client credentials flow only)
# Not needed for delegated authentication with Bearer tokens
MS365_MCP_CLIENT_SECRET=your-client-secret-here

# Authority URL (advanced scenarios only)
# Default: https://login.microsoftonline.com/{tenant}
MS365_MCP_AUTHORITY=https://login.microsoftonline.com/common
```

### Server Configuration

```bash
# HTTP Server Port (default: 3000)
PORT=3000

# Bind Address (default: 0.0.0.0 - all interfaces)
HOST=0.0.0.0

# Read-only Mode (default: false)
# Prevents any write operations (create, update, delete)
READ_ONLY=false

# Enable Organization Features (default: false)
# Enables Teams, SharePoint, and other org-level tools
ORGANIZATION_MODE=false

# Tool Filtering (default: empty - all tools enabled)
# Use regex pattern to filter available tools
ENABLED_TOOLS=

# Request Timeout (default: 30000ms)
REQUEST_TIMEOUT=30000

# Rate Limiting (default: 100 requests per minute)
RATE_LIMIT=100
```

### Logging Configuration

```bash
# Log Level (default: info)
# Options: error, warn, info, debug, trace
LOG_LEVEL=info

# Log Format (default: json)
# Options: json, simple, colored
LOG_FORMAT=json

# Log File Path (default: logs/server.log)
LOG_FILE=logs/server.log

# Enable Console Logging (default: true)
LOG_CONSOLE=true

# Log Rotation (default: true)
LOG_ROTATION=true

# Max Log File Size (default: 10MB)
LOG_MAX_SIZE=10485760

# Max Log Files (default: 5)
LOG_MAX_FILES=5
```

### Feature Flags

```bash
# Enable Email Tools (default: true)
ENABLE_EMAIL=true

# Enable Calendar Tools (default: true)
ENABLE_CALENDAR=true

# Enable OneDrive Tools (default: true)
ENABLE_ONEDRIVE=true

# Enable Excel Tools (default: true)
ENABLE_EXCEL=true

# Enable OneNote Tools (default: true)
ENABLE_ONENOTE=true

# Enable Tasks Tools (default: true)
ENABLE_TASKS=true

# Enable Teams Tools (default: false, requires ORGANIZATION_MODE)
ENABLE_TEAMS=false

# Enable SharePoint Tools (default: false, requires ORGANIZATION_MODE)
ENABLE_SHAREPOINT=false
```

### Development Settings

```bash
# Development Mode (default: false)
NODE_ENV=development

# Debug Mode (default: false)
DEBUG=false

# Enable CORS (default: true)
ENABLE_CORS=true

# CORS Origins (default: *)
CORS_ORIGINS=*

# Enable Request Logging (default: true)
ENABLE_REQUEST_LOGGING=true

# Mock Mode (for testing without real API calls)
MOCK_MODE=false
```

## 🔧 Environment File Examples

### Development Environment

Create `.env.development`:

```bash
# Development Configuration
NODE_ENV=development
LOG_LEVEL=debug
DEBUG=true

# Azure AD (Development App)
MS365_MCP_CLIENT_ID=dev-client-id-here
MS365_MCP_TENANT_ID=common

# Server Settings
PORT=3000
HOST=localhost
READ_ONLY=false

# Enable All Features for Testing
ORGANIZATION_MODE=true
ENABLE_TEAMS=true
ENABLE_SHAREPOINT=true

# Development Logging
LOG_FORMAT=colored
LOG_CONSOLE=true
LOG_FILE=logs/dev-server.log

# CORS for local development
ENABLE_CORS=true
CORS_ORIGINS=http://localhost:*,http://127.0.0.1:*

# Generous timeouts for debugging
REQUEST_TIMEOUT=60000
```

### Production Environment

Create `.env.production`:

```bash
# Production Configuration
NODE_ENV=production
LOG_LEVEL=info

# Azure AD (Production App)
MS365_MCP_CLIENT_ID=prod-client-id-here
MS365_MCP_TENANT_ID=your-org-tenant-id
MS365_MCP_CLIENT_SECRET=prod-client-secret

# Server Settings
PORT=3000
HOST=0.0.0.0
READ_ONLY=false

# Organization Features
ORGANIZATION_MODE=true
ENABLE_TEAMS=true
ENABLE_SHAREPOINT=true

# Production Logging
LOG_FORMAT=json
LOG_CONSOLE=false
LOG_FILE=/var/log/ms365-mcp/server.log
LOG_ROTATION=true

# Security Settings
ENABLE_CORS=false
REQUEST_TIMEOUT=30000
RATE_LIMIT=200
```

### Testing Environment

Create `.env.test`:

```bash
# Test Configuration
NODE_ENV=test
LOG_LEVEL=warn

# Azure AD (Test App)
MS365_MCP_CLIENT_ID=test-client-id-here
MS365_MCP_TENANT_ID=common

# Test Server Settings
PORT=3001
READ_ONLY=true

# Limited Features for Testing
ORGANIZATION_MODE=false
ENABLE_TEAMS=false
ENABLE_SHAREPOINT=false

# Test Logging
LOG_CONSOLE=false
LOG_FILE=logs/test-server.log

# Mock External Calls
MOCK_MODE=true
```

## 🚀 Command Line Arguments

### Basic Usage

```bash
# Start server with default settings
npm start

# Start with custom port
npm start -- --port 3001
npm start -- --http 3001

# Start in read-only mode
npm start -- --read-only

# Enable verbose logging
npm start -- --verbose
npm start -- -v

# Enable debug mode
npm start -- --debug
npm start -- -d
```

### Advanced Arguments

```bash
# Tool filtering with regex
npm start -- --enabled-tools "email|calendar"
npm start -- --filter-tools "excel.*|onenote.*"

# Custom log level
npm start -- --log-level debug

# Bind to specific host
npm start -- --host 127.0.0.1

# Set custom timeout
npm start -- --timeout 45000

# Enable organization mode
npm start -- --org
npm start -- --organization

# Disable specific features
npm start -- --no-email
npm start -- --no-calendar
npm start -- --no-onedrive
```

### Environment-Specific Startup

```bash
# Load specific environment file
npm start -- --env production
npm start -- --config .env.production

# Override environment variables
PORT=4000 npm start
READ_ONLY=true npm start

# Multiple overrides
PORT=4000 READ_ONLY=true LOG_LEVEL=debug npm start
```

## ⚙️ Configuration Validation

### Startup Validation

The server validates configuration on startup:

```bash
# Validate configuration without starting
npm run validate-config

# Check Azure AD app configuration
npm run validate-azure

# Test token generation
npm run test-auth
```

### Configuration Errors

Common configuration errors and solutions:

#### Missing Client ID
```
Error: MS365_MCP_CLIENT_ID environment variable is required
```
**Solution**: Set `MS365_MCP_CLIENT_ID` in your `.env` file

#### Invalid Port
```
Error: Port 3000 is already in use
```
**Solution**: Use different port or kill process using the port
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
npm start -- --port 3001
```

#### Invalid Tool Filter
```
Error: Invalid regex pattern in ENABLED_TOOLS
```
**Solution**: Fix regex pattern or use simple string matching
```bash
# Good patterns
ENABLED_TOOLS="email|calendar"
ENABLED_TOOLS="excel.*"
ENABLED_TOOLS="list-.*-messages"

# Bad patterns
ENABLED_TOOLS="email["  # Invalid regex
```

## 🎛️ Runtime Configuration

### Dynamic Configuration Updates

Some settings can be updated at runtime:

```bash
# Update log level (requires restart)
curl -X POST http://localhost:3000/admin/config \
  -H "Content-Type: application/json" \
  -d '{"logLevel": "debug"}'

# Reload tool configurations
curl -X POST http://localhost:3000/admin/reload-tools

# Check current configuration
curl http://localhost:3000/admin/config
```

### Health and Status Endpoints

```bash
# Basic health check
curl http://localhost:3000/health

# Detailed status
curl http://localhost:3000/status

# Configuration summary
curl http://localhost:3000/config
```

## 🔧 Advanced Configuration

### Custom Configuration Files

Create `config/production.json`:

```json
{
  "server": {
    "port": 3000,
    "host": "0.0.0.0",
    "readOnly": false,
    "timeout": 30000
  },
  "azure": {
    "clientId": "${MS365_MCP_CLIENT_ID}",
    "tenantId": "${MS365_MCP_TENANT_ID}",
    "authority": "https://login.microsoftonline.com/${MS365_MCP_TENANT_ID}"
  },
  "logging": {
    "level": "info",
    "format": "json",
    "file": "/var/log/ms365-mcp/server.log",
    "console": false,
    "rotation": {
      "enabled": true,
      "maxSize": "10MB",
      "maxFiles": 5
    }
  },
  "features": {
    "organizationMode": true,
    "enabledTools": {
      "email": true,
      "calendar": true,
      "onedrive": true,
      "excel": true,
      "onenote": true,
      "tasks": true,
      "teams": true,
      "sharepoint": true
    }
  },
  "security": {
    "cors": {
      "enabled": false,
      "origins": []
    },
    "rateLimit": {
      "enabled": true,
      "requests": 200,
      "windowMs": 60000
    }
  }
}
```

Load custom configuration:
```bash
npm start -- --config config/production.json
```

### Environment-Specific Scripts

Create custom npm scripts in `package.json`:

```json
{
  "scripts": {
    "start": "node dist/index.js",
    "start:dev": "node dist/index.js --env development",
    "start:prod": "node dist/index.js --env production",
    "start:test": "node dist/index.js --env test",
    "start:debug": "node --inspect dist/index.js --debug",
    "start:readonly": "node dist/index.js --read-only",
    "start:org": "node dist/index.js --organization --port 3001"
  }
}
```

Usage:
```bash
npm run start:dev      # Development mode
npm run start:prod     # Production mode
npm run start:debug    # Debug mode with inspector
npm run start:readonly # Read-only mode
npm run start:org      # Organization mode
```

## 🐳 Docker Configuration

### Dockerfile with Configuration

```dockerfile
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY dist/ ./dist/
COPY config/ ./config/

# Create logs directory
RUN mkdir -p logs

# Set default environment
ENV NODE_ENV=production
ENV LOG_LEVEL=info
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["node", "dist/index.js"]
```

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  ms365-mcp-server:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MS365_MCP_CLIENT_ID=${MS365_MCP_CLIENT_ID}
      - MS365_MCP_TENANT_ID=${MS365_MCP_TENANT_ID}
      - LOG_LEVEL=info
      - ORGANIZATION_MODE=true
    env_file:
      - .env.production
    volumes:
      - ./logs:/app/logs
      - ./config:/app/config:ro
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Optional: Reverse proxy with SSL
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - ms365-mcp-server
    restart: unless-stopped
```

## 🔐 Security Configuration

### Production Security Settings

```bash
# Disable debug features
NODE_ENV=production
DEBUG=false
LOG_LEVEL=warn

# Restrict CORS
ENABLE_CORS=false
CORS_ORIGINS=https://yourdomain.com

# Enable rate limiting
RATE_LIMIT=100

# Secure logging
LOG_CONSOLE=false
LOG_FILE=/var/log/ms365-mcp/server.log

# Timeout settings
REQUEST_TIMEOUT=30000
```

### SSL/TLS Configuration

For production deployments, use a reverse proxy with SSL:

**Nginx Configuration** (`nginx.conf`):
```nginx
events {
    worker_connections 1024;
}

http {
    upstream mcp_server {
        server ms365-mcp-server:3000;
    }

    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            proxy_pass http://mcp_server;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # WebSocket support for streaming
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
```

## 📊 Monitoring Configuration

### Application Metrics

```bash
# Enable metrics collection
ENABLE_METRICS=true
METRICS_PORT=9090

# Prometheus endpoint
ENABLE_PROMETHEUS=true

# Health check configuration
HEALTH_CHECK_INTERVAL=30000
HEALTH_CHECK_TIMEOUT=5000
```

### Log Aggregation

For centralized logging:

```bash
# Syslog configuration
LOG_SYSLOG=true
SYSLOG_HOST=logs.company.com
SYSLOG_PORT=514

# JSON structured logging
LOG_FORMAT=json
LOG_STRUCTURED=true

# Additional log context
LOG_INCLUDE_TIMESTAMP=true
LOG_INCLUDE_HOSTNAME=true
LOG_INCLUDE_PID=true
```

## 🚨 Troubleshooting Configuration

### Configuration Debugging

```bash
# Show current configuration
npm run show-config

# Validate configuration
npm run validate-config

# Test with specific config
npm start -- --config config/debug.json --debug

# Environment variable debugging
printenv | grep MS365_MCP
```

### Common Configuration Issues

1. **Port conflicts**: Use `lsof -i :3000` to check port usage
2. **Permission errors**: Check file permissions for log directories
3. **Environment variable not found**: Verify `.env` file location and syntax
4. **Invalid JSON config**: Validate JSON syntax in configuration files
5. **Azure AD errors**: Verify client ID and tenant ID are correct

### Reset to Defaults

```bash
# Remove custom configuration
rm .env

# Copy default configuration
cp .env.example .env

# Start with minimal configuration
MS365_MCP_CLIENT_ID=your-client-id npm start
```

## ⏭️ Next Steps

1. **Test Configuration**: Validate your setup with test scripts
2. **Monitor Performance**: Set up monitoring and alerting
3. **Secure Deployment**: Implement security best practices
4. **Scale as Needed**: Configure for your expected load
5. **Backup Configuration**: Store configuration in version control
