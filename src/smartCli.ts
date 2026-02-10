/**
 * Smart CLI Mode
 * Auto-detects configuration with minimal user input
 */

import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from './utils/logger';
import { detectProjectConfig, displayDetectedConfig, generateProductPrefix } from './utils/autoDetect';
import { RevenueCatClient } from './api/client';
import { createProducts } from './api/products';
import { createEntitlements } from './api/entitlements';
import { createOfferings } from './api/offerings';
import { generateAllCode } from './generators/code';
import { generateSupabaseFiles } from './generators/supabase';
import { generateDocumentation } from './generators/documentation';
import type {
  SetupConfig,
  ProductConfig,
  EntitlementConfig,
  OfferingConfig,
  SetupResult,
  GeneratedFile,
} from './types';

export class SmartRevenueCatSetupCLI {
  private config: Partial<SetupConfig> = {};
  private detectedConfig: any;

  async run(): Promise<SetupResult> {
    console.clear();
    logger.section('🚀 RevenueCat Setup - Smart Mode');
    logger.info('Rilevamento automatico della configurazione...\n');

    try {
      // Step 1: Auto-detect project configuration
      this.detectedConfig = await this.stepAutoDetect();

      // Step 2: API Key (only required input)
      await this.stepAPIKey();

      // Step 3: Show preview and confirm
      const confirmed = await this.stepPreviewAndConfirm();
      if (!confirmed) {
        logger.warning('Setup annullato dall\'utente');
        process.exit(0);
      }

      // Step 4: Project ID (auto-detect or create)
      await this.stepProjectId();

      // Step 5: Create iOS and Android apps
      await this.stepCreateApps();

      // Step 6: Build final configuration
      this.buildFinalConfig();

      // Step 7: Execute API automation
      const apiResults = await this.stepAPIAutomation();

      // Step 8: Generate code
      const files = await this.stepCodeGeneration();

      // Step 9: Write API keys to .env
      await this.stepWriteEnvFile();

      // Step 10: Output results
      return await this.stepOutputResults(files, apiResults);
    } catch (error: any) {
      logger.error('Setup fallito: ' + error.message);
      throw error;
    }
  }

