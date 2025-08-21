#!/usr/bin/env node

/**
 * Script to obtain a Microsoft Graph bearer token for use with the MCP server
 * 
 * This script provides multiple methods to obtain a bearer token:
 * 1. Device Code Flow (interactive)
 * 2. Client Credentials Flow (app-only)
 * 3. Azure CLI (if available)
 */

import { PublicClientApplication, ConfidentialClientApplication } from '@azure/msal-node';
import { spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables if .env exists
const envPath = path.join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    }
  });
}

// Configuration - Environment variables are required
const TENANT_ID = process.env.MS365_MCP_TENANT_ID || 'common';
const CLIENT_ID = process.env.MS365_MCP_CLIENT_ID;
const CLIENT_SECRET = process.env.MS365_MCP_CLIENT_SECRET;

// Validate required configuration
function validateConfig() {
  if (!CLIENT_ID) {
    console.error('❌ MS365_MCP_CLIENT_ID environment variable is required');
    console.error('   Please set it to your Azure AD app registration client ID');
    console.error('   Example: export MS365_MCP_CLIENT_ID="your-client-id"');
    console.error('');
    console.error('   To create an Azure AD app registration:');
    console.error('   1. Go to https://portal.azure.com');
    console.error('   2. Navigate to Azure Active Directory → App registrations → New registration');
    console.error('   3. Set name: "MS365 MCP Server"');
    console.error('   4. Copy the Application (client) ID');
    console.error('');
    process.exit(1);
  }

  console.log('📋 Configuration:');
  console.log(`   Client ID: ${CLIENT_ID.substring(0, 8)}...`);
  console.log(`   Tenant ID: ${TENANT_ID}`);
  console.log('');
}

// Microsoft Graph scopes for comprehensive access
const SCOPES = [
  'https://graph.microsoft.com/User.Read',
  'https://graph.microsoft.com/Mail.ReadWrite',
  'https://graph.microsoft.com/Calendars.ReadWrite',
//   'https://graph.microsoft.com/Files.ReadWrite',
//   'https://graph.microsoft.com/Tasks.ReadWrite',
//   'https://graph.microsoft.com/Contacts.ReadWrite',
//   'https://graph.microsoft.com/Notes.ReadWrite',
//   'https://graph.microsoft.com/Sites.ReadWrite.All',
//   'https://graph.microsoft.com/Team.ReadBasic.All',
//   'https://graph.microsoft.com/Channel.ReadBasic.All',
//   'https://graph.microsoft.com/Directory.Read.All',
//   'https://graph.microsoft.com/Group.Read.All'
];

/**
 * Method 1: Device Code Flow (Interactive)
 */
async function getTokenWithDeviceCode() {
  console.log('\n🔐 Using Device Code Flow (Interactive)...\n');
  
  const pca = new PublicClientApplication({
    auth: {
      clientId: CLIENT_ID,
      authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    },
    cache: {
      cacheLocation: "fileCache",
      storeAuthStateInCookie: false,
    },
  });

  try {
    console.log('📋 Authentication Configuration:');
    console.log(`   Authority: https://login.microsoftonline.com/${TENANT_ID}`);
    console.log(`   Client ID: ${CLIENT_ID}`);
    console.log('   Flow Type: Device Code (Public Client)');
    console.log('   Required Redirect URI: https://login.microsoftonline.com/common/oauth2/nativeclient');
    console.log('   Requested Scopes:', SCOPES.join(', '));
    console.log('');

    const deviceCodeRequest = {
      scopes: SCOPES,
      deviceCodeCallback: (response) => {
        console.log('📱 To complete authentication:');
        console.log(`   1. Open your browser to: ${response.verificationUri}`);
        console.log(`   2. Enter this code: ${response.userCode}`);
        console.log('\n⏳ Waiting for authentication...\n');
      },
    };

    const response = await pca.acquireTokenByDeviceCode(deviceCodeRequest);
    
    return {
      accessToken: response.accessToken,
      expiresOn: response.expiresOn,
      account: response.account?.username || 'Unknown',
      scopes: response.scopes,
    };
  } catch (error) {
    console.error('\n❌ Detailed Error Information:');
    console.error('   Error Code:', error.errorCode || 'Unknown');
    console.error('   Error Message:', error.errorMessage || error.message);
    console.error('   Correlation ID:', error.correlationId || 'N/A');
    console.error('   Timestamp:', new Date().toISOString());
    console.error('');
    console.error('💡 To fix "invalid_client" error, configure your Azure AD app registration:');
    console.error('');
    console.error('   Step 1: Add Redirect URI');
    console.error('   - Go to Azure Portal → Azure AD → App registrations → Your App');
    console.error('   - Navigate to Authentication → Add a platform → Mobile and desktop applications');
    console.error('   - Add this redirect URI: https://login.microsoftonline.com/common/oauth2/nativeclient');
    console.error('');
    console.error('   Step 2: Enable Public Client Flows');
    console.error('   - In Authentication → Advanced settings');
    console.error('   - Set "Allow public client flows" to Yes');
    console.error('   - Click Save');
    console.error('');
    console.error('   Step 3: Verify Client ID');
    console.error(`   - Current Client ID: ${CLIENT_ID}`);
    console.error('   - Ensure this matches your Azure AD app registration');
    console.error('');
    throw new Error(`Device code authentication failed: ${error.errorCode || 'unknown'} - ${error.errorMessage || error.message}`);
  }
}

