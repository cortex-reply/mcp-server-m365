# ms-365-mcp-server

[![npm version](https://img.shields.io/npm/v/@softeria/ms-365-mcp-server.svg)](https://www.npmjs.com/package/@softeria/ms-365-mcp-server) [![build status](https://github.com/softeria/ms-365-mcp-server/actions/workflows/build.yml/badge.svg)](https://github.com/softeria/ms-365-mcp-server/actions/workflows/build.yml) [![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/softeria/ms-365-mcp-server/blob/main/LICENSE)

Microsoft 365 MCP Server

A Model Context Protocol (MCP) server for interacting with Microsoft 365 and Microsoft Office services through the Graph
API using Bearer token authentication.

## Prerequisites

- Node.js >= 20 (recommended)
- **Azure AD App Registration** (required)

## Setup

### 1. Create Azure AD App Registration

Before using this server, you **must** create an Azure AD app registration:

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations** → **New registration**
3. Set application name: "MS365 MCP Server"
4. Choose supported account types:
   - **Single tenant**: Only your organization
   - **Multi-tenant**: Any organization
   - **Personal + Work accounts**: Any Microsoft account
5. Click **Register**
6. Copy the **Application (client) ID** from the Overview page

### 1.1. Configure Authentication (Required for Token Generation)

If you plan to use the token generation scripts, configure authentication:

1. In your app registration, go to **Authentication**
2. Click **+ Add a platform** → **Mobile and desktop applications**
3. Add redirect URI: `https://login.microsoftonline.com/common/oauth2/nativeclient`
4. Under **Advanced settings**, set **Allow public client flows** to **Yes**
5. Click **Save**

### 2. Configure Environment Variables

Create a `.env` file in the project root and set your client ID:

```bash
# REQUIRED: Your Azure AD App Registration Client ID
MS365_MCP_CLIENT_ID=your-client-id-here

# OPTIONAL: Tenant ID (defaults to "common")
MS365_MCP_TENANT_ID=common
```

**Important**: The server will fail to start if `MS365_MCP_CLIENT_ID` is not provided.

## Features

- **Bearer Token Authentication**: Simple authentication using Microsoft Graph access tokens
- **Streamable HTTP MCP**: Runs as a web server supporting streamable MCP protocol
- **Organization Mode**: Full Microsoft 365 service integration including Teams, SharePoint, etc.
- **Read-only Mode**: Support for safe operations
- **Tool Filtering**: Granular access control for specific tools

## Authentication

This server uses Bearer token authentication. You need to provide a valid Microsoft Graph access token in the `Authorization` header:

```
Authorization: Bearer <your-microsoft-graph-access-token>
```

To obtain an access token, you can use:
- Azure CLI: `az account get-access-token --resource https://graph.microsoft.com/`
- Microsoft Graph Explorer: https://developer.microsoft.com/en-us/graph/graph-explorer
- Your own OAuth 2.0 implementation using Microsoft Identity Platform

## Supported Services & Tools

### Core Tools (Available by default)

**Email (Outlook)**  
<sub>list-mail-messages, list-mail-folders, list-mail-folder-messages, get-mail-message, send-mail,
delete-mail-message, create-draft-email, move-mail-message</sub>

**Calendar**  
<sub>list-calendars, list-calendar-events, get-calendar-event, get-calendar-view, create-calendar-event,
update-calendar-event, delete-calendar-event</sub>

**OneDrive Files**  
<sub>list-drives, get-drive-root-item, list-folder-files, download-onedrive-file-content, upload-file-content,
upload-new-file, delete-onedrive-file</sub>

**Excel Operations**  
<sub>list-excel-worksheets, get-excel-range, create-excel-chart, format-excel-range, sort-excel-range</sub>

**OneNote**  
<sub>list-onenote-notebooks, list-onenote-notebook-sections, list-onenote-section-pages, get-onenote-page-content,
create-onenote-page</sub>

**To Do Tasks**  
<sub>list-todo-task-lists, list-todo-tasks, get-todo-task, create-todo-task, update-todo-task, delete-todo-task</sub>

**Planner**  
<sub>list-planner-tasks, get-planner-plan, list-plan-tasks, get-planner-task, create-planner-task</sub>

**Contacts**  
<sub>list-outlook-contacts, get-outlook-contact, create-outlook-contact, update-outlook-contact,
delete-outlook-contact</sub>

**User Profile**  
<sub>get-current-user</sub>

**Search**  
<sub>search-query</sub>

### Organization Account Tools (Requires --org-mode flag)

**Teams & Chats**  
<sub>list-chats, get-chat, list-chat-messages, get-chat-message, send-chat-message, list-chat-message-replies,
reply-to-chat-message, list-joined-teams, get-team, list-team-channels, get-team-channel, list-channel-messages,
get-channel-message, send-channel-message, list-team-members</sub>

**SharePoint Sites**  
<sub>search-sharepoint-sites, get-sharepoint-site, get-sharepoint-site-by-path, list-sharepoint-site-drives,
get-sharepoint-site-drive-by-id, list-sharepoint-site-items, get-sharepoint-site-item, list-sharepoint-site-lists,
get-sharepoint-site-list, list-sharepoint-site-list-items, get-sharepoint-site-list-item,
get-sharepoint-sites-delta</sub>

**Shared Mailboxes**  
<sub>list-shared-mailbox-messages, list-shared-mailbox-folder-messages, get-shared-mailbox-message,
send-shared-mailbox-mail</sub>

**User Management**  
<sub>list-users</sub>

## Organization/Work Mode

Organization mode is **enabled by default**, providing access to all work/school features including Teams, SharePoint, shared mailboxes, and user management tools.

To disable organization mode, you can use:

```bash
MS365_MCP_ORG_MODE=false npx @softeria/ms-365-mcp-server --http 3000
```

Organization mode provides access to:
- Teams & Chats
- SharePoint Sites  
- Shared Mailboxes
- User Management
- Enhanced search capabilities

**Note**: Organization features require appropriate Microsoft Graph scopes in your access token.

## Shared Mailbox Access

To access shared mailboxes, you need:

1. **Organization mode**: Shared mailbox tools require `--org-mode` flag (work/school accounts only)
2. **Delegated permissions**: `Mail.Read.Shared` or `Mail.Send.Shared` scopes
3. **Exchange permissions**: The signed-in user must have been granted access to the shared mailbox
4. **Usage**: Use the shared mailbox's email address as the `user-id` parameter in the shared mailbox tools

**Finding shared mailboxes**: Use the `list-users` tool to discover available users and shared mailboxes in your
organization.

Example: `list-shared-mailbox-messages` with `user-id` set to `shared-mailbox@company.com`

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Get a Bearer Token

You can obtain a Microsoft Graph bearer token using several methods:

#### Method A: Using the built-in token generator (Interactive)
```bash
npm run get-token
```

#### Method B: Using Azure CLI
```bash
npm run get-token:cli
# OR manually:
az login
az account get-access-token --resource https://graph.microsoft.com/
```

#### Method C: Using Microsoft Graph Explorer
Visit [Microsoft Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer) and copy the access token from the request headers.

### 3. Start the Server

```bash
npm start
# Server will start on http://localhost:3000
```

### 4. Test the Server

```bash
# Set your bearer token
export BEARER_TOKEN="your-access-token-here"

# Test the MCP server
npm run test:mcp
```

## Usage

### Making MCP Requests

Send JSON-RPC requests to the `/mcp` endpoint with your bearer token:

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'
```

### Available MCP Methods

- `tools/list` - List all available tools
- `tools/call` - Execute a specific tool
- `initialize` - Initialize the MCP session

### Example Tool Calls

#### List Recent Emails
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-mail-messages",
    "arguments": {
      "top": 10
    }
  },
  "id": 1
}
```

#### List Calendars
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-calendars",
    "arguments": {}
  },
  "id": 2
}
```

#### List OneDrive Files
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-drives",
    "arguments": {}
  },
  "id": 3
}
```

