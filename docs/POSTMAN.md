# Postman Collection Guide

Complete guide for testing the Microsoft 365 MCP Server using Postman, including ready-to-use collections and environment setups.

## 📮 Overview

This guide provides:
- **Pre-configured Postman collection** for all MCP endpoints
- **Environment setup** with variables and authentication
- **Test automation** with Postman scripts
- **Example workflows** for common scenarios

## 🚀 Quick Setup

### 1. Import Environment

Create a new Postman environment with these variables:

```json
{
  "name": "MS365 MCP Server",
  "values": [
    {
      "key": "mcp_base_url",
      "value": "http://localhost:3000",
      "description": "Base URL for MCP server"
    },
    {
      "key": "bearer_token",
      "value": "your-access-token-here",
      "description": "Microsoft Graph access token"
    },
    {
      "key": "request_id",
      "value": "1",
      "description": "JSON-RPC request ID (auto-incremented)"
    },
    {
      "key": "user_email",
      "value": "user@example.com",
      "description": "Test user email address"
    }
  ]
}
```

### 2. Set Global Headers

In Postman settings, add these headers to apply to all requests:

```
Content-Type: application/json
Accept: application/json, text/event-stream
Authorization: Bearer {{bearer_token}}
```

## 📁 Complete Postman Collection

### Collection Structure

```
MS365 MCP Server Collection/
├── 00 Health & Setup/
│   ├── Health Check
│   └── Initialize MCP Session
├── 01 Core MCP/
│   ├── List Tools
│   ├── Get Tool Info
│   └── Server Capabilities
├── 02 Email (Outlook)/
│   ├── List Mail Messages
│   ├── Get Mail Message
│   ├── Send Email
│   ├── Create Draft
│   ├── Delete Message
│   └── List Mail Folders
├── 03 Calendar/
│   ├── List Calendars
│   ├── List Events
│   ├── Get Calendar View
│   ├── Create Event
│   ├── Update Event
│   └── Delete Event
├── 04 OneDrive Files/
│   ├── List Drives
│   ├── Get Root Folder
│   ├── List Folder Contents
│   ├── Download File
│   ├── Upload File
│   └── Delete File
├── 05 Excel Operations/
│   ├── List Worksheets
│   ├── Get Range Data
│   ├── Create Chart
│   └── Format Range
├── 06 OneNote/
│   ├── List Notebooks
│   ├── List Sections
│   ├── List Pages
│   └── Create Page
├── 07 To Do Tasks/
│   ├── List Task Lists
│   ├── List Tasks
│   ├── Create Task
│   ├── Update Task
│   └── Delete Task
└── 99 Error Testing/
    ├── Invalid Token
    ├── Missing Auth
    ├── Invalid JSON-RPC
    └── Non-existent Tool
```

## 🔧 Individual Request Configurations

### Health Check
**Method**: `GET`  
**URL**: `{{mcp_base_url}}/health`  
**Headers**: None (uses global headers)

**Tests**:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Health status is ok", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.status).to.eql("ok");
});
```

### Initialize MCP Session
**Method**: `POST`  
**URL**: `{{mcp_base_url}}/mcp`  
**Body**:
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
      "name": "postman-client",
      "version": "1.0.0"
    }
  },
  "id": {{request_id}}
}
```

**Tests**:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Valid JSON-RPC response", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('jsonrpc', '2.0');
    pm.expect(jsonData).to.have.property('result');
});

// Auto-increment request ID
pm.test("Increment request ID", function () {
    let requestId = parseInt(pm.environment.get("request_id")) || 1;
    pm.environment.set("request_id", (requestId + 1).toString());
});
```

### List Tools
**Method**: `POST`  
**URL**: `{{mcp_base_url}}/mcp`  
**Body**:
```json
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": {{request_id}}
}
```

**Tests**:
```javascript
pm.test("Tools list returned", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.result).to.have.property('tools');
    pm.expect(jsonData.result.tools).to.be.an('array');
});

pm.test("Tools have required properties", function () {
    const jsonData = pm.response.json();
    const tools = jsonData.result.tools;
    
    if (tools.length > 0) {
        const tool = tools[0];
        pm.expect(tool).to.have.property('name');
        pm.expect(tool).to.have.property('description');
        pm.expect(tool).to.have.property('inputSchema');
    }
});
```

### List Mail Messages
**Method**: `POST`  
**URL**: `{{mcp_base_url}}/mcp`  
**Body**:
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-mail-messages",
    "arguments": {
      "top": 10,
      "orderby": "receivedDateTime desc"
    }
  },
  "id": {{request_id}}
}
```

**Tests**:
```javascript
pm.test("Email messages returned", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.result).to.have.property('content');
    
    const content = JSON.parse(jsonData.result.content[0].text);
    pm.expect(content).to.have.property('messages');
    pm.expect(content.messages).to.be.an('array');
});
```

