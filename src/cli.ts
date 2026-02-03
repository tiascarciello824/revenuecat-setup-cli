/**
 * CLI Orchestrator
 * Main interactive command-line interface
 */

import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from './utils/logger';
import { bundleIdValidator } from './validation/bundleId';
import { packageNameValidator } from './validation/packageName';
import { productIdValidator } from './validation/productId';
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
  PlatformType,
  BackendType,
} from './types';

export class RevenueCatSetupCLI {
  private config: Partial<SetupConfig> = {};

  async run(): Promise<SetupResult> {
    logger.section('🚀 RevenueCat Setup Automation');
    logger.info('This tool will guide you through setting up RevenueCat for your React Native/Expo app.\n');

    try {
      // Step 1: API Key Validation
      await this.stepValidateAPIKey();

      // Step 2: Manual Project Creation Guide
      await this.stepProjectCreationGuide();

      // Step 3: Manual App Configuration Guide
      await this.stepAppConfigurationGuide();

      // Step 4: Platform Selection
      await this.stepPlatformSelection();

      // Step 5: Product Configuration
      await this.stepProductConfiguration();

      // Step 6: Entitlement Configuration
      await this.stepEntitlementConfiguration();

      // Step 7: Offering Configuration
      await this.stepOfferingConfiguration();

      // Step 8: API Automation Execution
      const apiResults = await this.stepAPIAutomation();

      // Step 9: Code & Documentation Generation
      const files = await this.stepCodeGeneration();

      // Step 10: Output & Next Steps
      return await this.stepOutputResults(files, apiResults);
    } catch (error: any) {
      logger.error('Setup failed: ' + error.message);
      throw error;
    }
  }

