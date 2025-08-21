# Setup Guide

Complete installation and configuration guide for the Microsoft 365 MCP Server.

## 📋 System Requirements

### Minimum Requirements
- **Node.js**: >= 20.0.0 (LTS recommended)
- **Package Manager**: npm (included with Node.js) or pnpm
- **Operating System**: Windows, macOS, or Linux
- **Memory**: 512MB RAM minimum
- **Network**: Internet connection for Microsoft Graph API

### Recommended Setup
- **Node.js**: Latest LTS version
- **Package Manager**: pnpm (faster and more efficient)
- **IDE**: VS Code with Node.js extensions

## 🛠️ Installation

### Option 1: NPM Package (Recommended)

```bash
# Install globally
npm install -g @softeria/ms-365-mcp-server

# Or install locally
npm install @softeria/ms-365-mcp-server
```

### Option 2: From Source

```bash
# Clone the repository
git clone https://github.com/softeria/ms-365-mcp-server.git
cd ms-365-mcp-server

# Install dependencies
npm install
# OR with pnpm
pnpm install

# Build the project
npm run build
```

## 🏗️ Project Structure

After installation, your project should look like:

```
mcp-server-m365/
├── .env                    # Environment configuration
├── .env.example           # Environment template
├── package.json           # Project dependencies
├── README.md             # Main documentation
├── bin/                  # Executable scripts
├── docs/                 # Documentation (this folder)
├── scripts/              # Utility scripts
│   ├── get-bearer-token.js
│   ├── get-bearer-token.sh
│   └── test-mcp-server.js
├── src/                  # Source code
└── dist/                 # Compiled output (after build)
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` with your configuration:

```bash
# REQUIRED: Azure AD Application (Client) ID
MS365_MCP_CLIENT_ID=your-client-id-here

# OPTIONAL: Azure AD Tenant ID (default: "common")
# - "common" for multi-tenant applications
# - "organizations" for any organizational directory
# - "consumers" for personal Microsoft accounts only
# - Your specific tenant ID for single-tenant apps
MS365_MCP_TENANT_ID=common

# OPTIONAL: Client Secret (for client credentials flow)
# Only needed for server-to-server authentication
MS365_MCP_CLIENT_SECRET=your-client-secret

# OPTIONAL: Server Configuration
# Port for HTTP server (default: 3000)
PORT=3000

# Enable read-only mode (default: false)
READ_ONLY=false

# Filter available tools with regex pattern
ENABLED_TOOLS=

# Logging level (default: info)
LOG_LEVEL=info
```

### Validation

Validate your configuration:

```bash
# Check if all required environment variables are set
npm run validate-config

# Test Azure AD app configuration
node scripts/validate-azure-app.js
```

## 🔧 Build and Development

### Building the Project

```bash
# Build TypeScript to JavaScript
npm run build

# Build with watch mode (for development)
npm run build:watch

# Clean build artifacts
npm run clean
```

### Development Mode

```bash
# Start in development mode with auto-reload
npm run dev

# Run with debugging
npm run dev:debug

# Run with verbose logging
npm run dev -- -v
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test files
npm test -- auth-tools.test.ts

# Run tests in watch mode
npm run test:watch
```

## 🚀 Starting the Server

### Production Mode

```bash
# Start the server
npm start

# Start with custom port
npm start -- --http 3001

# Start in read-only mode
npm start -- --read-only

# Start with tool filtering
npm start -- --enabled-tools "email|calendar"
```

### Development Mode

```bash
# Start with auto-reload
npm run dev

# Start with debugging enabled
npm run dev:debug
```

### Systemd Service (Linux)

Create a systemd service for production deployment:

```bash
# Create service file
sudo nano /etc/systemd/system/ms365-mcp-server.service
```

```ini
[Unit]
Description=Microsoft 365 MCP Server
After=network.target

[Service]
Type=simple
User=mcp-user
WorkingDirectory=/opt/ms365-mcp-server
EnvironmentFile=/opt/ms365-mcp-server/.env
ExecStart=/usr/bin/node dist/index.js --http 3000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start the service
sudo systemctl enable ms365-mcp-server
sudo systemctl start ms365-mcp-server

# Check status
sudo systemctl status ms365-mcp-server
```

### Docker (Optional)

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY .env ./

EXPOSE 3000
CMD ["node", "dist/index.js", "--http", "3000"]
```

```bash
# Build and run with Docker
docker build -t ms365-mcp-server .
docker run -p 3000:3000 --env-file .env ms365-mcp-server
```

## 🔍 Verification

### Health Check

```bash
# Check if server is running
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-01T12:00:00.000Z"}
```

### MCP Protocol Test

```bash
# Test MCP protocol (requires bearer token)
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{}},"id":1}'
```

## 📝 Logging

### Log Levels

Configure logging verbosity:

```bash
# Set log level in .env
LOG_LEVEL=debug  # debug, info, warn, error

# Or via command line
npm start -- --log-level debug
```

### Log Files

Logs are written to:
- **Console**: Standard output (default)
- **File**: `logs/server.log` (if configured)
- **Error File**: `logs/error.log` (errors only)

### Log Rotation

For production, consider log rotation:

```bash
# Install logrotate configuration
sudo nano /etc/logrotate.d/ms365-mcp-server
```

```
/opt/ms365-mcp-server/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
```

## 🔐 Security Considerations

### Environment Security

```bash
# Secure .env file permissions
chmod 600 .env
chown root:root .env  # Or appropriate user
```

### Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 3000/tcp  # HTTP port
sudo ufw enable
```

### TLS/SSL (Production)

For production, run behind a reverse proxy with TLS:

```nginx
# Nginx configuration example
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🆘 Troubleshooting

### Common Issues

1. **Server won't start**
   ```bash
   # Check if port is already in use
   lsof -i :3000
   # Kill conflicting process or use different port
   npm start -- --http 3001
   ```

2. **Module not found errors**
   ```bash
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Build failures**
   ```bash
   # Clean and rebuild
   npm run clean
   npm run build
   ```

### Getting Help

- **Check logs**: Look at console output and log files
- **Validate configuration**: Run `npm run validate-config`
- **Test Azure AD setup**: Run `node scripts/validate-azure-app.js`
- **Review documentation**: See [Troubleshooting Guide](TROUBLESHOOTING.md)

## ⏭️ Next Steps

1. **Configure Authentication**: See [Authentication Guide](AUTHENTICATION.md)
2. **Test the API**: Follow the [Testing Guide](TESTING.md)
3. **Explore Tools**: Check the [API Reference](API_REFERENCE.md)
4. **Customize Configuration**: See [Configuration Guide](CONFIGURATION.md)
