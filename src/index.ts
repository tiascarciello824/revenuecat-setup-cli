#!/usr/bin/env node

/**
 * RevenueCat Setup CLI - Main Entry Point
 * Automated RevenueCat configuration for React Native/Expo applications
 */

import { RevenueCatSetupCLI } from './cli';
import { SmartRevenueCatSetupCLI } from './smartCli';
import { logger } from './utils/logger';
import { isUserCancelled } from './utils/errors';

// Parse command line arguments
const args = process.argv.slice(2);
const isSmartMode = args.includes('--smart') || args.includes('-s');
const isInteractiveMode = args.includes('--interactive') || args.includes('-i');
const showHelp = args.includes('--help') || args.includes('-h');

function displayHelp() {
  console.log(`
${logger.constructor.name ? '' : ''}🚀 RevenueCat Setup CLI

Modalità disponibili:

  ${require('chalk').bold('--smart, -s')}         Modalità Smart (consigliata)
                        Auto-rileva configurazione, richiede solo conferma
                        Input richiesti: 2 (API key + conferma)
                        Tempo: ~1 minuto

  ${require('chalk').bold('--interactive, -i')}   Modalità Interattiva (completa)
                        Guida passo-passo con tutte le opzioni
                        Input richiesti: 10+
                        Tempo: ~5-10 minuti

  ${require('chalk').bold('(nessun flag)')}       Modalità Smart (default)

  ${require('chalk').bold('--help, -h')}          Mostra questo messaggio

Esempi:

  ${require('chalk').dim('# Modalità smart (consigliata)')}
  npx revenuecat-setup-cli --smart

  ${require('chalk').dim('# Modalità interattiva completa')}
  npx revenuecat-setup-cli --interactive

  ${require('chalk').dim('# Default (smart mode)')}
  npx revenuecat-setup-cli

Per maggiori informazioni: https://github.com/yourusername/revenuecat-setup-cli
`);
}

async function main() {
  try {
    // Show help if requested
    if (showHelp) {
      displayHelp();
      process.exit(0);
    }

    // Choose CLI mode
    let cli;

    if (isInteractiveMode) {
      // Full interactive mode
      logger.dim('Modalità: Interactive (completa)\n');
      cli = new RevenueCatSetupCLI();
    } else {
      // Smart mode (default)
      logger.dim('Modalità: Smart (auto-detection)\n');
      cli = new SmartRevenueCatSetupCLI();
    }

    await cli.run();
    process.exit(0);
  } catch (error: any) {
    if (isUserCancelled(error)) {
      logger.warning('\nSetup annullato dall\'utente');
      process.exit(0);
    }

    logger.error('\nSetup fallito:');
    logger.error(error.message);

    if (error.stack && process.env.DEBUG) {
      logger.dim('\nStack trace:');
      logger.dim(error.stack);
    }

    process.exit(1);
  }
}

main();
