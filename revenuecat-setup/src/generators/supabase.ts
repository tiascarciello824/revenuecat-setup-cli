/**
 * Supabase Generator
 * Generates webhook handler and SQL schema for Supabase backend
 */

import Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { SetupConfig, GeneratedFile } from '../types';
import { webhookTemplate } from '../templates/webhook.template';

/**
 * Generate Supabase Edge Function for webhook handling
 */
export function generateWebhookFunction(config: SetupConfig): GeneratedFile {
  const template = Handlebars.compile(webhookTemplate);

  const entitlementId = config.entitlements[0]?.id || 'pro';
  const functionName = 'handle-revenuecat-webhook';

  const data = {
    PROJECT_NAME: config.app.projectName,
    FUNCTION_NAME: functionName,
    ENTITLEMENT_ID: entitlementId,
  };

  const content = template(data);

  return {
    path: `supabase/functions/${functionName}/index.ts`,
    content,
    description: 'Supabase Edge Function to handle RevenueCat webhooks',
  };
}

/**
 * Generate SQL migration for Supabase database
 */
export function generateSQLMigration(config: SetupConfig): GeneratedFile {
  // Read SQL template
  const templatePath = path.join(__dirname, '../templates/sql-schema.template.sql');
  const sqlTemplate = fs.readFileSync(templatePath, 'utf-8');

  const template = Handlebars.compile(sqlTemplate);

  const data = {
    PROJECT_NAME: config.app.projectName,
    GENERATION_DATE: new Date().toISOString().split('T')[0],
    FREE_TIER_LIMIT: 10,
  };

  const content = template(data);

  return {
    path: 'lib/supabase/subscriptions.sql',
    content,
    description: 'SQL migration to add subscription tables and functions',
  };
}

/**
 * Generate all Supabase-related files
 */
export function generateSupabaseFiles(config: SetupConfig): GeneratedFile[] {
  if (config.app.backend !== 'supabase') {
    return [];
  }

  return [generateWebhookFunction(config), generateSQLMigration(config)];
}
