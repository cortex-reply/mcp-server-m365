import { Command } from 'commander';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

const program = new Command();

program
  .name('ms-365-mcp-server')
  .description('Microsoft 365 MCP Server')
  .version(version)
  .option('-v', 'Enable verbose logging')
  .option('--read-only', 'Start server in read-only mode, disabling write operations')
  .option(
    '--http [port]',
    'HTTP port to listen on (default: 3000)'
  )
  .option(
    '--enabled-tools <pattern>',
    'Filter tools using regex pattern (e.g., "excel|contact" to enable Excel and Contact tools)'
  )
  .option(
    '--org-mode',
    'Enable organization/work mode from start (includes Teams, SharePoint, etc.) - enabled by default'
  );

export interface CommandOptions {
  v?: boolean;
  readOnly?: boolean;
  http?: string | boolean;
  enabledTools?: string;
  orgMode?: boolean;

  [key: string]: unknown;
}

export function parseArgs(): CommandOptions {
  program.parse();
  const options = program.opts();

  if (process.env.READ_ONLY === 'true' || process.env.READ_ONLY === '1') {
    options.readOnly = true;
  }

  if (process.env.ENABLED_TOOLS) {
    options.enabledTools = process.env.ENABLED_TOOLS;
  }

  // Default to org mode
  if (process.env.MS365_MCP_ORG_MODE === 'false' || process.env.MS365_MCP_ORG_MODE === '0') {
    options.orgMode = false;
  } else {
    options.orgMode = true;
  }

  return options;
}
