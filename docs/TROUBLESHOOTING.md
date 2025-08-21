# Troubleshooting Guide

Comprehensive troubleshooting guide for the Microsoft 365 MCP Server, covering common issues, error messages, and solutions.

## 🎯 Quick Diagnosis

### Is Your Server Running?

```bash
# Check if server is running
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-01T12:00:00.000Z"}

# If connection refused:
# - Server is not running: npm start
# - Wrong port: check PORT environment variable
# - Firewall blocking: check firewall settings
```

### Do You Have a Valid Token?

```bash
# Test your token directly with Microsoft Graph
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://graph.microsoft.com/v1.0/me

# Expected: User profile information
# If 401 Unauthorized: Token is invalid or expired
# If 403 Forbidden: Token lacks required permissions
```

### Can You Make MCP Calls?

```bash
# Test basic MCP functionality
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

# Expected: List of available tools
# If error: Check headers, token, and request format
```

## 🚨 Common Error Messages

### Authentication Errors

#### "MS365_MCP_CLIENT_ID environment variable is required"

**Cause**: Missing Azure AD application client ID

**Solution**:
```bash
# Add to .env file
echo "MS365_MCP_CLIENT_ID=your-client-id-here" >> .env

# Or set environment variable
export MS365_MCP_CLIENT_ID="your-client-id-here"

# Restart server
npm start
```

#### "401 Unauthorized"

**Cause**: Invalid or missing Bearer token

**Solutions**:
1. **Generate new token**:
   ```bash
   npm run get-token
   ```

2. **Check token format**:
   ```bash
   # Token should be in this format
   Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6...
   ```

3. **Verify token hasn't expired**:
   ```bash
   # Tokens typically expire after 1 hour
   # Check timestamp in JWT payload or regenerate
   ```

#### "AADSTS700016: Application with identifier 'xxx' was not found"

**Cause**: Invalid client ID or app doesn't exist

**Solutions**:
1. **Verify client ID in Azure Portal**:
   - Go to Azure AD → App registrations
   - Find your app and copy the correct Application (client) ID
   - Update .env file with correct ID

2. **Check tenant context**:
   ```bash
   # Make sure you're in the right tenant
   MS365_MCP_TENANT_ID=your-correct-tenant-id
   ```

#### "AADSTS50011: Reply URL does not match"

**Cause**: Incorrect redirect URI configuration

**Solution**:
1. **Add correct redirect URI in Azure AD**:
   - Go to your app → Authentication
   - Add platform: Mobile and desktop applications
   - Add redirect URI: `https://login.microsoftonline.com/common/oauth2/nativeclient`
   - Enable "Allow public client flows"

### Server Startup Errors

#### "Error: listen EADDRINUSE: address already in use :::3000"

**Cause**: Port 3000 is already in use

**Solutions**:
1. **Find and kill the process**:
   ```bash
   # Find process using port 3000
   lsof -i :3000
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Use a different port**:
   ```bash
   # Set different port in .env
   PORT=3001
   
   # Or use command line
   npm start -- --port 3001
   ```

#### "Cannot find module 'xxx'"

**Cause**: Missing dependencies

**Solution**:
```bash
# Clean and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# If using pnpm
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### "SyntaxError: Unexpected token"

**Cause**: Node.js version incompatibility

**Solution**:
```bash
# Check Node.js version
node --version

# Should be >= 20.0.0
# Update Node.js if needed
nvm install 20
nvm use 20

# Or use npm
npm install -g n
n latest
```

### MCP Protocol Errors

#### "Invalid JSON-RPC request"

**Cause**: Malformed JSON-RPC request

**Solution**: Ensure request follows JSON-RPC 2.0 format:
```json
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "params": {},
  "id": 1
}
```

**Required fields**:
- `jsonrpc`: Must be "2.0"
- `method`: Valid MCP method name
- `id`: Unique request identifier

#### "Method not found"

**Cause**: Invalid MCP method name

**Valid methods**:
- `initialize`
- `tools/list`
- `tools/call`

**Example**:
```bash
# Correct
{"jsonrpc":"2.0","method":"tools/list","id":1}

# Incorrect
{"jsonrpc":"2.0","method":"list-tools","id":1}  # Wrong method name
```

