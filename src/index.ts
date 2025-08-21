#!/usr/bin/env node

import 'dotenv/config';
import { parseArgs } from './cli.js';
import logger from './logger.js';
import MicrosoftGraphServer from './server.js';
import { version } from './version.js';

function validateEnvironment(): void {
  const requiredVars = [];
  
  if (!process.env.MS365_MCP_CLIENT_ID) {
    requiredVars.push('MS365_MCP_CLIENT_ID');
  }
  
  if (requiredVars.length > 0) {
    logger.error('❌ Missing required environment variables:');
    requiredVars.forEach(varName => {
      logger.error(`   - ${varName}`);
    });
    logger.error('');
    logger.error('Please set these environment variables and try again.');
    logger.error('For help setting up Azure AD app registration, see the README.');
    process.exit(1);
  }
  
  logger.info('✅ Environment validation passed');
}

async function main(): Promise<void> {
  try {
    const args = parseArgs();

    // Validate environment first
    validateEnvironment();

    // Force org mode and HTTP mode as defaults
    args.orgMode = true;
    if (!args.http) {
      args.http = '3000';
    }

    logger.info('Organization mode enabled by default - including work account scopes');
    logger.info('Running in HTTP mode with Bearer token authentication');

    const server = new MicrosoftGraphServer(args);
    await server.initialize(version);
    await server.start();
  } catch (error) {
    logger.error(`Startup error: ${error}`);
    process.exit(1);
  }
}

main();
