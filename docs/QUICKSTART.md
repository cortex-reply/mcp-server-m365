# Quick Start Guide

Get the Microsoft 365 MCP Server running in 5 minutes.

## ⚡ Prerequisites

- Node.js >= 20
- npm or pnpm
- A Microsoft account (personal or work/school)

## 🚀 Step 1: Install and Setup

```bash
# Clone or download the project
cd mcp-server-m365

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

## 🔐 Step 2: Create Azure AD App (2 minutes)

1. **Go to Azure Portal**: [https://portal.azure.com](https://portal.azure.com)
2. **Navigate to**: Azure Active Directory → App registrations → New registration
3. **Set name**: "MS365 MCP Server"
4. **Account types**: Choose what fits your needs:
   - Single tenant (your org only)
   - Multi-tenant (any org)
   - Personal + Work accounts (any Microsoft account)
5. **Click Register**
6. **Copy the Application (client) ID** from the Overview page

## ⚙️ Step 3: Configure Authentication

1. In your app registration, go to **Authentication**
2. **Add platform** → **Mobile and desktop applications**
3. **Add redirect URI**: `https://login.microsoftonline.com/common/oauth2/nativeclient`
4. **Advanced settings** → Set **Allow public client flows** to **Yes**
5. **Save**

## 📝 Step 4: Set Environment Variables

Edit your `.env` file:

```bash
# REQUIRED: Your Azure AD App Registration Client ID
MS365_MCP_CLIENT_ID=your-client-id-here

# OPTIONAL: Tenant ID (defaults to "common")
MS365_MCP_TENANT_ID=common
```

## 🎯 Step 5: Get a Token and Start Server

```bash
# Get a Microsoft Graph access token
npm run get-token

# Start the MCP server
npm start
```

The server will start on `http://localhost:3000`

## 🧪 Step 6: Test It Works

```bash
# In another terminal, test the server
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'
```

You should see a list of available Microsoft 365 tools!

## 🎉 You're Ready!

Now you can:
- **Browse all available tools**: See [API Reference](API_REFERENCE.md)
- **Try example requests**: Check out [Testing Guide](TESTING.md)
- **Use with Postman**: Import our [Postman Collection](POSTMAN.md)
- **Customize configuration**: See [Configuration Guide](CONFIGURATION.md)

## 🆘 Need Help?

- **Token issues?** → [Authentication Guide](AUTHENTICATION.md)
- **Server not starting?** → [Troubleshooting Guide](TROUBLESHOOTING.md)
- **Want more examples?** → [Testing Guide](TESTING.md)

## ⏭️ Next Steps

1. **Explore the API**: Check out the [complete API reference](API_REFERENCE.md)
2. **Test with your data**: Try listing your emails, calendars, or OneDrive files
3. **Integrate**: Use the MCP server in your applications
4. **Customize**: Configure [read-only mode or tool filtering](CONFIGURATION.md)

---

**Need more detailed setup?** See the [complete Setup Guide](SETUP.md).