#### "Tool not found: xxx"

**Cause**: Requesting non-existent tool or tool is filtered out

**Solutions**:
1. **List available tools**:
   ```bash
   curl -X POST http://localhost:3000/mcp \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
   ```

2. **Check tool filtering**:
   ```bash
   # Check ENABLED_TOOLS environment variable
   echo $ENABLED_TOOLS
   
   # Remove filtering to see all tools
   unset ENABLED_TOOLS
   npm start
   ```

### Microsoft Graph API Errors

#### "Insufficient privileges to complete the operation"

**Cause**: Token lacks required permissions/scopes

**Solution**:
1. **Add required scopes to Azure AD app**:
   - Go to your app → API permissions
   - Add Microsoft Graph permissions:
     - `User.Read` (always required)
     - `Mail.ReadWrite` (for email)
     - `Calendars.ReadWrite` (for calendar)
     - `Files.ReadWrite` (for OneDrive)

2. **Grant admin consent** (if required):
   - Click "Grant admin consent for [Organization]"

3. **Regenerate token with new scopes**:
   ```bash
   npm run get-token
   ```

#### "Request_ResourceNotFound"

**Cause**: Accessing non-existent resource

**Common scenarios**:
- Wrong user ID
- Deleted mailbox/calendar/file
- Insufficient permissions

**Solution**: Verify resource exists and user has access

#### "TooManyRequests / Rate limit exceeded"

**Cause**: Hitting Microsoft Graph rate limits

**Solution**:
1. **Implement backoff in your application**
2. **Reduce request frequency**
3. **Use batch requests when possible**
4. **Check rate limit headers in responses**

### Network and Connectivity Issues

#### "ENOTFOUND" or "ECONNREFUSED"

**Cause**: Network connectivity issues

**Solutions**:
1. **Check internet connection**:
   ```bash
   ping google.com
   curl https://graph.microsoft.com/v1.0
   ```

2. **Check firewall settings**:
   ```bash
   # Allow outbound HTTPS
   sudo ufw allow out 443
   
   # Allow inbound on server port
   sudo ufw allow 3000
   ```

3. **Check proxy settings**:
   ```bash
   # If behind corporate proxy
   export HTTPS_PROXY=http://proxy.company.com:8080
   export HTTP_PROXY=http://proxy.company.com:8080
   ```

#### "SSL/TLS Certificate Errors"

**Cause**: Certificate validation issues

**Solutions**:
1. **Update certificates**:
   ```bash
   # Update CA certificates
   sudo apt-get update && sudo apt-get install ca-certificates
   ```

2. **Check system time**:
   ```bash
   # Ensure system time is correct
   timedatectl status
   ```

## 🔍 Debugging Tools

### Enable Debug Logging

```bash
# Method 1: Environment variable
DEBUG=* npm start

# Method 2: Log level
LOG_LEVEL=debug npm start

# Method 3: Command line
npm start -- --verbose

# Method 4: Multiple debug namespaces
DEBUG=mcp:*,graph:* npm start
```

### Log Analysis

```bash
# Monitor logs in real-time
tail -f logs/server.log

# Search for errors
grep -i error logs/server.log

# Search for specific patterns
grep "401\|403\|500" logs/server.log

# Analyze JSON logs with jq
cat logs/server.log | jq '.level' | sort | uniq -c
```

### Network Debugging

```bash
# Check listening ports
netstat -tulpn | grep node

# Monitor network connections
ss -tuln | grep :3000

# Check DNS resolution
nslookup graph.microsoft.com
dig graph.microsoft.com

# Test HTTPS connectivity
openssl s_client -connect graph.microsoft.com:443
```

### Token Debugging

```bash
# Decode JWT token (without verification)
node -e "
const token = 'YOUR_TOKEN_HERE';
const payload = Buffer.from(token.split('.')[1], 'base64').toString();
console.log(JSON.stringify(JSON.parse(payload), null, 2));
"

# Check token expiration
node -e "
const token = 'YOUR_TOKEN_HERE';
const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
console.log('Expires:', new Date(payload.exp * 1000));
console.log('Current:', new Date());
console.log('Valid:', payload.exp * 1000 > Date.now());
"
```