### Send Email
**Method**: `POST`  
**URL**: `{{mcp_base_url}}/mcp`  
**Body**:
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "send-mail",
    "arguments": {
      "toRecipients": [
        {
          "emailAddress": {
            "address": "{{user_email}}"
          }
        }
      ],
      "subject": "Test Email from Postman - {{$timestamp}}",
      "bodyContent": "This is a test email sent from Postman at {{$timestamp}}",
      "bodyContentType": "Text"
    }
  },
  "id": {{request_id}}
}
```

### List Calendars
**Method**: `POST`  
**URL**: `{{mcp_base_url}}/mcp`  
**Body**:
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-calendars",
    "arguments": {}
  },
  "id": {{request_id}}
}
```

### Get Calendar View (Today's Events)
**Method**: `POST`  
**URL**: `{{mcp_base_url}}/mcp`  
**Body**:
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-calendar-view",
    "arguments": {
      "startTime": "{{$isoTimestamp}}",
      "endTime": "{{$isoTimestamp}}"
    }
  },
  "id": {{request_id}}
}
```

**Pre-request Script** (to set today's date range):
```javascript
// Set start and end times for today
const now = new Date();
const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

pm.request.body.raw = pm.request.body.raw
    .replace('"{{$isoTimestamp}}"', '"' + startOfDay.toISOString() + '"')
    .replace('"{{$isoTimestamp}}"', '"' + endOfDay.toISOString() + '"');
```

### Create Calendar Event
**Method**: `POST`  
**URL**: `{{mcp_base_url}}/mcp`  
**Body**:
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "create-calendar-event",
    "arguments": {
      "subject": "Test Event from Postman",
      "bodyContent": "This is a test event created from Postman",
      "bodyContentType": "Text",
      "startDateTime": "2024-12-01T10:00:00.000Z",
      "endDateTime": "2024-12-01T11:00:00.000Z",
      "timeZone": "UTC"
    }
  },
  "id": {{request_id}}
}
```

### List OneDrive Files
**Method**: `POST`  
**URL**: `{{mcp_base_url}}/mcp`  
**Body**:
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-drive-root-item",
    "arguments": {}
  },
  "id": {{request_id}}
}
```

## 🧪 Collection Tests and Automation

### Collection-Level Tests

Add these to your collection's "Tests" tab:

```javascript
// Set common variables
pm.test("Set common variables", function () {
    // Auto-increment request ID for all requests
    let requestId = parseInt(pm.environment.get("request_id")) || 1;
    pm.environment.set("request_id", (requestId + 1).toString());
    
    // Set timestamp for use in requests
    pm.environment.set("current_timestamp", new Date().toISOString());
});

// Common response validation
pm.test("Valid HTTP response", function () {
    pm.response.to.have.status(200);
});

pm.test("Valid JSON-RPC structure", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('jsonrpc', '2.0');
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData).to.not.have.property('error');
});

// Response time check
pm.test("Response time is less than 5 seconds", function () {
    pm.expect(pm.response.responseTime).to.be.below(5000);
});
```

### Workflow Tests

Create test workflows for common scenarios:

#### Email Workflow Test
```javascript
// In folder "Email Workflow"
// Request 1: List mail folders
// Request 2: List recent emails  
// Request 3: Get specific email details
// Request 4: Send test email
// Request 5: Verify email was sent

pm.test("Email workflow completed", function () {
    // Add workflow validation logic
    pm.expect(pm.environment.get("workflow_email_completed")).to.eql("true");
});
```

## 📊 Data Management

### Dynamic Data Generation

Use Postman's dynamic variables and custom scripts:

```javascript
// Pre-request script for generating test data
pm.globals.set("test_subject", "Test Email " + pm.variables.replaceIn("{{$randomWords}}"));
pm.globals.set("test_timestamp", new Date().toISOString());
pm.globals.set("test_guid", pm.variables.replaceIn("{{$guid}}"));

