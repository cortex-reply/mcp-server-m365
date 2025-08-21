# Testing Guide

Comprehensive guide for testing the Microsoft 365 MCP Server with various tools and methods.

## 🎯 Testing Overview

This guide covers:
- **Basic functionality testing** with curl
- **Postman collection** for interactive testing
- **Automated testing** with scripts
- **Performance testing** and monitoring
- **Integration testing** with real Microsoft 365 data

## 🚀 Prerequisites

1. **Server running**: `npm start`
2. **Valid token**: Use `npm run get-token` to get a Bearer token
3. **Test tools**: curl, Postman, or any HTTP client

## 📋 Quick Health Check

### 1. Server Health
```bash
# Check if server is running
curl http://localhost:3000/health

# Expected response:
# {"status":"ok","timestamp":"2024-01-01T12:00:00.000Z"}
```

### 2. MCP Protocol Test
```bash
# Test MCP initialization (replace YOUR_TOKEN)
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {}
    },
    "id": 1
  }'
```

## 🧪 Basic API Testing with curl

### Environment Setup
```bash
# Set your token for easy reuse
export BEARER_TOKEN="your-access-token-here"
export MCP_URL="http://localhost:3000/mcp"

# Create a reusable function
mcp_call() {
  curl -X POST "$MCP_URL" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -H "Authorization: Bearer $BEARER_TOKEN" \
    -d "$1"
}
```

### Core MCP Methods

#### 1. Initialize Session
```bash
mcp_call '{
  "jsonrpc": "2.0",
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "roots": { "listChanged": true },
      "sampling": {}
    },
    "clientInfo": {
      "name": "curl-test",
      "version": "1.0.0"
    }
  },
  "id": 1
}'
```

#### 2. List Available Tools
```bash
mcp_call '{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": 2
}'
```

#### 3. Test Email Tool
```bash
mcp_call '{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-mail-messages",
    "arguments": {
      "top": 5
    }
  },
  "id": 3
}'
```

#### 4. Test Calendar Tool
```bash
mcp_call '{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-calendars",
    "arguments": {}
  },
  "id": 4
}'
```

#### 5. Test OneDrive Tool
```bash
mcp_call '{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-drives",
    "arguments": {}
  },
  "id": 5
}'
```

## 📮 Postman Testing

### Setting Up Postman

1. **Import Environment**
   Create a new environment with these variables:
   ```json
   {
     "mcp_base_url": "http://localhost:3000",
     "bearer_token": "your-access-token-here",
     "request_id": "1"
   }
   ```

2. **Set Global Headers**
   In Postman settings, add these headers to all requests:
   ```
   Content-Type: application/json
   Accept: application/json, text/event-stream
   Authorization: Bearer {{bearer_token}}
   ```

### Basic Postman Collection

#### Request 1: Health Check
- **Method**: GET
- **URL**: `{{mcp_base_url}}/health`
- **Headers**: None needed

#### Request 2: Initialize MCP
- **Method**: POST
- **URL**: `{{mcp_base_url}}/mcp`
- **Body** (JSON):
```json
{
  "jsonrpc": "2.0",
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "roots": { "listChanged": true },
      "sampling": {}
    },
    "clientInfo": {
      "name": "postman-test",
      "version": "1.0.0"
    }
  },
  "id": {{request_id}}
}
```

#### Request 3: List Tools
- **Method**: POST
- **URL**: `{{mcp_base_url}}/mcp`
- **Body** (JSON):
```json
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": {{request_id}}
}
```

#### Request 4: Email Test
- **Method**: POST
- **URL**: `{{mcp_base_url}}/mcp`
- **Body** (JSON):
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-mail-messages",
    "arguments": {
      "top": 10,
      "filter": "isRead eq false"
    }
  },
  "id": {{request_id}}
}
```

### Postman Tests (JavaScript)

Add these tests to your Postman requests:

```javascript
// Test for successful response
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Test JSON-RPC response structure
pm.test("Valid JSON-RPC response", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('jsonrpc', '2.0');
    pm.expect(jsonData).to.have.property('id');
});

// Test for no errors
pm.test("No error in response", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.not.have.property('error');
});

// Auto-increment request ID
pm.test("Increment request ID", function () {
    let requestId = parseInt(pm.environment.get("request_id")) || 1;
    pm.environment.set("request_id", (requestId + 1).toString());
});
```

## 🤖 Automated Testing Scripts

### Using the Provided Test Script

```bash
# Run comprehensive tests
npm run test:mcp