/**
 * Method 2: Client Credentials Flow (App-only)
 */
async function getTokenWithClientCredentials() {
  console.log('\n🔐 Using Client Credentials Flow (App-only)...\n');
  
  if (!CLIENT_SECRET) {
    throw new Error('CLIENT_SECRET is required for client credentials flow. Set MS365_MCP_CLIENT_SECRET environment variable.');
  }

  const cca = new ConfidentialClientApplication({
    auth: {
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    },
  });

  try {
    const clientCredentialRequest = {
      scopes: ['https://graph.microsoft.com/.default'],
    };

    const response = await cca.acquireTokenByClientCredential(clientCredentialRequest);
    
    return {
      accessToken: response.accessToken,
      expiresOn: response.expiresOn,
      account: 'Application',
      scopes: ['Application permissions'],
    };
  } catch (error) {
    throw new Error(`Client credentials authentication failed: ${error.message}`);
  }
}

/**
 * Method 3: Azure CLI
 */
async function getTokenWithAzureCli() {
  console.log('\n🔐 Using Azure CLI...\n');
  
  return new Promise((resolve, reject) => {
    const azCmd = spawn('az', ['account', 'get-access-token', '--resource', 'https://graph.microsoft.com/', '--output', 'json']);
    
    let stdout = '';
    let stderr = '';
    
    azCmd.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    azCmd.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    azCmd.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Azure CLI failed: ${stderr}`));
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        resolve({
          accessToken: result.accessToken,
          expiresOn: new Date(result.expiresOn),
          account: result.subscription || 'Azure CLI',
          scopes: ['Azure CLI managed'],
        });
      } catch (error) {
        reject(new Error(`Failed to parse Azure CLI output: ${error.message}`));
      }
    });
  });
}

/**
 * Validate token by making a test Graph API call
 */
async function validateToken(accessToken) {
  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (response.ok) {
      const user = await response.json();
      return {
        valid: true,
        user: {
          displayName: user.displayName,
          userPrincipalName: user.userPrincipalName,
          id: user.id,
        },
      };
    } else {
      return {
        valid: false,
        error: `HTTP ${response.status}: ${await response.text()}`,
      };
    }
  } catch (error) {
    return {
      valid: false,
      error: error.message,
    };
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Microsoft Graph Bearer Token Generator');
  console.log('=========================================\n');
  
  // Validate configuration first
  validateConfig();
  
  const method = process.argv[2] || 'device';
  
  try {
    let tokenResult;
    
    switch (method.toLowerCase()) {
      case 'device':
      case 'interactive':
        tokenResult = await getTokenWithDeviceCode();
        break;
        
      case 'client':
      case 'app':
        tokenResult = await getTokenWithClientCredentials();
        break;
        
      case 'az':
      case 'cli':
        tokenResult = await getTokenWithAzureCli();
        break;
        
      default:
        console.error('❌ Invalid method. Use: device, client, or az');
        process.exit(1);
    }
    
    console.log('✅ Token acquired successfully!\n');
    console.log('📋 Token Details:');
    console.log(`   Account: ${tokenResult.account}`);
    console.log(`   Expires: ${tokenResult.expiresOn}`);
    console.log(`   Scopes: ${Array.isArray(tokenResult.scopes) ? tokenResult.scopes.join(', ') : tokenResult.scopes}\n`);
    
    // Validate the token
    console.log('🔍 Validating token...');
    const validation = await validateToken(tokenResult.accessToken);
    
    if (validation.valid) {
      console.log('✅ Token is valid!');
      console.log(`   User: ${validation.user.displayName} (${validation.user.userPrincipalName})\n`);
    } else {
      console.log('❌ Token validation failed:');
      console.log(`   Error: ${validation.error}\n`);
    }
    
    // Output the token
    console.log('🎯 Bearer Token:');
    console.log('=' .repeat(80));
    console.log(tokenResult.accessToken);
    console.log('=' .repeat(80));
    
    console.log('\n📝 Usage with MCP Server:');
    console.log('curl -H "Authorization: Bearer <token>" http://localhost:3000/mcp');
    
    console.log('\n💡 Environment Variable:');
    console.log(`export BEARER_TOKEN="${tokenResult.accessToken}"`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Show usage if help is requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🚀 Microsoft Graph Bearer Token Generator

Usage: node get-bearer-token.js [method]

Methods:
  device     Interactive device code flow (default)
  client     Client credentials flow (requires CLIENT_SECRET)
  az         Use Azure CLI

Environment Variables:
  MS365_MCP_TENANT_ID      Azure tenant ID (default: common)
  MS365_MCP_CLIENT_ID      Azure application client ID
  MS365_MCP_CLIENT_SECRET  Azure application client secret (for client method)

Examples:
  node get-bearer-token.js device
  node get-bearer-token.js client
  node get-bearer-token.js az
  `);
  process.exit(0);
}

main();