// Generate future date for calendar events
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 7); // One week from now
pm.globals.set("future_date", futureDate.toISOString());
```

### Environment-Specific Data

Create separate environments for different test scenarios:

**Development Environment**:
```json
{
  "mcp_base_url": "http://localhost:3000",
  "bearer_token": "dev-token-here",
  "test_email": "dev-user@company.com"
}
```

**Staging Environment**:
```json
{
  "mcp_base_url": "https://staging-mcp.company.com",
  "bearer_token": "staging-token-here",
  "test_email": "staging-user@company.com"
}
```

## 🔄 Collection Runner

### Running the Full Collection

1. **Open Collection Runner**
   - Click "..." on your collection
   - Select "Run collection"

2. **Configure Run**
   - Select environment: "MS365 MCP Server"
   - Set iterations: 1 (or more for load testing)
   - Set delay: 1000ms (between requests)
   - Enable "Save responses"

3. **Monitor Results**
   - Watch test results in real-time
   - Export results for analysis
   - Review failed tests and responses

### Automated Test Runs

Schedule automated runs using Postman Monitors:

1. **Create Monitor**
   - Go to Monitors tab
   - Create new monitor
   - Select your collection
   - Set schedule (hourly, daily, etc.)

2. **Monitor Configuration**
   ```json
   {
     "name": "MS365 MCP Health Check",
     "collection": "ms365-mcp-collection-id",
     "environment": "ms365-mcp-environment-id",
     "schedule": {
       "cron": "0 */6 * * *"
     },
     "notifications": {
       "onError": ["admin@company.com"],
       "onFailure": ["admin@company.com"]
     }
   }
   ```

## 📥 Import Ready-to-Use Collection

### Postman Collection JSON

Save this as `MS365-MCP-Collection.json`:

```json
{
  "info": {
    "name": "Microsoft 365 MCP Server",
    "description": "Complete test collection for MS365 MCP Server",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    }
  ],
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{bearer_token}}",
        "type": "string"
      }
    ]
  },
  "event": [
    {
      "listen": "test",
      "script": {
        "exec": [
          "// Auto-increment request ID",
          "let requestId = parseInt(pm.environment.get(\"request_id\")) || 1;",
          "pm.environment.set(\"request_id\", (requestId + 1).toString());",
          "",
          "// Common tests",
          "pm.test(\"Status code is 200\", function () {",
          "    pm.response.to.have.status(200);",
          "});",
          "",
          "if (pm.request.url.path.includes('mcp')) {",
          "    pm.test(\"Valid JSON-RPC response\", function () {",
          "        const jsonData = pm.response.json();",
          "        pm.expect(jsonData).to.have.property('jsonrpc', '2.0');",
          "        pm.expect(jsonData).to.have.property('id');",
          "    });",
          "}"
        ]
      }
    }
  ],
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/health",
          "host": ["{{baseUrl}}"],
          "path": ["health"]
        }
      }
    },
    {
      "name": "Initialize MCP",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Accept",
            "value": "application/json, text/event-stream"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"jsonrpc\": \"2.0\",\n  \"method\": \"initialize\",\n  \"params\": {\n    \"protocolVersion\": \"2024-11-05\",\n    \"capabilities\": {\n      \"roots\": { \"listChanged\": true },\n      \"sampling\": {}\n    },\n    \"clientInfo\": {\n      \"name\": \"postman-client\",\n      \"version\": \"1.0.0\"\n    }\n  },\n  \"id\": {{request_id}}\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/mcp",
          "host": ["{{baseUrl}}"],
          "path": ["mcp"]
        }
      }
    },
    {
      "name": "List Tools",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Accept",
            "value": "application/json, text/event-stream"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"jsonrpc\": \"2.0\",\n  \"method\": \"tools/list\",\n  \"id\": {{request_id}}\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/mcp",
          "host": ["{{baseUrl}}"],
          "path": ["mcp"]
        }
      }
    }
  ]
}
```

### Import Instructions

1. **Download Collection**
   - Save the JSON above as `MS365-MCP-Collection.json`

2. **Import to Postman**
   - Open Postman
   - Click "Import" button
   - Select file or drag and drop
   - Choose `MS365-MCP-Collection.json`

3. **Set Up Environment**
   - Create new environment
   - Add required variables (see setup section above)
   - Select the environment

4. **Start Testing**
   - Expand the imported collection
   - Run individual requests or the entire collection

## 🚨 Troubleshooting

### Common Issues

**1. Authentication Errors**
- Verify bearer token is valid and not expired
- Check token has required scopes
- Ensure Authorization header is properly set

**2. Invalid JSON-RPC Responses**
- Check request format matches JSON-RPC 2.0 specification
- Verify all required headers are present
- Ensure Content-Type is application/json

**3. Tool Not Found Errors**
- Verify tool name spelling in requests
- Check if server is running in correct mode
- Ensure tools are not filtered out by configuration

**4. Network Errors**
- Confirm server is running on correct port
- Check firewall and network connectivity
- Verify base URL in environment variables

### Debug Tips

1. **Enable Postman Console**
   - View → Show Postman Console
   - Monitor requests and responses in real-time

2. **Add Debug Logging**
   ```javascript
   console.log("Request ID:", pm.environment.get("request_id"));
   console.log("Bearer Token Present:", !!pm.environment.get("bearer_token"));
   console.log("Response Body:", pm.response.text());
   ```

3. **Check Response Headers**
   ```javascript
   pm.test("Check response headers", function () {
       console.log("Response Headers:", pm.response.headers.toJSON());
   });
   ```

## ⏭️ Next Steps

1. **Customize Collection**: Add your specific test cases and workflows
2. **Set Up Monitoring**: Create monitors for continuous testing
3. **Integrate CI/CD**: Use Newman to run collections in automated pipelines
4. **Extend Tests**: Add performance and load testing scenarios
5. **Share with Team**: Export and share collection with your development team
