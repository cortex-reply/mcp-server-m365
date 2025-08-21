# Microsoft 365 MCP Server - Complete API Reference

This document provides the correct MCP API calls for all available tools in the Microsoft 365 MCP Server.

## Prerequisites

1. **Server running**: `npm start` (starts on http://localhost:3000)
2. **Bearer token**: Use `npm run get-token` to obtain a Microsoft Graph access token
3. **Required headers** for all MCP requests:
   ```
   Content-Type: application/json
   Accept: application/json, text/event-stream
   Authorization: Bearer <your-microsoft-access-token>
   ```

## Core MCP Methods

### Initialize Session
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
      "name": "api-client",
      "version": "1.0.0"
    }
  },
  "id": 1
}
```

### List All Available Tools
```json
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": 2
}
```

## Personal Account Tools (Available by default)

### Email (Outlook)

#### List Mail Messages
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-mail-messages",
    "arguments": {
      "top": 10,
      "select": ["subject", "from", "receivedDateTime", "bodyPreview"],
      "filter": "isRead eq false",
      "fetchAllPages": false
    }
  },
  "id": 10
}
```

#### Get Specific Mail Message
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-mail-message",
    "arguments": {
      "message-id": "message-id-here",
      "select": ["subject", "body", "from", "toRecipients"]
    }
  },
  "id": 11
}
```

#### Send Mail
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "send-mail",
    "arguments": {
      "body": {
        "message": {
          "subject": "Test Subject",
          "body": {
            "contentType": "Text",
            "content": "Hello from MCP!"
          },
          "toRecipients": [
            {
              "emailAddress": {
                "address": "recipient@example.com"
              }
            }
          ]
        }
      }
    }
  },
  "id": 12
}
```

#### List Mail Folders
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-mail-folders",
    "arguments": {
      "top": 20
    }
  },
  "id": 13
}
```

#### List Messages in Specific Folder
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-mail-folder-messages",
    "arguments": {
      "mailFolder-id": "inbox",
      "top": 10,
      "select": ["subject", "from", "receivedDateTime"]
    }
  },
  "id": 14
}
```

#### Create Draft Email
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "create-draft-email",
    "arguments": {
      "body": {
        "subject": "Draft Subject",
        "body": {
          "contentType": "HTML",
          "content": "<p>Draft content</p>"
        }
      }
    }
  },
  "id": 15
}
```

#### Delete Mail Message
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "delete-mail-message",
    "arguments": {
      "message-id": "message-id-here"
    }
  },
  "id": 16
}
```

#### Move Mail Message
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "move-mail-message",
    "arguments": {
      "message-id": "message-id-here",
      "body": {
        "destinationId": "folder-id-here"
      }
    }
  },
  "id": 17
}
```

### Calendar Operations

#### List Calendars
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-calendars",
    "arguments": {
      "select": ["name", "id", "canEdit"]
    }
  },
  "id": 20
}
```

#### List Calendar Events
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-calendar-events",
    "arguments": {
      "top": 10,
      "select": ["subject", "start", "end", "location"],
      "orderby": "start/dateTime"
    }
  },
  "id": 21
}
```

#### Get Calendar Event
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-calendar-event",
    "arguments": {
      "event-id": "event-id-here",
      "select": ["subject", "body", "start", "end", "attendees"]
    }
  },
  "id": 22
}
```

#### Create Calendar Event
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "create-calendar-event",
    "arguments": {
      "body": {
        "subject": "Meeting Title",
        "body": {
          "contentType": "HTML",
          "content": "Meeting description"
        },
        "start": {
          "dateTime": "2024-08-22T14:00:00",
          "timeZone": "UTC"
        },
        "end": {
          "dateTime": "2024-08-22T15:00:00",
          "timeZone": "UTC"
        },
        "attendees": [
          {
            "emailAddress": {
              "address": "attendee@example.com",
              "name": "Attendee Name"
            }
          }
        ]
      }
    }
  },
  "id": 23
}
```

#### Update Calendar Event
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "update-calendar-event",
    "arguments": {
      "event-id": "event-id-here",
      "body": {
        "subject": "Updated Meeting Title"
      }
    }
  },
  "id": 24
}
```