  /**
   * Step 1: API Key Validation
   */
  private async stepValidateAPIKey(): Promise<void> {
    logger.step(1, 'API Key Validation');

    const { apiKey } = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: 'Enter your RevenueCat Secret API Key:',
        validate: (input) => (input ? true : 'API key is required'),
      },
    ]);

    const spinner = ora('Validating API key...').start();

    // Test API key with temporary client
    const testClient = new RevenueCatClient(apiKey, 'test');
    const isValid = await testClient.validateApiKey();

    if (!isValid) {
      spinner.fail('Invalid API key');
      throw new Error('Invalid RevenueCat API key');
    }

    spinner.succeed('API key validated');
    this.config.apiKey = apiKey;
  }

  /**
   * Step 2: Manual Project Creation Guide
   */
  private async stepProjectCreationGuide(): Promise<void> {
    logger.step(2, 'Project Setup');
    logger.info('RevenueCat projects must be created manually in the dashboard.');
    logger.newline();
    logger.highlight('📋 Action Required:');
    logger.info('1. Go to: https://app.revenuecat.com');
    logger.info('2. Create a new project or select an existing one');
    logger.info('3. Note down your project details\n');

    const { projectName, projectId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Enter your project name (for reference):',
        validate: (input) => (input ? true : 'Project name is required'),
      },
      {
        type: 'input',
        name: 'projectId',
        message: 'Enter your RevenueCat Project ID (from dashboard):',
        validate: (input) => (input ? true : 'Project ID is required'),
      },
    ]);

    if (!this.config.app) {
      this.config.app = {
        projectName,
        appDisplayName: '',
        iosBundleId: '',
        androidPackageName: '',
        platform: 'expo' as PlatformType,
        backend: 'none' as BackendType,
      };
    } else {
      this.config.app.projectName = projectName;
    }
    (this.config as any).projectId = projectId;
  }

  /**
   * Step 3: Manual App Configuration Guide
   */
  private async stepAppConfigurationGuide(): Promise<void> {
    logger.step(3, 'App Configuration');
    logger.info('Configure your iOS and Android apps in the RevenueCat dashboard.');
    logger.newline();

    const { appDisplayName, iosBundleId, androidPackageName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'appDisplayName',
        message: 'App Display Name:',
        validate: (input) => (input ? true : 'App name is required'),
      },
      {
        type: 'input',
        name: 'iosBundleId',
        message: 'iOS Bundle ID (e.g., com.company.app):',
        validate: bundleIdValidator,
      },
      {
        type: 'input',
        name: 'androidPackageName',
        message: 'Android Package Name (e.g., com.company.app):',
        validate: packageNameValidator,
      },
    ]);

    if (!this.config.app) {
      this.config.app = {
        projectName: '',
        appDisplayName,
        iosBundleId,
        androidPackageName,
        platform: 'expo' as PlatformType,
        backend: 'none' as BackendType,
      };
    } else {
      this.config.app.appDisplayName = appDisplayName;
      this.config.app.iosBundleId = iosBundleId;
      this.config.app.androidPackageName = androidPackageName;
    }

    logger.success('App configuration saved');
  }

  /**
   * Step 4: Platform Selection
   */
  private async stepPlatformSelection(): Promise<void> {
    logger.step(4, 'Platform & Backend Selection');

    const { platform, backend } = await inquirer.prompt([
      {
        type: 'list',
        name: 'platform',
        message: 'Select your platform:',
        choices: [
          { name: 'Expo (Recommended)', value: 'expo' },
          { name: 'React Native CLI', value: 'react-native' },
        ],
      },
      {
        type: 'list',
        name: 'backend',
        message: 'Select your backend:',
        choices: [
          { name: 'Supabase (Recommended)', value: 'supabase' },
          { name: 'Firebase', value: 'firebase' },
          { name: 'Custom Backend', value: 'custom' },
          { name: 'No Backend', value: 'none' },
        ],
      },
    ]);

    if (!this.config.app) {
      this.config.app = {
        projectName: '',
        appDisplayName: '',
        iosBundleId: '',
        androidPackageName: '',
        platform: platform as PlatformType,
        backend: backend as BackendType,
      };
    } else {
      this.config.app.platform = platform as PlatformType;
      this.config.app.backend = backend as BackendType;
    }

    logger.success(`Platform: ${platform}, Backend: ${backend}`);
  }

  /**
   * Step 5: Product Configuration
   */
  private async stepProductConfiguration(): Promise<void> {
    logger.step(5, 'Product Configuration');

    const { productPreset } = await inquirer.prompt([
      {
        type: 'list',
        name: 'productPreset',
        message: 'Choose product configuration:',
        choices: [
          { name: 'Standard (Monthly + Annual)', value: 'standard' },
          { name: 'With Lifetime', value: 'lifetime' },
          { name: 'Custom', value: 'custom' },
        ],
      },
    ]);

    const products: ProductConfig[] = [];

    if (productPreset === 'standard' || productPreset === 'lifetime') {
      const { appPrefix } = await inquirer.prompt([
        {
          type: 'input',
          name: 'appPrefix',
          message: 'Product ID prefix (e.g., "myapp"):',
          default: this.config.app?.projectName?.toLowerCase().replace(/\s+/g, '') || 'app',
          validate: productIdValidator,
        },
      ]);

      products.push({
        id: `${appPrefix}_pro_monthly`,
        displayName: 'Pro Monthly',
        type: 'subscription',
        duration: 'monthly',
        trialPeriodDays: 7,
      });

      products.push({
        id: `${appPrefix}_pro_annual`,
        displayName: 'Pro Annual',
        type: 'subscription',
        duration: 'annual',
        trialPeriodDays: 7,
      });

      if (productPreset === 'lifetime') {
        products.push({
          id: `${appPrefix}_pro_lifetime`,
          displayName: 'Pro Lifetime',
          type: 'non_consumable',
        });
      }
    } else {
      // Custom product configuration
      let addMore = true;
      while (addMore) {
        const productData = await inquirer.prompt([
          {
            type: 'input',
            name: 'id',
            message: 'Product ID:',
            validate: productIdValidator,
          },
          {
            type: 'input',
            name: 'displayName',
            message: 'Display Name:',
          },
          {
            type: 'list',
            name: 'type',
            message: 'Product Type:',
            choices: ['subscription', 'non_consumable', 'consumable'],
          },
        ]);

        if (productData.type === 'subscription') {
          const { duration, trialPeriodDays } = await inquirer.prompt([
            {
              type: 'list',
              name: 'duration',
              message: 'Subscription Duration:',
              choices: ['monthly', 'annual', 'custom'],
            },
            {
              type: 'number',
              name: 'trialPeriodDays',
              message: 'Trial Period (days):',
              default: 0,
            },
          ]);

          productData.duration = duration;
          productData.trialPeriodDays = trialPeriodDays;
        }

        products.push(productData as ProductConfig);

        const { more } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'more',
            message: 'Add another product?',
            default: false,
          },
        ]);

        addMore = more;
      }
    }

    this.config.products = products;
    logger.success(`Configured ${products.length} product(s)`);
  }

  /**
   * Step 6: Entitlement Configuration
   */
  private async stepEntitlementConfiguration(): Promise<void> {
    logger.step(6, 'Entitlement Configuration');

    const { entitlementId, entitlementName } = await inquirer.prompt([
      {
        type: 'input',
        name: 'entitlementId',
        message: 'Entitlement ID:',
        default: 'pro',
        validate: productIdValidator,
      },
      {
        type: 'input',
        name: 'entitlementName',
        message: 'Entitlement Display Name:',
        default: 'Pro Access',
      },
    ]);

    const entitlement: EntitlementConfig = {
      id: entitlementId,
      displayName: entitlementName,
      productIds: this.config.products!.map((p) => p.id),
    };

    this.config.entitlements = [entitlement];
    logger.success('Entitlement configured');
  }

  /**
   * Step 7: Offering Configuration
   */
  private async stepOfferingConfiguration(): Promise<void> {
    logger.step(7, 'Offering Configuration');

    const packages = this.config.products!.map((product) => {
      let type: any = 'custom';

      if (product.duration === 'monthly') type = 'monthly';
      else if (product.duration === 'annual') type = 'annual';
      else if (product.type === 'non_consumable') type = 'lifetime';

      return {
        id: product.id,
        type,
        productId: product.id,
      };
    });

    const offering: OfferingConfig = {
      id: 'default',
      isCurrent: true,
      packages,
    };

    this.config.offerings = [offering];
    logger.success('Offering configured with all products');
  }

  /**
   * Step 8: API Automation Execution
   */
  private async stepAPIAutomation(): Promise<any> {
    logger.step(8, 'Creating Products in RevenueCat');

    const client = new RevenueCatClient(this.config.apiKey!, (this.config as any).projectId);

    let productsCreated = 0;
    let entitlementsCreated = 0;
    let offeringsCreated = 0;

    // Create products
    const productSpinner = ora('Creating products...').start();
    try {
      const productResults = await createProducts(client, this.config.products!);
      productsCreated = productResults.length;
      productSpinner.succeed(`Created ${productsCreated} product(s)`);
    } catch (error: any) {
      productSpinner.fail('Failed to create products: ' + error.message);
      throw error;
    }

    // Create entitlements
    const entitlementSpinner = ora('Creating entitlements...').start();
    try {
      const entitlementResults = await createEntitlements(client, this.config.entitlements!);
      entitlementsCreated = entitlementResults.length;
      entitlementSpinner.succeed(`Created ${entitlementsCreated} entitlement(s)`);
    } catch (error: any) {
      entitlementSpinner.fail('Failed to create entitlements: ' + error.message);
      throw error;
    }

    // Create offerings
    const offeringSpinner = ora('Creating offerings...').start();
    try {
      const offeringResults = await createOfferings(client, this.config.offerings!);
      offeringsCreated = offeringResults.length;
      offeringSpinner.succeed(`Created ${offeringsCreated} offering(s)`);
    } catch (error: any) {
      offeringSpinner.fail('Failed to create offerings: ' + error.message);
      throw error;
    }

    return { productsCreated, entitlementsCreated, offeringsCreated };
  }

  /**
   * Step 9: Code & Documentation Generation
   */
  private async stepCodeGeneration(): Promise<GeneratedFile[]> {
    logger.step(9, 'Generating Integration Code');

    const spinner = ora('Generating files...').start();

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

    spinner.succeed(`Generated ${files.length} file(s)`);

    return files;
  }

  /**
   * Step 10: Output & Next Steps
   */
  private async stepOutputResults(files: GeneratedFile[], apiResults: any): Promise<SetupResult> {
    logger.step(10, 'Saving Files');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const outputDir = path.join(process.cwd(), `revenuecat-output-${timestamp}`);

    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write all files
    const spinner = ora('Writing files...').start();

    for (const file of files) {
      const filePath = path.join(outputDir, file.path);
      const fileDir = path.dirname(filePath);

      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      fs.writeFileSync(filePath, file.content, 'utf-8');
    }

    spinner.succeed('All files saved');

    // Display results
    logger.newline();
    logger.section('✅ Setup Complete!');
    logger.success(`Output directory: ${outputDir}`);
    logger.newline();

    logger.info('📄 Generated Files:');
    files.forEach((file) => {
      logger.dim(`  - ${file.path}`);
      logger.dim(`    ${file.description}`);
    });

    logger.newline();
    logger.highlight('📋 Next Steps:');
    logger.info('1. Review the setup guide: REVENUECAT_SETUP_GUIDE.md');
    logger.info('2. Copy generated files to your project');
    logger.info('3. Configure App Store Connect and Google Play Console');
    logger.info('4. Link stores to RevenueCat Dashboard');
    if (this.config.app?.backend === 'supabase') {
      logger.info('5. Run the SQL migration in Supabase');
      logger.info('6. Deploy the webhook Edge Function');
      logger.info('7. Configure webhook URL in RevenueCat');
    }
    logger.info(`${this.config.app?.backend === 'supabase' ? '8' : '5'}. Test purchases in sandbox mode`);
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
