#!/usr/bin/env node

/**
 * RevenueCat Setup CLI - Main Entry Point
 * Automated RevenueCat configuration for React Native/Expo applications
 */

import { RevenueCatSetupCLI } from './cli';
import { logger } from './utils/logger';
import { isUserCancelled } from './utils/errors';

async function main() {
  try {
    const cli = new RevenueCatSetupCLI();
    await cli.run();
    process.exit(0);
  } catch (error: any) {
    if (isUserCancelled(error)) {
      logger.warning('\nSetup cancelled by user');
      process.exit(0);
    }

    logger.error('\nSetup failed:');
    logger.error(error.message);

    if (error.stack && process.env.DEBUG) {
      logger.dim('\nStack trace:');
      logger.dim(error.stack);
    }

    process.exit(1);
  }
}

main();