#### Delete Calendar Event
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "delete-calendar-event",
    "arguments": {
      "event-id": "event-id-here"
    }
  },
  "id": 25
}
```

#### Get Calendar View
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-calendar-view",
    "arguments": {
      "startDateTime": "2024-08-22T00:00:00Z",
      "endDateTime": "2024-08-29T00:00:00Z",
      "select": ["subject", "start", "end"]
    }
  },
  "id": 26
}
```

### OneDrive Files

#### List Drives
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-drives",
    "arguments": {
      "select": ["name", "id", "driveType"]
    }
  },
  "id": 30
}
```

#### Get Drive Root Item
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-drive-root-item",
    "arguments": {
      "select": ["name", "size", "folder"]
    }
  },
  "id": 31
}
```

#### List Folder Files
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-folder-files",
    "arguments": {
      "driveItem-id": "folder-id-here",
      "top": 20,
      "select": ["name", "size", "file", "folder"]
    }
  },
  "id": 32
}
```

#### Download File Content
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "download-onedrive-file-content",
    "arguments": {
      "driveItem-id": "file-id-here"
    }
  },
  "id": 33
}
```

#### Upload File Content
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "upload-file-content",
    "arguments": {
      "driveItem-id": "file-id-here",
      "body": "base64-encoded-content"
    }
  },
  "id": 34
}
```

#### Delete OneDrive File
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "delete-onedrive-file",
    "arguments": {
      "driveItem-id": "file-id-here"
    }
  },
  "id": 35
}
```

### Excel Operations

#### List Excel Worksheets
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-excel-worksheets",
    "arguments": {
      "driveItem-id": "excel-file-id-here"
    }
  },
  "id": 40
}
```

#### Get Excel Range
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-excel-range",
    "arguments": {
      "driveItem-id": "excel-file-id-here",
      "worksheet-id": "Sheet1",
      "range-id": "A1:C10"
    }
  },
  "id": 41
}
```

#### Create Excel Chart
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "create-excel-chart",
    "arguments": {
      "driveItem-id": "excel-file-id-here",
      "worksheet-id": "Sheet1",
      "body": {
        "type": "ColumnClustered",
        "sourceData": "A1:B10",
        "seriesBy": "Auto"
      }
    }
  },
  "id": 42
}
```

#### Format Excel Range
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "format-excel-range",
    "arguments": {
      "driveItem-id": "excel-file-id-here",
      "worksheet-id": "Sheet1",
      "range-id": "A1:C10",
      "body": {
        "font": {
          "bold": true,
          "color": "red"
        }
      }
    }
  },
  "id": 43
}
```

#### Sort Excel Range
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "sort-excel-range",
    "arguments": {
      "driveItem-id": "excel-file-id-here",
      "worksheet-id": "Sheet1",
      "range-id": "A1:C10",
      "body": {
        "fields": [
          {
            "key": 0,
            "ascending": true
          }
        ]
      }
    }
  },
  "id": 44
}
```

### OneNote

#### List OneNote Notebooks
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-onenote-notebooks",
    "arguments": {
      "select": ["displayName", "id"]
    }
  },
  "id": 50
}
```

#### List Notebook Sections
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-onenote-notebook-sections",
    "arguments": {
      "notebook-id": "notebook-id-here",
      "select": ["displayName", "id"]
    }
  },
  "id": 51
}
```

#### List Section Pages
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-onenote-section-pages",
    "arguments": {
      "section-id": "section-id-here",
      "select": ["title", "id"]
    }
  },
  "id": 52
}
```

#### Get Page Content
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-onenote-page-content",
    "arguments": {
      "page-id": "page-id-here"
    }
  },
  "id": 53
}
```

#### Create OneNote Page
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "create-onenote-page",
    "arguments": {
      "section-id": "section-id-here",
      "body": "<!DOCTYPE html><html><head><title>Page Title</title></head><body><p>Page content</p></body></html>"
    }
  },
  "id": 54
}
```

### To Do Tasks

#### List Task Lists
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-todo-task-lists",
    "arguments": {
      "select": ["displayName", "id"]
    }
  },
  "id": 60
}
```

#### List Tasks
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-todo-tasks",
    "arguments": {
      "todoTaskList-id": "task-list-id-here",
      "select": ["title", "status", "dueDateTime"]
    }
  },
  "id": 61
}
```