## Token Requirements

Your Microsoft Graph access token needs the following scopes for full functionality:

**Core Scopes:**
- `User.Read` - Basic profile information
- `Mail.ReadWrite` - Email operations
- `Calendars.ReadWrite` - Calendar operations
- `Files.ReadWrite` - OneDrive operations

**Extended Scopes (for organization features):**
- `Sites.ReadWrite.All` - SharePoint operations
- `Team.ReadBasic.All` - Teams operations
- `Directory.Read.All` - Organization directory
- `Group.Read.All` - Group operations

## Configuration

### Environment Variables

```bash
# Optional: Customize tenant (default: common)
export MS365_MCP_TENANT_ID="your-tenant-id"

# Optional: Custom client ID (has default)
export MS365_MCP_CLIENT_ID="your-client-id"

# For client credentials flow only
export MS365_MCP_CLIENT_SECRET="your-client-secret"

# Server configuration
export READ_ONLY=true              # Enable read-only mode
export ENABLED_TOOLS="excel|mail"  # Filter tools with regex
```

### Command Line Options

```bash
# Basic usage
npm start

# Custom port
npm start -- --http 3001

# Read-only mode
npm start -- --read-only

# Verbose logging
npm start -- -v

# Tool filtering
npm start -- --enabled-tools "excel|calendar"
```
