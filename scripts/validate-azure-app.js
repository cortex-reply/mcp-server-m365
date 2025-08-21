#!/usr/bin/env node

/**
 * Azure AD App Registration Validator
 * 
 * This script helps validate your Azure AD app registration configuration
 * and provides specific guidance for fixing common issues.
 */

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

const CLIENT_ID = process.env.MS365_MCP_CLIENT_ID;
const TENANT_ID = process.env.MS365_MCP_TENANT_ID || 'common';

async function validateAppRegistration() {
  console.log('🔍 Azure AD App Registration Validator');
  console.log('=====================================\n');

  // Step 1: Check environment variables
  console.log('📋 Step 1: Environment Variables Check');
  console.log('------------------------------------');
  
  if (!CLIENT_ID) {
    console.log('❌ MS365_MCP_CLIENT_ID is not set');
    console.log('   Please set this environment variable to your Azure AD app client ID');
    return false;
  }
  
  console.log(`✅ MS365_MCP_CLIENT_ID: ${CLIENT_ID.substring(0, 8)}...${CLIENT_ID.substring(CLIENT_ID.length - 4)}`);
  console.log(`✅ MS365_MCP_TENANT_ID: ${TENANT_ID}`);
  console.log('');

  // Step 2: Validate Client ID format
  console.log('📋 Step 2: Client ID Format Validation');
  console.log('-------------------------------------');
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(CLIENT_ID)) {
    console.log('❌ Client ID format is invalid');
    console.log('   Azure AD Client IDs should be in UUID format (e.g., 12345678-1234-1234-1234-123456789012)');
    return false;
  }
  
  console.log('✅ Client ID format is valid (UUID format)');
  console.log('');

  // Step 3: Test Azure AD endpoints accessibility
  console.log('📋 Step 3: Azure AD Endpoint Accessibility');
  console.log('----------------------------------------');
  
  try {
    const wellKnownUrl = `https://login.microsoftonline.com/${TENANT_ID}/v2.0/.well-known/openid_configuration`;
    console.log(`   Testing: ${wellKnownUrl}`);
    
    const response = await fetch(wellKnownUrl);
    
    if (response.ok) {
      const config = await response.json();
      console.log('✅ Azure AD endpoint is accessible');
      console.log(`   Issuer: ${config.issuer}`);
      console.log(`   Authorization endpoint: ${config.authorization_endpoint}`);
      console.log(`   Token endpoint: ${config.token_endpoint}`);
    } else {
      console.log(`❌ Azure AD endpoint returned HTTP ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Failed to reach Azure AD endpoint: ${error.message}`);
    return false;
  }
  
  console.log('');

  // Step 4: Test app registration existence
  console.log('📋 Step 4: App Registration Validation');
  console.log('------------------------------------');
  
  try {
    // Try to get app registration info from Microsoft Graph
    const graphUrl = `https://graph.microsoft.com/v1.0/applications?$filter=appId eq '${CLIENT_ID}'`;
    console.log('   Attempting to validate app registration...');
    console.log('   (This may fail if you don\'t have admin permissions, which is normal)');
    
    // This is just a test to see if we get a proper error response
    const response = await fetch(graphUrl);
    
    if (response.status === 401) {
      console.log('⚠️  Cannot validate app registration (authentication required)');
      console.log('   This is normal - we cannot check without authentication');
    } else if (response.status === 403) {
      console.log('⚠️  Cannot validate app registration (insufficient permissions)');
      console.log('   This is normal - admin permissions required');
    } else {
      console.log(`   Response: HTTP ${response.status}`);
    }
  } catch (error) {
    console.log(`⚠️  Cannot validate app registration automatically: ${error.message}`);
  }
  
  console.log('');

  // Step 5: Provide configuration checklist
  console.log('📋 Step 5: Manual Configuration Checklist');
  console.log('---------------------------------------');
  console.log('Please verify the following in your Azure AD app registration:');
  console.log('');
  console.log('1. 🏢 App Registration Basics:');
  console.log('   • Go to https://portal.azure.com');
  console.log('   • Navigate to Azure Active Directory → App registrations');
  console.log(`   • Find app with Client ID: ${CLIENT_ID}`);
  console.log('   • Ensure the app exists and is not deleted');
  console.log('');
  console.log('2. 🔧 Authentication Configuration:');
  console.log('   • Go to Authentication tab in your app registration');
  console.log('   • Under "Advanced settings"');
  console.log('   • Set "Allow public client flows" to YES');
  console.log('   • This is REQUIRED for device code flow');
  console.log('');
  console.log('3. 📱 Redirect URIs:');
  console.log('   • In Authentication tab, add redirect URI:');
  console.log('   • Platform: Mobile and desktop applications');
  console.log('   • Redirect URI: https://login.microsoftonline.com/common/oauth2/nativeclient');
  console.log('');
  console.log('4. 🔑 API Permissions:');
  console.log('   • Go to API permissions tab');
  console.log('   • Ensure Microsoft Graph permissions are added:');
  console.log('     - User.Read (delegated)');
  console.log('     - Mail.ReadWrite (delegated)');
  console.log('     - Calendars.ReadWrite (delegated)');
  console.log('     - Files.ReadWrite (delegated)');
  console.log('   • Click "Grant admin consent" if available');
  console.log('');
  console.log('5. 🏗️ Supported Account Types:');
  console.log('   • In Overview tab, check "Supported account types"');
  console.log('   • For personal Microsoft accounts: "Personal Microsoft accounts only"');
  console.log('   • For work accounts: "Accounts in this organizational directory only"');
  console.log('   • For both: "Accounts in any organizational directory and personal Microsoft accounts"');
  console.log('');

  return true;
}

async function main() {
  const isValid = await validateAppRegistration();
  
  if (isValid) {
    console.log('✅ Basic validation passed! Try running the token script again.');
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   npm run get-token device');
    console.log('   # or');
    console.log('   node scripts/get-bearer-token.js device');
  } else {
    console.log('❌ Validation failed. Please fix the issues above and try again.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Validation script error:', error.message);
  process.exit(1);
});