## 🧪 Testing and Validation

### Health Check Script

Create `health-check.sh`:
```bash
#!/bin/bash

BASE_URL="http://localhost:3000"
TOKEN="$1"

if [ -z "$TOKEN" ]; then
    echo "Usage: $0 <bearer-token>"
    exit 1
fi

echo "🔍 Health Check Starting..."

# Test 1: Server health
echo -n "1. Server health... "
HEALTH=$(curl -s "$BASE_URL/health")
if echo "$HEALTH" | grep -q '"status":"ok"'; then
    echo "✅ OK"
else
    echo "❌ FAILED: $HEALTH"
    exit 1
fi

# Test 2: MCP initialization
echo -n "2. MCP initialization... "
INIT=$(curl -s -X POST "$BASE_URL/mcp" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{}},"id":1}')

if echo "$INIT" | grep -q '"jsonrpc":"2.0"'; then
    echo "✅ OK"
else
    echo "❌ FAILED: $INIT"
    exit 1
fi

# Test 3: List tools
echo -n "3. List tools... "
TOOLS=$(curl -s -X POST "$BASE_URL/mcp" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"jsonrpc":"2.0","method":"tools/list","id":2}')

if echo "$TOOLS" | grep -q '"tools"'; then
    TOOL_COUNT=$(echo "$TOOLS" | jq '.result.tools | length')
    echo "✅ OK ($TOOL_COUNT tools available)"
else
    echo "❌ FAILED: $TOOLS"
    exit 1
fi

echo "🎉 All health checks passed!"
```

Usage:
```bash
chmod +x health-check.sh
./health-check.sh "your-bearer-token"
```

### Configuration Validator

Create `validate-config.js`:
```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function validateConfig() {
    console.log('🔍 Validating configuration...\n');

    // Check required environment variables
    const required = ['MS365_MCP_CLIENT_ID'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.log('❌ Missing required environment variables:');
        missing.forEach(key => console.log(`   - ${key}`));
        return false;
    }

    // Check .env file
    const envPath = path.join(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
        console.log('⚠️  No .env file found (using system environment variables)');
    } else {
        console.log('✅ .env file found');
    }

    // Validate client ID format
    const clientId = process.env.MS365_MCP_CLIENT_ID;
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!guidRegex.test(clientId)) {
        console.log('❌ MS365_MCP_CLIENT_ID appears to be invalid (should be a GUID)');
        return false;
    }

    // Check port availability
    const port = process.env.PORT || 3000;
    const net = require('net');
    const server = net.createServer();

    return new Promise((resolve) => {
        server.listen(port, () => {
            console.log(`✅ Port ${port} is available`);
            server.close();
            console.log('\n🎉 Configuration validation passed!');
            resolve(true);
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.log(`❌ Port ${port} is already in use`);
            } else {
                console.log(`❌ Port check failed: ${err.message}`);
            }
            resolve(false);
        });
    });
}

// Load .env file if it exists
try {
    require('dotenv').config();
} catch (e) {
    // dotenv not available, continue without it
}

validateConfig().then(success => {
    process.exit(success ? 0 : 1);
});
```

Usage:
```bash
node validate-config.js
```

## 🚨 Emergency Procedures

### Server Won't Start

1. **Check the basics**:
   ```bash
   # Verify Node.js version
   node --version  # Should be >= 20

   # Check if .env file exists and has required variables
   cat .env | grep MS365_MCP_CLIENT_ID

   # Verify dependencies are installed
   npm list --depth=0
   ```

2. **Try minimal startup**:
   ```bash
   # Start with minimal configuration
   MS365_MCP_CLIENT_ID=your-client-id node dist/index.js
   ```

3. **Check for port conflicts**:
   ```bash
   # Kill any processes using port 3000
   sudo lsof -t -i:3000 | xargs sudo kill -9
   ```

### Token Issues

1. **Generate fresh token**:
   ```bash
   # Clear any cached tokens
   rm -rf ~/.cache/ms365-mcp/
   
   # Generate new token
   npm run get-token
   ```

