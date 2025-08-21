import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express, { Request, Response } from 'express';
import logger, { enableConsoleLogging } from './logger.js';
import { registerGraphTools } from './graph-tools.js';
import GraphClient from './graph-client.js';
import {
  microsoftBearerTokenAuthMiddleware,
} from './lib/microsoft-auth.js';
import type { CommandOptions } from './cli.ts';

class MicrosoftGraphServer {
  private options: CommandOptions;
  private graphClient: GraphClient;
  private server: McpServer | null;

  constructor(options: CommandOptions = {}) {
    this.options = options;
    this.graphClient = new GraphClient();
    this.server = null;
  }

  async initialize(version: string): Promise<void> {
    this.server = new McpServer({
      name: 'Microsoft365MCP',
      version,
    });

    // Only register Graph tools (no auth tools)
    registerGraphTools(
      this.server,
      this.graphClient,
      this.options.readOnly,
      this.options.enabledTools,
      this.options.orgMode
    );
  }

  async start(): Promise<void> {
    if (this.options.v) {
      enableConsoleLogging();
    }

    logger.info('Microsoft 365 MCP Server starting...');

    if (this.options.readOnly) {
      logger.info('Server running in READ-ONLY mode. Write operations are disabled.');
    }

    // Always run in HTTP mode with Bearer token authentication
    const port = typeof this.options.http === 'string' ? parseInt(this.options.http) : 3000;

    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Add CORS headers for all routes
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, mcp-protocol-version'
      );

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
      }

      next();
    });

    // Microsoft Graph MCP endpoints with bearer token auth
    // Handle both GET and POST methods as required by MCP Streamable HTTP specification
    app.get(
      '/mcp',
      microsoftBearerTokenAuthMiddleware,
      async (
        req: Request & { microsoftAuth?: { accessToken: string; refreshToken: string } },
        res: Response
      ) => {
        try {
          // Set OAuth tokens in the GraphClient if available
          if (req.microsoftAuth) {
            this.graphClient.setOAuthTokens(
              req.microsoftAuth.accessToken,
              req.microsoftAuth.refreshToken
            );
          }

          const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined, // Stateless mode
          });

          res.on('close', () => {
            transport.close();
          });

          await this.server!.connect(transport);
          await transport.handleRequest(req, res, undefined);
        } catch (error) {
          logger.error('Error handling MCP GET request:', error);
          if (!res.headersSent) {
            res.status(500).json({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: 'Internal server error',
              },
              id: null,
            });
          }
        }
      }
    );

    app.post(
      '/mcp',
      microsoftBearerTokenAuthMiddleware,
      async (
        req: Request & { microsoftAuth?: { accessToken: string; refreshToken: string } },
        res: Response
      ) => {
        try {
          // Set OAuth tokens in the GraphClient if available
          if (req.microsoftAuth) {
            this.graphClient.setOAuthTokens(
              req.microsoftAuth.accessToken,
              req.microsoftAuth.refreshToken
            );
          }

          const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined, // Stateless mode
          });

          res.on('close', () => {
            transport.close();
          });

          await this.server!.connect(transport);
          await transport.handleRequest(req, res, req.body);
        } catch (error) {
          logger.error('Error handling MCP POST request:', error);
          if (!res.headersSent) {
            res.status(500).json({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: 'Internal server error',
              },
              id: null,
            });
          }
        }
      }
    );

    // Health check endpoint
    app.get('/', (req, res) => {
      res.send('Microsoft 365 MCP Server is running');
    });

    app.listen(port, () => {
      logger.info(`Server listening on HTTP port ${port}`);
      logger.info(`  - MCP endpoint: http://localhost:${port}/mcp`);
      logger.info('  - Send requests with Authorization: Bearer <your-microsoft-access-token>');
    });
  }
}

export default MicrosoftGraphServer;
