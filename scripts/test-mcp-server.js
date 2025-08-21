#!/usr/bin/env node

/**
 * Test script for the Microsoft 365 MCP Server with Bearer Token authentication
 * 
 * This script demonstrates how to interact with the MCP server using a bearer token.
 */

// Configuration
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:3000/mcp';
const BEARER_TOKEN = process.env.BEARER_TOKEN || process.argv[2];

if (!BEARER_TOKEN) {
  console.error('❌ Bearer token is required!');
  console.log('\nUsage:');
  console.log('  node test-mcp-server.js <bearer-token>');
  console.log('  # OR');
  console.log('  export BEARER_TOKEN="<your-token>"');
  console.log('  node test-mcp-server.js');
  console.log('\nGet a token using:');
  console.log('  npm run get-token');
  console.log('  # OR');
  console.log('  npm run get-token:cli');
  process.exit(1);
}

/**
 * Make an MCP request
 */
async function mcpRequest(method, params = {}) {
  const request = {
    jsonrpc: '2.0',
    method: method,
    params: params,
    id: Date.now(),
  };

  try {
    const response = await fetch(MCP_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BEARER_TOKEN}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    return {
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: `Request failed: ${error.message}`,
      },
      id: request.id,
    };
  }
}

/**
 * Run a series of tests
 */
async function runTests() {
  console.log('🧪 Microsoft 365 MCP Server Test Suite');
  console.log('======================================\n');
  console.log(`📍 Server URL: ${MCP_SERVER_URL}`);
  console.log(`🔐 Token: ${BEARER_TOKEN.substring(0, 20)}...${BEARER_TOKEN.substring(BEARER_TOKEN.length - 10)}\n`);

  const tests = [
    {
      name: 'List available tools',
      method: 'tools/list',
    },
    {
      name: 'Get server capabilities',
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
        },
        clientInfo: {
          name: 'test-client',
          version: '1.0.0',
        },
      },
    },
    {
      name: 'List mail messages (first 5)',
      method: 'tools/call',
      params: {
        name: 'list-mail-messages',
        arguments: {
          top: 5,
        },
      },
    },
    {
      name: 'List calendars',
      method: 'tools/call',
      params: {
        name: 'list-calendars',
        arguments: {},
      },
    },
    {
      name: 'List OneDrive files',
      method: 'tools/call',
      params: {
        name: 'list-drives',
        arguments: {},
      },
    },
  ];

  for (const test of tests) {
    console.log(`🔍 ${test.name}...`);
    
    const result = await mcpRequest(test.method, test.params);
    
    if (result.error) {
      console.log(`❌ Failed: ${result.error.message}\n`);
    } else {
      console.log('✅ Success!');
      
      // Show a summary of the result
      if (test.method === 'tools/list' && result.result?.tools) {
        console.log(`   Found ${result.result.tools.length} tools`);
        const toolNames = result.result.tools.slice(0, 5).map(t => t.name);
        console.log(`   Examples: ${toolNames.join(', ')}${result.result.tools.length > 5 ? '...' : ''}`);
      } else if (test.method === 'initialize' && result.result) {
        console.log(`   Protocol version: ${result.result.protocolVersion || 'unknown'}`);
        console.log(`   Server name: ${result.result.serverInfo?.name || 'unknown'}`);
      } else if (result.result?.content?.[0]?.text) {
        try {
          const data = JSON.parse(result.result.content[0].text);
          if (Array.isArray(data.value)) {
            console.log(`   Found ${data.value.length} items`);
          } else if (data.value) {
            console.log('   Data retrieved successfully');
          }
        } catch {
          console.log('   Data retrieved successfully');
        }
      }
      console.log();
    }
  }
  
  console.log('🎉 Test suite completed!');
}

/**
 * Main function
 */
async function main() {
  try {
    await runTests();
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

main();