  /**
   * Step 1: Auto-detect project configuration
   */
  private async stepAutoDetect(): Promise<any> {
    const spinner = ora('Analisi progetto in corso...').start();

    try {
      const detected = detectProjectConfig();

      spinner.stop();

      displayDetectedConfig(detected);

      // Check if detection was successful
      if (!detected.detectionSuccess) {
        logger.warning('⚠️  Alcune informazioni non sono state rilevate automaticamente.');
        logger.info('Sarà necessario fornirle manualmente.\n');

        // Ask for missing information
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'appName',
            message: 'Nome App:',
            when: !detected.appName,
            validate: (input) => (input ? true : 'Nome app richiesto'),
          },
          {
            type: 'input',
            name: 'iosBundleId',
            message: 'iOS Bundle ID (es. com.company.app):',
            when: !detected.iosBundleId,
            validate: (input) => {
              if (!input) return 'Bundle ID richiesto';
              if (!/^[a-zA-Z][a-zA-Z0-9-]*(\.[a-zA-Z][a-zA-Z0-9-]*)+$/.test(input)) {
                return 'Formato non valido. Deve essere come: com.company.app';
              }
              return true;
            },
          },
          {
            type: 'input',
            name: 'androidPackageName',
            message: 'Android Package Name (es. com.company.app):',
            when: !detected.androidPackageName,
            validate: (input) => {
              if (!input) return 'Package name richiesto';
              if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(input)) {
                return 'Formato non valido. Deve essere lowercase come: com.company.app';
              }
              return true;
            },
          },
          {
            type: 'list',
            name: 'platform',
            message: 'Platform:',
            choices: [
              { name: 'Expo', value: 'expo' },
              { name: 'React Native CLI', value: 'react-native' },
            ],
            when: !detected.platform,
          },
        ]);

        // Merge detected with manual input
        return {
          ...detected,
          appName: detected.appName || answers.appName,
          iosBundleId: detected.iosBundleId || answers.iosBundleId,
          androidPackageName: detected.androidPackageName || answers.androidPackageName,
          platform: detected.platform || answers.platform,
          detectionSuccess: true,
        };
      }

      return detected;
    } catch (error: any) {
      spinner.fail('Rilevamento fallito: ' + error.message);
      throw error;
    }
  }

  /**
   * Step 2: Authenticate with RevenueCat (OAuth or API Key)
   */
  private async stepAPIKey(): Promise<void> {
    logger.section('🔑 Autenticazione RevenueCat');

    // Always offer OAuth as an option (it's now registered!)
    const { method } = await inquirer.prompt([
      {
        type: 'list',
        name: 'method',
        message: 'Scegli il metodo di autenticazione:',
        choices: [
          { name: '🌐 Login con browser (OAuth) - Consigliato', value: 'oauth' },
          { name: '🔑 API Key manuale', value: 'apikey' },
        ],
        default: 'oauth',
      },
    ]);

    if (method === 'oauth') {
      try {
        // Import OAuth module dynamically
        const { authenticateWithOAuth } = await import('./auth/oauth');
        const accessToken = await authenticateWithOAuth();
        this.config.apiKey = accessToken;
        return;
      } catch (error: any) {
        logger.error('OAuth authentication failed: ' + error.message);
        logger.warning('Falling back to API key authentication...\n');
        // Fall through to API key method
      }
    }

    // API Key method (fallback or chosen)
    const { apiKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: 'Inserisci RevenueCat Secret API Key:',
        validate: (input) => (input ? true : 'API key richiesta'),
      },
    ]);

    const spinner = ora('Validazione API key...').start();

    try {
      const testClient = new RevenueCatClient(apiKey, 'test');
      const isValid = await testClient.validateApiKey();

      if (!isValid) {
        spinner.fail('API key non valida');
        throw new Error('API key RevenueCat non valida');
      }

      spinner.succeed('API key validata');
      this.config.apiKey = apiKey;
    } catch (error: any) {
      spinner.fail('Validazione fallita');
      throw error;
    }
  }

  /**
   * Step 3: Preview configuration and confirm
   */
  private async stepPreviewAndConfirm(): Promise<boolean> {
    logger.section('📋 Configurazione Proposta');

    // Show what will be created
    const productPrefix = generateProductPrefix(this.detectedConfig.appName);

    logger.info(chalk.bold('App:'));
    logger.dim(`  Nome: ${this.detectedConfig.appName}`);
    logger.dim(`  Bundle ID: ${this.detectedConfig.iosBundleId}`);
    logger.dim(`  Package Name: ${this.detectedConfig.androidPackageName}`);
    logger.dim(`  Platform: ${this.detectedConfig.platform}`);
    logger.dim(`  Backend: ${this.detectedConfig.backend || 'none'}`);

    logger.newline();
    logger.info(chalk.bold('Prodotti (preset Standard):'));
    logger.dim(`  • ${productPrefix}_pro_monthly - Pro Monthly (7 giorni trial)`);
    logger.dim(`  • ${productPrefix}_pro_annual - Pro Annual (7 giorni trial)`);

    logger.newline();
    logger.info(chalk.bold('Entitlement:'));
    logger.dim(`  • pro - Pro Access`);

    logger.newline();
    logger.info(chalk.bold('Offering:'));
    logger.dim(`  • default (current) - Monthly + Annual packages`);

    logger.newline();
    logger.info(chalk.bold('File che saranno generati:'));
    logger.dim(`  • lib/services/revenuecat.ts`);
    logger.dim(`  • store/subscriptionStore.ts`);
    logger.dim(`  • types/subscription.ts`);
    logger.dim(`  • .env.template`);
    if (this.detectedConfig.backend === 'supabase') {
      logger.dim(`  • supabase/functions/handle-revenuecat-webhook/index.ts`);
      logger.dim(`  • lib/supabase/subscriptions.sql`);
    }
    logger.dim(`  • REVENUECAT_SETUP_GUIDE.md`);

    logger.newline();

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: chalk.bold('Confermi questa configurazione?'),
        default: true,
      },
    ]);

    return confirm;
  }

  /**
   * Step 4: Get or create Project ID
   */
  private async stepProjectId(): Promise<void> {
    logger.section('🏗️  RevenueCat Project');

    // Try to create a new project directly (OAuth scope limitation workaround)
    logger.info('ℹ️  Creazione progetto automatica...\n');

    const createSpinner = ora('Creazione progetto in RevenueCat...').start();
    
    try {
      const client = new RevenueCatClient(this.config.apiKey!, 'temp');
      const newProject = await client.createProject(this.detectedConfig.appName);
      
      createSpinner.succeed(`Progetto creato: ${this.detectedConfig.appName}`);
      
      (this.config as any).projectId = newProject.id || newProject.object?.id;
      (this.config as any).projectName = this.detectedConfig.appName;
    } catch (error: any) {
      createSpinner.fail('Impossibile creare progetto automaticamente');
      
      // Fallback: ask for project ID manually
      logger.warning('⚠️  Limitazione scope OAuth: impossibile creare o leggere progetti.\n');
      logger.info('📋 Azione Richiesta:');
      logger.info('1. Vai a: https://app.revenuecat.com');
      logger.info('2. Crea un nuovo progetto (o usa uno esistente)');
      logger.info('3. Copia il Project ID dal dashboard\n');

      const { projectId, projectName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'Nome del progetto (per riferimento):',
          default: this.detectedConfig.appName,
        },
        {
          type: 'input',
          name: 'projectId',
          message: 'Project ID da RevenueCat Dashboard:',
          validate: (input) => (input ? true : 'Project ID richiesto'),
        },
      ]);

      (this.config as any).projectId = projectId;
      (this.config as any).projectName = projectName;
    }
  }

  /**
   * Step 5: Create iOS and Android apps in RevenueCat
   */
  private async stepCreateApps(): Promise<void> {
    logger.section('📱 Creazione App');

    const client = new RevenueCatClient(this.config.apiKey!, (this.config as any).projectId);

    // Create or get iOS app
    const iosSpinner = ora('Creazione app iOS...').start();
    try {
      const iosApp = await client.createIOSApp(
        this.detectedConfig.iosBundleId,
        `${this.detectedConfig.appName} (iOS)`
      );
      
      let iosAppId = iosApp?.id || iosApp?.object?.id || iosApp?.data?.id;
      
      // If app already existed (409), fetch it to get the ID
      if (iosApp?.existed && !iosAppId) {
        iosSpinner.text = 'App già esistente, recupero ID...';
        const existingApp = await client.findAppByBundleId(this.detectedConfig.iosBundleId);
        iosAppId = existingApp?.id;
      }
      
      if (iosAppId) {
        (this.config as any).iosAppId = iosAppId;
        iosSpinner.succeed(`App iOS pronta (ID: ${iosAppId})`);
      } else {
        iosSpinner.fail('Impossibile ottenere iOS App ID');
        throw new Error('iOS App ID non disponibile');
      }
    } catch (error: any) {
      iosSpinner.fail('Errore setup app iOS: ' + error.message);
      throw error;
    }

    // Create or get Android app
    const androidSpinner = ora('Creazione app Android...').start();
    try {
      const androidApp = await client.createAndroidApp(
        this.detectedConfig.androidPackageName,
        `${this.detectedConfig.appName} (Android)`
      );
      
      let androidAppId = androidApp?.id || androidApp?.object?.id || androidApp?.data?.id;
      
      // If app already existed (409), fetch it to get the ID
      if (androidApp?.existed && !androidAppId) {
        androidSpinner.text = 'App già esistente, recupero ID...';
        const existingApp = await client.findAppByPackageName(this.detectedConfig.androidPackageName);
        androidAppId = existingApp?.id;
      }
      
      if (androidAppId) {
        (this.config as any).androidAppId = androidAppId;
        androidSpinner.succeed(`App Android pronta (ID: ${androidAppId})`);
      } else {
        androidSpinner.fail('Impossibile ottenere Android App ID');
        throw new Error('Android App ID non disponibile');
      }
    } catch (error: any) {
      androidSpinner.fail('Errore setup app Android: ' + error.message);
      throw error;
    }

    // Get API keys
    await this.stepRetrieveAPIKeys(client);

    logger.newline();
  }

  /**
   * Retrieve public API keys from created apps
   */
  private async stepRetrieveAPIKeys(client: RevenueCatClient): Promise<void> {
    const spinner = ora('Recupero chiavi API...').start();

    try {
      // Get all apps to find the ones we just created
      const apps = await client.getApps();
      
      let iosKey = '';
      let androidKey = '';

      // Find iOS app
      const iosApp = apps.find((app: any) => 
        app.bundle_id === this.detectedConfig.iosBundleId || 
        app.type === 'ios'
      );

      if (iosApp) {
        // Try to get key from app details
        const iosDetails = await client.getAppDetails(iosApp.id);
        iosKey = iosDetails.public_key || iosDetails.api_key || '';
        
        // If not in details, try api_keys endpoint
        if (!iosKey) {
          const iosKeys = await client.getAppKeys(iosApp.id);
          iosKey = iosKeys?.public_key || iosKeys?.items?.[0]?.key || '';
        }
      }

      // Find Android app
      const androidApp = apps.find((app: any) => 
        app.package_name === this.detectedConfig.androidPackageName || 
        (app.type === 'android' && !iosApp)
      );

      if (androidApp) {
        // Try to get key from app details
        const androidDetails = await client.getAppDetails(androidApp.id);
        androidKey = androidDetails.public_key || androidDetails.api_key || '';
        
        // If not in details, try api_keys endpoint
        if (!androidKey) {
          const androidKeys = await client.getAppKeys(androidApp.id);
          androidKey = androidKeys?.public_key || androidKeys?.items?.[0]?.key || '';
        }
      }

      if (iosKey && androidKey) {
        spinner.succeed('Chiavi API recuperate');
        (this.config as any).iosApiKey = iosKey;
        (this.config as any).androidApiKey = androidKey;
        
        logger.dim(`  iOS Key: ${iosKey.substring(0, 15)}...`);
        logger.dim(`  Android Key: ${androidKey.substring(0, 15)}...`);
      } else {
        spinner.warn('Alcune chiavi non sono state trovate');
        if (!iosKey) logger.warning('Chiave iOS non trovata');
        if (!androidKey) logger.warning('Chiave Android non trovata');
      }
    } catch (error: any) {
      spinner.fail('Errore nel recupero delle chiavi: ' + error.message);
      logger.warning('Le chiavi dovranno essere recuperate manualmente dal dashboard');
    }
  }

  /**
   * Build final configuration from detected + user input
   */
  private buildFinalConfig(): void {
    const productPrefix = generateProductPrefix(this.detectedConfig.appName);

    // Build products (standard preset)
    const products: ProductConfig[] = [
      {
        id: `${productPrefix}_pro_monthly`,
        displayName: 'Pro Monthly',
        type: 'subscription',
        duration: 'monthly',
        trialPeriodDays: 7,
      },
      {
        id: `${productPrefix}_pro_annual`,
        displayName: 'Pro Annual',
        type: 'subscription',
        duration: 'annual',
        trialPeriodDays: 7,
      },
    ];

    // Build entitlement
    const entitlement: EntitlementConfig = {
      id: 'pro',
      displayName: 'Pro Access',
      productIds: products.map((p) => p.id),
    };

    // Build offering
    const offering: OfferingConfig = {
      id: 'default',
      isCurrent: true,
      packages: [
        {
          id: `${productPrefix}_pro_monthly`,
          type: 'monthly',
          productId: `${productPrefix}_pro_monthly`,
        },
        {
          id: `${productPrefix}_pro_annual`,
          type: 'annual',
          productId: `${productPrefix}_pro_annual`,
        },
      ],
    };

    // Build app config
    this.config.app = {
      projectName: (this.config as any).projectName,
      appDisplayName: this.detectedConfig.appName,
      iosBundleId: this.detectedConfig.iosBundleId,
      androidPackageName: this.detectedConfig.androidPackageName,
      platform: this.detectedConfig.platform,
      backend: this.detectedConfig.backend,
    };

    this.config.products = products;
    this.config.entitlements = [entitlement];
    this.config.offerings = [offering];
  }

  /**
   * Execute API automation
   */
  private async stepAPIAutomation(): Promise<any> {
    logger.section('⚙️  Creazione in RevenueCat');

    const client = new RevenueCatClient(this.config.apiKey!, (this.config as any).projectId);

    let productsCreated = 0;
    let entitlementsCreated = 0;
    let offeringsCreated = 0;

    // Create products (use iOS app_id)
    const productSpinner = ora('Creazione prodotti...').start();
    try {
      const iosAppId = (this.config as any).iosAppId;
      if (!iosAppId) {
        throw new Error('iOS App ID non disponibile');
      }
      const productIdMap = await createProducts(client, this.config.products!, iosAppId);
      productsCreated = productIdMap.size;
      
      // Store the product ID mapping for later use
      (this.config as any).productIdMap = productIdMap;
      
      productSpinner.succeed(`Creati ${productsCreated} prodotti`);
    } catch (error: any) {
      productSpinner.fail('Errore creazione prodotti: ' + error.message);
      throw error;
    }

    // Create entitlements
    const entitlementSpinner = ora('Creazione entitlements...').start();
    try {
      const productIdMap = (this.config as any).productIdMap;
      await createEntitlements(client, this.config.entitlements!, productIdMap);
      entitlementsCreated = this.config.entitlements!.length;
      entitlementSpinner.succeed(`Creati ${entitlementsCreated} entitlement(s)`);
    } catch (error: any) {
      entitlementSpinner.fail('Errore creazione entitlements: ' + error.message);
      throw error;
    }

    // Create offerings
    const offeringSpinner = ora('Creazione offerings...').start();
    try {
      await createOfferings(client, this.config.offerings!);
      offeringsCreated = this.config.offerings!.length;
      offeringSpinner.succeed(`Creati ${offeringsCreated} offering(s)`);
    } catch (error: any) {
      offeringSpinner.fail('Errore creazione offerings: ' + error.message);
      throw error;
    }

    return { productsCreated, entitlementsCreated, offeringsCreated };
  }

  /**
   * Generate code files
   */
  private async stepCodeGeneration(): Promise<GeneratedFile[]> {
    logger.section('📝 Generazione Codice');

    const spinner = ora('Generazione file...').start();

    const fullConfig = this.config as SetupConfig;
    const files: GeneratedFile[] = [];

    // Generate core code files
    files.push(...generateAllCode(fullConfig));

    // Generate Supabase files if needed
    if (fullConfig.app.backend === 'supabase') {
      files.push(...generateSupabaseFiles(fullConfig));
    }

    // Generate documentation
    files.push(generateDocumentation(fullConfig));

    spinner.succeed(`Generati ${files.length} file(s)`);

    return files;
  }

  /**
   * Write API keys to .env file
   */
  private async stepWriteEnvFile(): Promise<void> {
    const iosKey = (this.config as any).iosApiKey;
    const androidKey = (this.config as any).androidApiKey;

    if (!iosKey || !androidKey) {
      logger.warning('Chiavi API non disponibili, salto aggiornamento .env');
      return;
    }

    logger.section('🔑 Aggiornamento .env');
    const spinner = ora('Scrittura chiavi nel file .env...').start();

    try {
      const envPath = path.join(process.cwd(), '.env');
      let envContent = '';

      // Read existing .env if it exists
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf-8');
      }

      // Check if keys already exist
      const hasIosKey = /EXPO_PUBLIC_REVENUECAT_IOS_KEY=/m.test(envContent);
      const hasAndroidKey = /EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=/m.test(envContent);

      if (hasIosKey && hasAndroidKey) {
        // Update existing keys
        envContent = envContent.replace(
          /EXPO_PUBLIC_REVENUECAT_IOS_KEY=.*/,
          `EXPO_PUBLIC_REVENUECAT_IOS_KEY=${iosKey}`
        );
        envContent = envContent.replace(
          /EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=.*/,
          `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=${androidKey}`
        );
        spinner.succeed('Chiavi aggiornate nel file .env');
      } else {
        // Append new keys
        if (!envContent.endsWith('\n')) {
          envContent += '\n';
        }
        envContent += `\n# RevenueCat API Keys (Auto-generated)\n`;
        envContent += `EXPO_PUBLIC_REVENUECAT_IOS_KEY=${iosKey}\n`;
        envContent += `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=${androidKey}\n`;
        spinner.succeed('Chiavi aggiunte al file .env');
      }

      // Write back to .env
      fs.writeFileSync(envPath, envContent, 'utf-8');
      
      logger.success(`✓ File .env aggiornato: ${envPath}`);
    } catch (error: any) {
      spinner.fail('Errore nella scrittura del file .env: ' + error.message);
      logger.warning('Dovrai aggiungere manualmente le chiavi:');
      logger.dim(`  EXPO_PUBLIC_REVENUECAT_IOS_KEY=${iosKey}`);
      logger.dim(`  EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=${androidKey}`);
    }

    logger.newline();
  }

  /**
   * Output results and save files
   */
  private async stepOutputResults(files: GeneratedFile[], apiResults: any): Promise<SetupResult> {
    logger.section('💾 Salvataggio File');

    const timestamp = new Date().toISOString().split('T')[0];
    const outputDir = path.join(process.cwd(), `revenuecat-output-${timestamp}`);

    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write all files
    const spinner = ora('Scrittura file...').start();

    for (const file of files) {
      const filePath = path.join(outputDir, file.path);
      const fileDir = path.dirname(filePath);

      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      fs.writeFileSync(filePath, file.content, 'utf-8');
    }

    spinner.succeed('Tutti i file salvati');

    // Display results
    logger.newline();
    logger.section('✅ Setup Completato!');
    logger.success(`Directory output: ${outputDir}`);
    logger.newline();

    logger.info('📄 File Generati:');
    files.forEach((file) => {
      logger.dim(`  ✓ ${file.path}`);
    });

    logger.newline();
    logger.highlight('📋 Prossimi Passi:');
    logger.info('1. Copia i file generati nel tuo progetto');
    logger.info('2. Configura App Store Connect (iOS)');
    logger.info('3. Configura Google Play Console (Android)');
    logger.info('4. Collega gli store a RevenueCat Dashboard');
    if (this.config.app?.backend === 'supabase') {
      logger.info('5. Esegui la migrazione SQL in Supabase');
      logger.info('6. Deploya la funzione webhook');
    }
    logger.info(`${this.config.app?.backend === 'supabase' ? '7' : '5'}. Testa gli acquisti in sandbox`);
    logger.newline();

    logger.info('📖 Leggi la guida completa in:');
    logger.dim(`   ${path.join(outputDir, 'REVENUECAT_SETUP_GUIDE.md')}`);
    logger.newline();

    return {
      success: true,
      outputDirectory: outputDir,
      files,
      apiResults,
      nextSteps: [],
    };
  }
}