2. **Test token manually**:
   ```bash
   # Test with Microsoft Graph directly
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        https://graph.microsoft.com/v1.0/me
   ```

### Complete Reset

```bash
# Stop all processes
pkill -f "node.*mcp"

# Clean installation
rm -rf node_modules package-lock.json
npm install

# Reset configuration
cp .env.example .env
# Edit .env with your client ID

# Rebuild application
npm run build

# Start fresh
npm start
```

## 📞 Getting Help

### Collecting Diagnostic Information

Before seeking help, collect this information:

```bash
# System information
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo "OS: $(uname -a)"

# Application information
echo "Package version: $(npm list @softeria/ms-365-mcp-server --depth=0)"
echo "Environment: $NODE_ENV"

# Configuration (sanitized)
echo "Client ID set: $([ -n "$MS365_MCP_CLIENT_ID" ] && echo "Yes" || echo "No")"
echo "Tenant ID: ${MS365_MCP_TENANT_ID:-"not set"}"
echo "Port: ${PORT:-3000}"

# Recent logs (last 50 lines)
tail -50 logs/server.log 2>/dev/null || echo "No log file found"
```

### Log Package Script

Create `collect-logs.sh`:
```bash
#!/bin/bash

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_PACKAGE="mcp-logs-$TIMESTAMP.tar.gz"

echo "📦 Collecting diagnostic information..."

# Create temporary directory
mkdir -p /tmp/mcp-diagnostics

# Collect system info
{
    echo "=== System Information ==="
    echo "Timestamp: $(date)"
    echo "Node.js: $(node --version)"
    echo "npm: $(npm --version)"
    echo "OS: $(uname -a)"
    echo ""
    
    echo "=== Environment Variables ==="
    env | grep -E "MS365_MCP|NODE_ENV|PORT|DEBUG" | sort
    echo ""
    
    echo "=== Package Information ==="
    npm list --depth=0 2>/dev/null || echo "npm list failed"
    echo ""
    
    echo "=== Process Information ==="
    ps aux | grep -E "node|mcp" | grep -v grep
    echo ""
    
    echo "=== Network Information ==="
    netstat -tulpn | grep -E ":3000|node"
    echo ""
    
} > /tmp/mcp-diagnostics/system-info.txt

# Copy logs
cp logs/*.log /tmp/mcp-diagnostics/ 2>/dev/null || echo "No log files found"

# Copy configuration (sanitized)
if [ -f .env ]; then
    sed 's/=.*/=REDACTED/' .env > /tmp/mcp-diagnostics/env-sanitized.txt
fi

# Create package
tar -czf "$LOG_PACKAGE" -C /tmp/mcp-diagnostics .

# Cleanup
rm -rf /tmp/mcp-diagnostics

echo "✅ Diagnostic package created: $LOG_PACKAGE"
echo "📧 Please include this file when reporting issues"
```

### Contact Information

- **GitHub Issues**: [Report bugs and feature requests](https://github.com/softeria/ms-365-mcp-server/issues)
- **Documentation**: Check all documentation in the `/docs` folder
- **Community**: Search existing issues for similar problems

### Before Reporting Issues

1. **Check existing documentation**
2. **Search GitHub issues**
3. **Try the troubleshooting steps above**
4. **Collect diagnostic information**
5. **Provide minimal reproduction steps**

## ⏭️ Prevention

### Regular Maintenance

```bash
# Weekly health check
./health-check.sh "$BEARER_TOKEN"

# Monthly dependency updates
npm update
npm audit fix

# Log rotation
find logs/ -name "*.log" -mtime +30 -delete

# Configuration backup
cp .env .env.backup.$(date +%Y%m%d)
```

### Monitoring Setup

Set up monitoring to catch issues early:

```bash
# Simple uptime monitoring
watch -n 60 'curl -s http://localhost:3000/health || echo "Server down at $(date)"'

# Log monitoring for errors
tail -f logs/server.log | grep -i error --line-buffered
```

Remember: Most issues can be resolved by checking configuration, regenerating tokens, or restarting the server. When in doubt, start with the basics!