#### Get Task
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-todo-task",
    "arguments": {
      "todoTaskList-id": "task-list-id-here",
      "todoTask-id": "task-id-here"
    }
  },
  "id": 62
}
```

#### Create Task
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "create-todo-task",
    "arguments": {
      "todoTaskList-id": "task-list-id-here",
      "body": {
        "title": "New Task",
        "body": {
          "content": "Task description",
          "contentType": "text"
        }
      }
    }
  },
  "id": 63
}
```

#### Update Task
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "update-todo-task",
    "arguments": {
      "todoTaskList-id": "task-list-id-here",
      "todoTask-id": "task-id-here",
      "body": {
        "status": "completed"
      }
    }
  },
  "id": 64
}
```

#### Delete Task
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "delete-todo-task",
    "arguments": {
      "todoTaskList-id": "task-list-id-here",
      "todoTask-id": "task-id-here"
    }
  },
  "id": 65
}
```

### Planner

#### List Planner Tasks
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-planner-tasks",
    "arguments": {
      "select": ["title", "percentComplete", "dueDateTime"]
    }
  },
  "id": 70
}
```

#### Get Planner Plan
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-planner-plan",
    "arguments": {
      "plannerPlan-id": "plan-id-here",
      "select": ["title", "id"]
    }
  },
  "id": 71
}
```

#### List Plan Tasks
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-plan-tasks",
    "arguments": {
      "plannerPlan-id": "plan-id-here",
      "select": ["title", "percentComplete"]
    }
  },
  "id": 72
}
```

#### Get Planner Task
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-planner-task",
    "arguments": {
      "plannerTask-id": "task-id-here",
      "select": ["title", "percentComplete", "bucketId"]
    }
  },
  "id": 73
}
```

#### Create Planner Task
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "create-planner-task",
    "arguments": {
      "body": {
        "planId": "plan-id-here",
        "title": "New Planner Task",
        "bucketId": "bucket-id-here"
      }
    }
  },
  "id": 74
}
```

#### Update Planner Task
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "update-planner-task",
    "arguments": {
      "plannerTask-id": "task-id-here",
      "body": {
        "title": "Updated Task Title",
        "percentComplete": 50
      }
    }
  },
  "id": 75
}
```

### Contacts

#### List Outlook Contacts
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-outlook-contacts",
    "arguments": {
      "top": 20,
      "select": ["displayName", "emailAddresses"]
    }
  },
  "id": 80
}
```

#### Get Outlook Contact
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-outlook-contact",
    "arguments": {
      "contact-id": "contact-id-here",
      "select": ["displayName", "emailAddresses", "businessPhones"]
    }
  },
  "id": 81
}
```

#### Create Outlook Contact
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "create-outlook-contact",
    "arguments": {
      "body": {
        "displayName": "John Doe",
        "emailAddresses": [
          {
            "address": "john@example.com",
            "name": "John Doe"
          }
        ],
        "businessPhones": ["+1-555-0123"]
      }
    }
  },
  "id": 82
}
```

#### Update Outlook Contact
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "update-outlook-contact",
    "arguments": {
      "contact-id": "contact-id-here",
      "body": {
        "jobTitle": "Software Engineer"
      }
    }
  },
  "id": 83
}
```

#### Delete Outlook Contact
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "delete-outlook-contact",
    "arguments": {
      "contact-id": "contact-id-here"
    }
  },
  "id": 84
}
```

### User Profile

#### Get Current User
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-current-user",
    "arguments": {
      "select": ["displayName", "mail", "userPrincipalName"]
    }
  },
  "id": 90
}
```

### Search

#### Search Query
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "search-query",
    "arguments": {
      "body": {
        "requests": [
          {
            "entityTypes": ["message"],
            "query": {
              "queryString": "test"
            }
          }
        ]
      }
    }
  },
  "id": 95
}
```

## Organization Account Tools (Requires --org-mode flag)

### Teams & Chats

#### List Chats
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-chats",
    "arguments": {
      "top": 20,
      "select": ["topic", "lastUpdatedDateTime"]
    }
  },
  "id": 100
}
```

#### Get Chat
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-chat",
    "arguments": {
      "chatId": "chat-id-here",
      "select": ["topic", "members"]
    }
  },
  "id": 101
}
```

#### List Chat Messages
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-chat-messages",
    "arguments": {
      "chatId": "chat-id-here",
      "top": 10,
      "select": ["body", "from", "createdDateTime"]
    }
  },
  "id": 102
}
```