# Run with custom token
BEARER_TOKEN="your-token" npm run test:mcp

# Run with verbose output
DEBUG=1 npm run test:mcp
```

### Custom Test Script

Create `test-custom.js`:

```javascript
#!/usr/bin/env node

const https = require('http');
const assert = require('assert');

const BEARER_TOKEN = process.env.BEARER_TOKEN;
const BASE_URL = 'http://localhost:3000';

if (!BEARER_TOKEN) {
  console.error('Error: BEARER_TOKEN environment variable is required');
  process.exit(1);
}

async function makeRequest(path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: body ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'Authorization': `Bearer ${BEARER_TOKEN}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });

    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting automated tests...\n');

  // Test 1: Health check
  console.log('1. Testing health endpoint...');
  const health = await makeRequest('/health');
  assert.strictEqual(health.status, 200, 'Health check failed');
  assert.strictEqual(health.data.status, 'ok', 'Health status not ok');
  console.log('✅ Health check passed\n');

  // Test 2: MCP Initialize
  console.log('2. Testing MCP initialization...');
  const init = await makeRequest('/mcp', {
    jsonrpc: '2.0',
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {}
    },
    id: 1
  });
  assert.strictEqual(init.status, 200, 'Initialize failed');
  assert.strictEqual(init.data.jsonrpc, '2.0', 'Invalid JSON-RPC response');
  console.log('✅ MCP initialization passed\n');

  // Test 3: List tools
  console.log('3. Testing tools list...');
  const tools = await makeRequest('/mcp', {
    jsonrpc: '2.0',
    method: 'tools/list',
    id: 2
  });
  assert.strictEqual(tools.status, 200, 'Tools list failed');
  assert(Array.isArray(tools.data.result.tools), 'Tools should be an array');
  console.log(`✅ Found ${tools.data.result.tools.length} tools\n`);

  // Test 4: Email tool
  console.log('4. Testing email tool...');
  const email = await makeRequest('/mcp', {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'list-mail-messages',
      arguments: { top: 1 }
    },
    id: 3
  });
  assert.strictEqual(email.status, 200, 'Email tool failed');
  console.log('✅ Email tool passed\n');

  console.log('🎉 All tests passed!');
}

runTests().catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});
```

Run your custom tests:
```bash
chmod +x test-custom.js
BEARER_TOKEN="your-token" node test-custom.js
```

## 📊 Load Testing

### Simple Load Test with curl

```bash
#!/bin/bash
# load-test.sh

BEARER_TOKEN="your-token-here"
CONCURRENT=10
REQUESTS=100
URL="http://localhost:3000/mcp"

echo "Running load test: $CONCURRENT concurrent users, $REQUESTS requests each"

for i in $(seq 1 $CONCURRENT); do
  {
    for j in $(seq 1 $REQUESTS); do
      curl -s -X POST "$URL" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $BEARER_TOKEN" \
        -d '{"jsonrpc":"2.0","method":"tools/list","id":'$j'}' \
        > /dev/null
    done
    echo "Worker $i completed $REQUESTS requests"
  } &
done

wait
echo "Load test completed"
```

### Using Apache Bench (ab)

```bash
# Install apache2-utils (Ubuntu/Debian) or httpd-tools (RHEL/CentOS)
sudo apt-get install apache2-utils

# Create a POST request file
cat > post-data.json << EOF
{"jsonrpc":"2.0","method":"tools/list","id":1}
EOF

# Run load test
ab -n 1000 -c 10 \
   -p post-data.json \
   -T "application/json" \
   -H "Authorization: Bearer YOUR_TOKEN" \
   http://localhost:3000/mcp
```

## 🔍 Error Testing

### Testing Error Conditions

#### 1. Invalid Token
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid-token" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

# Expected: 401 Unauthorized
```

#### 2. Missing Authorization
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'

# Expected: 401 Unauthorized
```

#### 3. Invalid JSON-RPC
```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -d '{"invalid":"request"}'

# Expected: JSON-RPC error response
```

#### 4. Non-existent Tool
```bash
mcp_call '{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "non-existent-tool",
    "arguments": {}
  },
  "id": 1
}'

# Expected: Tool not found error
```

#### 5. Invalid Arguments
```bash
mcp_call '{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-mail-messages",
    "arguments": {
      "top": "invalid-number"
    }
  },
  "id": 1
}'

# Expected: Validation error
```

## 📈 Performance Monitoring

### Server Metrics

Monitor server performance:

```bash
# CPU and memory usage
top -p $(pgrep -f "node.*index.js")

# Network connections
netstat -tulpn | grep :3000

# Detailed process info
ps aux | grep node

# Monitor log files
tail -f logs/server.log
```

### Response Time Testing

```bash
#!/bin/bash
# response-time-test.sh

BEARER_TOKEN="your-token"
URL="http://localhost:3000/mcp"

echo "Testing response times..."

for i in {1..10}; do
  start_time=$(date +%s%N)
  
  curl -s -X POST "$URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $BEARER_TOKEN" \
    -d '{"jsonrpc":"2.0","method":"tools/list","id":'$i'}' \
    > /dev/null
  
  end_time=$(date +%s%N)
  duration=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
  
  echo "Request $i: ${duration}ms"
done
```

## 🧩 Integration Testing

### Testing with Real Data

#### 1. Email Integration
```bash
# List recent emails
mcp_call '{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-mail-messages",
    "arguments": {
      "top": 5,
      "orderby": "receivedDateTime desc"
    }
  },
  "id": 1
}'

# Send a test email
mcp_call '{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "send-mail",
    "arguments": {
      "toRecipients": [{"emailAddress": {"address": "test@example.com"}}],
      "subject": "MCP Test Email",
      "bodyContent": "This is a test email from MCP server",
      "bodyContentType": "Text"
    }
  },
  "id": 2
}'
```

#### 2. Calendar Integration
```bash
# List today's events
mcp_call '{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-calendar-view",
    "arguments": {
      "startTime": "'$(date -I)'T00:00:00.000Z",
      "endTime": "'$(date -I)'T23:59:59.999Z"
    }
  },
  "id": 3
}'
```

#### 3. OneDrive Integration
```bash
# List files in root folder
mcp_call '{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-drive-root-item",
    "arguments": {}
  },
  "id": 4
}'
```

### Cross-Platform Testing

Test on different platforms:

```bash
# Linux/macOS
npm test

# Windows (PowerShell)
npm test

# Docker
docker run --rm -v $(pwd):/app -w /app node:20 npm test
```

## 🚨 Troubleshooting Tests

### Common Test Issues

#### 1. Token Expired
**Symptoms**: 401 Unauthorized responses
**Solution**: Generate a new token with `npm run get-token`

#### 2. Server Not Running
**Symptoms**: Connection refused errors
**Solution**: Start the server with `npm start`

#### 3. Wrong Port
**Symptoms**: Connection errors
**Solution**: Check if server is running on correct port (default: 3000)

#### 4. Missing Headers
**Symptoms**: 400 Bad Request or unexpected responses
**Solution**: Ensure all required headers are present:
- `Content-Type: application/json`
- `Accept: application/json, text/event-stream`
- `Authorization: Bearer <token>`

#### 5. Invalid JSON
**Symptoms**: JSON parsing errors
**Solution**: Validate JSON syntax and JSON-RPC format

### Debug Mode

Enable debug logging:

```bash
# Start server with debug logging
DEBUG=* npm start

# Or set log level
LOG_LEVEL=debug npm start

# Run tests with debug output
DEBUG=1 npm run test:mcp
```

## 📋 Test Checklist

Before deploying or releasing:

- [ ] Health endpoint responds correctly
- [ ] MCP initialization works
- [ ] All tools are listed correctly
- [ ] Email tools work with real mailbox
- [ ] Calendar tools work with real calendar
- [ ] OneDrive tools work with real files
- [ ] Error handling works correctly
- [ ] Authentication failures are handled
- [ ] Invalid requests return proper errors
- [ ] Performance is acceptable under load
- [ ] Memory usage is stable
- [ ] All environment configurations work
- [ ] Read-only mode functions correctly
- [ ] Tool filtering works as expected

## ⏭️ Next Steps

1. **Set up CI/CD**: Automate testing in your deployment pipeline
2. **Monitor Production**: Set up monitoring and alerting
3. **Performance Tuning**: Optimize based on test results
4. **Documentation**: Update API docs based on test findings
5. **Security Testing**: Perform security audits and penetration testing
