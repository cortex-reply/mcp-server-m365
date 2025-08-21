# Authentication Guide

Complete guide to setting up Azure AD authentication and obtaining Microsoft Graph access tokens.

## 🎯 Overview

The Microsoft 365 MCP Server uses **Bearer token authentication** with Microsoft Graph. You need:

1. **Azure AD App Registration** - Registered application in Azure Active Directory
2. **Access Token** - Microsoft Graph access token with appropriate scopes
3. **Proper Configuration** - Environment variables and redirect URIs

## 🏗️ Azure AD App Registration Setup

### Step 1: Create App Registration

1. **Navigate to Azure Portal**
   - Go to [https://portal.azure.com](https://portal.azure.com)
   - Sign in with your Microsoft account

2. **Access Azure Active Directory**
   - Search for "Azure Active Directory" or find it in the left sidebar
   - Click on "App registrations"

3. **Create New Registration**
   - Click "New registration"
   - Fill in the details:
     - **Name**: "MS365 MCP Server" (or any descriptive name)
     - **Supported account types**: Choose based on your needs:
       - **Single tenant**: Only your organization (most secure)
       - **Multitenant**: Any organizational directory
       - **Personal + Work**: Any Microsoft account (most flexible)
   - **Redirect URI**: Leave blank for now (we'll add it later)
   - Click "Register"

4. **Copy Application ID**
   - From the "Overview" page, copy the **Application (client) ID**
   - This is your `MS365_MCP_CLIENT_ID`

### Step 2: Configure Authentication

1. **Navigate to Authentication**
   - In your app registration, click "Authentication" in the left sidebar

2. **Add Platform**
   - Click "+ Add a platform"
   - Select "Mobile and desktop applications"

3. **Configure Redirect URI**
   - Add this exact redirect URI: `https://login.microsoftonline.com/common/oauth2/nativeclient`
   - This enables the device code flow for token generation

4. **Enable Public Client Flow**
   - Scroll down to "Advanced settings"
   - Set "Allow public client flows" to **Yes**
   - Click "Save"

### Step 3: Configure API Permissions

1. **Navigate to API Permissions**
   - Click "API permissions" in the left sidebar

2. **Add Microsoft Graph Permissions**
   - Click "+ Add a permission"
   - Select "Microsoft Graph"
   - Choose "Delegated permissions"

3. **Required Scopes**
   
   **Basic Scopes (Always Required):**
   - `User.Read` - Read basic user profile

   **Feature-Specific Scopes:**
   - `Mail.ReadWrite` - Email operations (read, send, delete)
   - `Calendars.ReadWrite` - Calendar operations
   - `Files.ReadWrite` - OneDrive file operations
   - `Tasks.ReadWrite` - To-Do task operations
   - `Notes.ReadWrite` - OneNote operations

   **Organization Scopes (Optional - for full org features):**
   - `Sites.ReadWrite.All` - SharePoint operations
   - `Team.ReadBasic.All` - Teams information
   - `Directory.Read.All` - Organization directory
   - `Group.Read.All` - Group operations

4. **Grant Admin Consent** (if required)
   - If you're in an organization, click "Grant admin consent for [Organization]"
   - Individual users can consent to their own permissions

## 🔐 Token Generation Methods

### Method 1: Using Provided Scripts (Recommended)

The project includes helper scripts to obtain tokens:

```bash
# JavaScript version (works on all platforms)
npm run get-token
# OR
node scripts/get-bearer-token.js

# Shell version (Linux/macOS/WSL)
chmod +x scripts/get-bearer-token.sh
./scripts/get-bearer-token.sh
```

**What the script does:**
1. Validates your Azure AD app configuration
2. Initiates device code authentication flow
3. Provides a device code and URL for browser authentication
4. Returns a valid access token
5. Shows token expiration and renewal instructions

### Method 2: Azure CLI

If you have Azure CLI installed:

```bash
# Login to Azure
az login

# Get access token for Microsoft Graph
az account get-access-token --resource https://graph.microsoft.com/

# Extract just the token
az account get-access-token --resource https://graph.microsoft.com/ --query accessToken -o tsv
```

### Method 3: Microsoft Graph Explorer

For testing and development:

1. Go to [Microsoft Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)
2. Sign in with your Microsoft account
3. Click on your profile in the top right
4. Select "Access token"
5. Copy the token value

### Method 4: PowerShell (Windows)

```powershell
# Install Microsoft Graph PowerShell module
Install-Module Microsoft.Graph -Scope CurrentUser

# Connect and get token
Connect-MgGraph -Scopes "User.Read", "Mail.ReadWrite", "Calendars.ReadWrite"
$token = [Microsoft.Graph.Authentication.GraphSession]::Instance.AuthContext.TokenCache.ReadItems() | Select-Object -First 1
$token.AccessToken
```

### Method 5: Custom Implementation

For production applications, implement OAuth 2.0 flow:

```javascript
// Example using MSAL.js
import { PublicClientApplication } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: 'your-client-id',
    authority: 'https://login.microsoftonline.com/common'
  }
};

const pca = new PublicClientApplication(msalConfig);

const loginRequest = {
  scopes: ['User.Read', 'Mail.ReadWrite', 'Calendars.ReadWrite']
};

try {
  const response = await pca.loginPopup(loginRequest);
  console.log('Access Token:', response.accessToken);
} catch (error) {
  console.error('Login failed:', error);
}
```

## ⚙️ Environment Configuration

### Setting Environment Variables

Create or update your `.env` file:

```bash
# REQUIRED: Your Azure AD App Registration Client ID
MS365_MCP_CLIENT_ID=12345678-1234-1234-1234-123456789abc

# OPTIONAL: Tenant ID (default: "common")
MS365_MCP_TENANT_ID=common

# OPTIONAL: Client Secret (for server-to-server auth)
MS365_MCP_CLIENT_SECRET=your-client-secret-if-needed
```

### Tenant Configuration Options

```bash
# For any Microsoft account (personal + work/school)
MS365_MCP_TENANT_ID=common

# For any organizational directory only
MS365_MCP_TENANT_ID=organizations

# For personal Microsoft accounts only
MS365_MCP_TENANT_ID=consumers

# For specific organization only
MS365_MCP_TENANT_ID=your-tenant-id-here
```

## 🧪 Testing Authentication

### Test Your Azure App Configuration

```bash
# Validate Azure AD app setup
node scripts/validate-azure-app.js
```

### Test Token Generation

```bash
# Generate and test a token
npm run get-token

# Use the token to test the server
export BEARER_TOKEN="your-token-here"
npm run test:mcp
```

### Manual Token Verification

```bash
# Test your token manually
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     https://graph.microsoft.com/v1.0/me

# Should return your user profile information
```

## 🔍 Token Scopes and Permissions

### Understanding Scopes

Scopes determine what your application can access:

| Scope | Purpose | Required For |
|-------|---------|--------------|
| `User.Read` | Basic profile info | All operations |
| `Mail.Read` | Read emails | Email listing/reading |
| `Mail.ReadWrite` | Full email access | Email operations |
| `Mail.Send` | Send emails | Sending emails |
| `Calendars.Read` | Read calendars | Calendar viewing |
| `Calendars.ReadWrite` | Full calendar access | Calendar operations |
| `Files.Read` | Read OneDrive files | File listing/download |
| `Files.ReadWrite` | Full file access | File operations |
| `Tasks.ReadWrite` | To-Do tasks | Task management |
| `Notes.ReadWrite` | OneNote access | Note operations |

### Organizational Scopes

For enterprise features, additional scopes may be needed:

| Scope | Purpose | Admin Consent |
|-------|---------|---------------|
| `Sites.ReadWrite.All` | SharePoint access | Required |
| `Team.ReadBasic.All` | Teams information | Required |
| `Directory.Read.All` | User directory | Required |
| `Group.Read.All` | Group information | Required |

## 🚨 Troubleshooting

### Common Authentication Issues

#### 1. "Application Not Found"
**Problem**: `AADSTS700016: Application with identifier 'xxx' was not found`

**Solution**:
- Verify the client ID in your `.env` file
- Ensure the app registration exists in the correct tenant
- Check that you're using the Application (client) ID, not the Object ID

#### 2. "Invalid Redirect URI"
**Problem**: `AADSTS50011: Reply URL 'xxx' does not match`

**Solution**:
- Add the exact redirect URI: `https://login.microsoftonline.com/common/oauth2/nativeclient`
- Ensure "Allow public client flows" is enabled
- Use the correct platform type (Mobile and desktop applications)

#### 3. "Insufficient Privileges"
**Problem**: `Insufficient privileges to complete the operation`

**Solution**:
- Add the required scopes to your app registration
- Grant admin consent if required by your organization
- Ensure the user has the necessary permissions

#### 4. "Token Expired"
**Problem**: `401 Unauthorized` or token validation errors

**Solution**:
- Generate a new token using `npm run get-token`
- Tokens typically expire after 1 hour
- Implement token refresh for production applications

#### 5. "Consent Required"
**Problem**: `AADSTS65001: The user or administrator has not consented`

**Solution**:
- Complete the consent flow when generating tokens
- Add permissions to your app registration
- Ask your admin to grant organization-wide consent

### Debugging Tips

1. **Enable Verbose Logging**
   ```bash
   npm start -- -v
   ```

2. **Check Token Claims**
   ```bash
   # Decode your JWT token at https://jwt.io
   # Or use a tool like jq:
   echo "YOUR_TOKEN" | base64 -d | jq .
   ```

3. **Test with Graph Explorer**
   - Use [Microsoft Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer) to test API calls
   - Compare working requests with your implementation

4. **Validate Configuration**
   ```bash
   node scripts/validate-azure-app.js
   ```

## 🔒 Security Best Practices

### Token Security

1. **Never Log Tokens**
   ```bash
   # Bad: Don't do this
   console.log('Token:', token);
   
   # Good: Log token presence only
   console.log('Token present:', !!token);
   ```

2. **Secure Storage**
   - Store tokens securely (encrypted storage, environment variables)
   - Never commit tokens to version control
   - Use short-lived tokens when possible

3. **Principle of Least Privilege**
   - Request only the scopes your application needs
   - Use read-only scopes when possible
   - Implement proper access controls

### App Registration Security

1. **Restrict Redirect URIs**
   - Only add necessary redirect URIs
   - Use HTTPS in production
   - Validate redirect URIs in your application

2. **Monitor App Usage**
   - Review sign-in logs in Azure AD
   - Monitor for unusual authentication patterns
   - Set up alerts for failed authentications

3. **Regular Rotation**
   - Rotate client secrets regularly (if using)
   - Update certificates before expiration
   - Review and clean up unused app registrations

## ⏭️ Next Steps

1. **Test Authentication**: Use the token generation scripts
2. **Configure Server**: Set up your environment variables
3. **Start Server**: Begin using the MCP server
4. **Explore API**: Check the [API Reference](API_REFERENCE.md)
5. **Test Integration**: Try the [Testing Guide](TESTING.md)