#### Get Chat Message
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-chat-message",
    "arguments": {
      "chatId": "chat-id-here",
      "chatMessage-id": "message-id-here"
    }
  },
  "id": 103
}
```

#### Send Chat Message
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "send-chat-message",
    "arguments": {
      "chatId": "chat-id-here",
      "body": {
        "body": {
          "content": "Hello from MCP!"
        }
      }
    }
  },
  "id": 104
}
```

#### List Chat Message Replies
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-chat-message-replies",
    "arguments": {
      "chatId": "chat-id-here",
      "chatMessage-id": "message-id-here",
      "top": 10
    }
  },
  "id": 105
}
```

#### Reply to Chat Message
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "reply-to-chat-message",
    "arguments": {
      "chatId": "chat-id-here",
      "chatMessage-id": "message-id-here",
      "body": {
        "body": {
          "content": "This is a reply"
        }
      }
    }
  },
  "id": 106
}
```

#### List Joined Teams
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-joined-teams",
    "arguments": {
      "select": ["displayName", "description"]
    }
  },
  "id": 110
}
```

#### Get Team
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-team",
    "arguments": {
      "team-id": "team-id-here",
      "select": ["displayName", "description"]
    }
  },
  "id": 111
}
```

#### List Team Channels
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-team-channels",
    "arguments": {
      "team-id": "team-id-here",
      "select": ["displayName", "description"]
    }
  },
  "id": 112
}
```

#### Get Team Channel
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-team-channel",
    "arguments": {
      "team-id": "team-id-here",
      "channel-id": "channel-id-here"
    }
  },
  "id": 113
}
```

#### List Channel Messages
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-channel-messages",
    "arguments": {
      "team-id": "team-id-here",
      "channel-id": "channel-id-here",
      "top": 10
    }
  },
  "id": 114
}
```

#### Send Channel Message
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "send-channel-message",
    "arguments": {
      "team-id": "team-id-here",
      "channel-id": "channel-id-here",
      "body": {
        "body": {
          "content": "Hello team!"
        }
      }
    }
  },
  "id": 115
}
```

#### Get Channel Message
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-channel-message",
    "arguments": {
      "team-id": "team-id-here",
      "channel-id": "channel-id-here",
      "chatMessage-id": "message-id-here"
    }
  },
  "id": 116
}
```

#### List Team Members
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-team-members",
    "arguments": {
      "team-id": "team-id-here",
      "select": ["displayName", "email"]
    }
  },
  "id": 117
}
```

### SharePoint Sites

#### Search SharePoint Sites
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "search-sharepoint-sites",
    "arguments": {
      "search": "project"
    }
  },
  "id": 120
}
```

#### Get SharePoint Site
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-sharepoint-site",
    "arguments": {
      "site-id": "site-id-here",
      "select": ["displayName", "webUrl"]
    }
  },
  "id": 121
}
```

#### Get SharePoint Site by Path
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-sharepoint-site-by-path",
    "arguments": {
      "hostname": "contoso.sharepoint.com",
      "server-relative-path": "/sites/teamsite"
    }
  },
  "id": 122
}
```

#### List SharePoint Site Drives
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-sharepoint-site-drives",
    "arguments": {
      "site-id": "site-id-here"
    }
  },
  "id": 123
}
```

#### Get SharePoint Site Drive
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-sharepoint-site-drive-by-id",
    "arguments": {
      "site-id": "site-id-here",
      "drive-id": "drive-id-here"
    }
  },
  "id": 124
}
```

#### List SharePoint Site Items
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-sharepoint-site-items",
    "arguments": {
      "site-id": "site-id-here",
      "drive-id": "drive-id-here"
    }
  },
  "id": 125
}
```

#### Get SharePoint Site Item
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-sharepoint-site-item",
    "arguments": {
      "site-id": "site-id-here",
      "drive-id": "drive-id-here",
      "driveItem-id": "item-id-here"
    }
  },
  "id": 126
}
```

#### List SharePoint Site Lists
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-sharepoint-site-lists",
    "arguments": {
      "site-id": "site-id-here",
      "select": ["displayName", "id"]
    }
  },
  "id": 127
}
```

#### Get SharePoint Site List
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-sharepoint-site-list",
    "arguments": {
      "site-id": "site-id-here",
      "list-id": "list-id-here"
    }
  },
  "id": 128
}
```

#### List SharePoint Site List Items
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-sharepoint-site-list-items",
    "arguments": {
      "site-id": "site-id-here",
      "list-id": "list-id-here",
      "expand": ["fields"]
    }
  },
  "id": 129
}
```

#### Get SharePoint Site List Item
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-sharepoint-site-list-item",
    "arguments": {
      "site-id": "site-id-here",
      "list-id": "list-id-here",
      "listItem-id": "item-id-here",
      "expand": ["fields"]
    }
  },
  "id": 130
}
```

#### Get SharePoint Sites Delta
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-sharepoint-sites-delta",
    "arguments": {
      "select": ["displayName", "lastModifiedDateTime"]
    }
  },
  "id": 131
}
```

### Shared Mailboxes

#### List Shared Mailbox Messages
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-shared-mailbox-messages",
    "arguments": {
      "user-id": "shared-mailbox@company.com",
      "top": 10,
      "select": ["subject", "from", "receivedDateTime"]
    }
  },
  "id": 140
}
```

#### List Shared Mailbox Folder Messages
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-shared-mailbox-folder-messages",
    "arguments": {
      "user-id": "shared-mailbox@company.com",
      "mailFolder-id": "inbox",
      "top": 10
    }
  },
  "id": 141
}
```

#### Get Shared Mailbox Message
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get-shared-mailbox-message",
    "arguments": {
      "user-id": "shared-mailbox@company.com",
      "message-id": "message-id-here",
      "select": ["subject", "body", "from"]
    }
  },
  "id": 142
}
```

#### Send Shared Mailbox Mail
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "send-shared-mailbox-mail",
    "arguments": {
      "user-id": "shared-mailbox@company.com",
      "body": {
        "message": {
          "subject": "From Shared Mailbox",
          "body": {
            "contentType": "Text",
            "content": "Message from shared mailbox"
          },
          "toRecipients": [
            {
              "emailAddress": {
                "address": "recipient@example.com"
              }
            }
          ]
        }
      }
    }
  },
  "id": 143
}
```

### User Management

#### List Users
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "list-users",
    "arguments": {
      "top": 20,
      "select": ["displayName", "mail", "userType"],
      "filter": "userType eq 'Member'"
    }
  },
  "id": 150
}
```

## Common Parameters

### OData Query Parameters
- `top`: Limit number of results (e.g., `"top": 10`)
- `skip`: Skip first n items (e.g., `"skip": 20`)
- `select`: Choose specific fields (e.g., `"select": ["displayName", "mail"]`)
- `filter`: Filter results (e.g., `"filter": "startswith(displayName,'John')"`)
- `orderby`: Sort results (e.g., `"orderby": "displayName asc"`)
- `search`: Search query (e.g., `"search": "john"`)
- `expand`: Include related data (e.g., `"expand": ["members"]`)

### Pagination Control
- `fetchAllPages`: Boolean to automatically fetch all pages (e.g., `"fetchAllPages": true`)

## Error Handling

Common error responses:
- **401 Unauthorized**: Invalid or expired bearer token
- **403 Forbidden**: Insufficient permissions for organization features
- **404 Not Found**: Resource doesn't exist
- **429 Too Many Requests**: Rate limit exceeded

## Token Scopes Required

Different tools require different Microsoft Graph scopes:

**Core Scopes:**
- `User.Read` - User profile information
- `Mail.ReadWrite` - Email operations
- `Calendars.ReadWrite` - Calendar operations
- `Files.ReadWrite` - OneDrive operations

**Organization Scopes:**
- `Sites.ReadWrite.All` - SharePoint operations
- `Team.ReadBasic.All` - Teams operations
- `Directory.Read.All` - Organization directory
- `Group.Read.All` - Group operations
- `Mail.Read.Shared` - Shared mailbox access

## Tips

1. **Use `select` parameter** to reduce response size and improve performance
2. **Enable `fetchAllPages`** for complete data sets
3. **Check token scopes** if you get 403 errors on organization tools
4. **Use organization mode** (`--org-mode`) for work/school features
5. **Test with small `top` values** first to avoid large responses
