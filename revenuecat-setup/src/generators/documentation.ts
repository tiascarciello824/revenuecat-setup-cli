/**
 * Documentation Generator
 * Creates comprehensive setup guide with all configuration details
 */

import { SetupConfig, ProductConfig, GeneratedFile } from '../types';

/**
 * Format product as table row
 */
function formatProductRow(product: ProductConfig): string {
  return `| ${product.id} | ${product.displayName} | ${product.type} | ${product.duration || 'N/A'} | ${product.trialPeriodDays || 0} days |`;
}

/**
 * Generate comprehensive setup documentation
 */
export function generateDocumentation(config: SetupConfig, apiKeys?: {ios?: string, android?: string}): GeneratedFile {
  const timestamp = new Date().toISOString();

  const content = `# RevenueCat Setup Guide
**Project:** ${config.app.projectName}
**Generated:** ${timestamp}
**Bundle ID (iOS):** ${config.app.iosBundleId}
**Package Name (Android):** ${config.app.androidPackageName}

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Products Configuration](#products-configuration)
3. [Entitlements Configuration](#entitlements-configuration)
4. [Offerings Configuration](#offerings-configuration)
5. [Environment Variables](#environment-variables)
6. [Generated Files](#generated-files)
7. [App Store Connect Setup](#app-store-connect-setup)
8. [Google Play Console Setup](#google-play-console-setup)
9. [RevenueCat Dashboard Configuration](#revenuecat-dashboard-configuration)
${config.app.backend === 'supabase' ? '10. [Supabase Configuration](#supabase-configuration)\n' : ''}11. [Integration Instructions](#integration-instructions)
12. [Testing Checklist](#testing-checklist)
13. [Next Steps](#next-steps)

---

## Overview

This document contains all the information needed to complete your RevenueCat integration for **${config.app.projectName}**.

The setup automation has:
- ✅ Created products in RevenueCat
- ✅ Configured entitlements
- ✅ Set up offerings with packages
- ✅ Generated integration code
${config.app.backend === 'supabase' ? '- ✅ Generated Supabase webhook handler\n- ✅ Generated database migration SQL\n' : ''}
---

## Products Configuration

The following products were created in RevenueCat:

| Product ID | Display Name | Type | Duration | Trial Period |
|------------|--------------|------|----------|--------------|
${config.products.map(formatProductRow).join('\n')}

---

## Entitlements Configuration

${config.entitlements.map(e => `### ${e.displayName} (\`${e.id}\`)

**Products included:**
${e.productIds.map(id => `- \`${id}\``).join('\n')}
`).join('\n')}

---

## Offerings Configuration

${config.offerings.map(o => `### ${o.id}${o.isCurrent ? ' (Current Offering)' : ''}

**Packages:**
${o.packages.map(p => `- **${p.type}**: \`${p.productId}\``).join('\n')}
`).join('\n')}

---

## Environment Variables

Copy these to your \`.env\` file:

\`\`\`env
# RevenueCat API Keys
${config.app.platform === 'expo' ? 'EXPO_PUBLIC_REVENUECAT_IOS_KEY' : 'REVENUECAT_IOS_KEY'}=${apiKeys?.ios || 'YOUR_IOS_KEY_HERE'}
${config.app.platform === 'expo' ? 'EXPO_PUBLIC_REVENUECAT_ANDROID_KEY' : 'REVENUECAT_ANDROID_KEY'}=${apiKeys?.android || 'YOUR_ANDROID_KEY_HERE'}
${config.app.backend === 'supabase' ? `
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_REVENUECAT_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET_HERE
` : ''}
\`\`\`

**Where to find these keys:**
- **iOS/Android Keys**: RevenueCat Dashboard → Project Settings → API Keys
${config.app.backend === 'supabase' ? '- **Supabase URL/Key**: Supabase Dashboard → Project Settings → API\n- **Webhook Secret**: RevenueCat Dashboard → Integrations → Webhooks\n' : ''}
---

## Generated Files

The following files were generated in the output directory:

1. **lib/services/revenuecat.ts** - Core RevenueCat service
2. **store/subscriptionStore.ts** - Zustand subscription store
3. **types/subscription.ts** - TypeScript types
4. **.env.template** - Environment variables template
${config.app.backend === 'supabase' ? '5. **supabase/functions/handle-revenuecat-webhook/index.ts** - Webhook handler\n6. **lib/supabase/subscriptions.sql** - Database migration\n' : ''}
---

## App Store Connect Setup

### 1. Create In-App Purchases

For each product, create a corresponding in-app purchase in App Store Connect:

1. Go to **App Store Connect** → Your App → **In-App Purchases**
2. Click **+** to create new subscription or purchase
3. Use these **Product IDs** (must match exactly):
${config.products.map(p => `   - \`${p.id}\``).join('\n')}

### 2. Configure Subscription Groups (if applicable)

- Create subscription group for your app
- Add monthly and annual subscriptions to the same group
- Set upgrade/downgrade behavior

### 3. Link to RevenueCat

1. Go to **RevenueCat Dashboard** → **Apps** → **${config.app.appDisplayName}**
2. Click **App Store Connect**
3. Follow prompts to link your App Store Connect account
4. RevenueCat will automatically sync product details

---

## Google Play Console Setup

### 1. Create Products

For each product, create in Google Play Console:

1. Go to **Google Play Console** → Your App → **Monetization** → **Products**
2. Create subscription or in-app product
3. Use these **Product IDs** (must match exactly):
${config.products.map(p => `   - \`${p.id}\``).join('\n')}

### 2. Link to RevenueCat

1. Go to **RevenueCat Dashboard** → **Apps** → **${config.app.appDisplayName}**
2. Click **Google Play**
3. Upload service account JSON
4. RevenueCat will sync product details

---

## RevenueCat Dashboard Configuration

### Verify Products
1. Log into **RevenueCat Dashboard**
2. Navigate to **Products**
3. Verify all products appear correctly

### Verify Entitlements
1. Navigate to **Entitlements**
2. Verify "${config.entitlements[0]?.id}" entitlement exists
3. Check that correct products are attached

### Verify Offerings
1. Navigate to **Offerings**
2. Verify "${config.offerings[0]?.id}" offering is set as current
3. Check package configuration

${config.app.backend === 'supabase' ? `---

## Supabase Configuration

### 1. Run Database Migration

Execute the generated SQL migration:

\`\`\`bash
# From Supabase Dashboard SQL Editor
# Copy and paste contents of lib/supabase/subscriptions.sql
# OR via CLI:
supabase db push
\`\`\`

### 2. Deploy Webhook Function

\`\`\`bash
# Deploy the edge function
supabase functions deploy handle-revenuecat-webhook

# Set environment variables
supabase secrets set SUPABASE_REVENUECAT_WEBHOOK_SECRET=your_secret_here
\`\`\`

### 3. Configure RevenueCat Webhook

1. Go to **RevenueCat Dashboard** → **Integrations** → **Webhooks**
2. Add new webhook with URL:
   \`https://[YOUR_PROJECT_REF].supabase.co/functions/v1/handle-revenuecat-webhook\`
3. Generate and save webhook secret
4. Update Supabase secret with webhook secret

` : ''}---

## Integration Instructions

### 1. Install Dependencies

\`\`\`bash
${config.app.platform === 'expo'
  ? 'npx expo install react-native-purchases'
  : 'npm install react-native-purchases'}
${config.app.backend === 'supabase' ? 'npm install @supabase/supabase-js\n' : ''}npm install zustand
\`\`\`

### 2. Copy Generated Files

Copy all generated files to your project:
- \`lib/services/revenuecat.ts\`
- \`store/subscriptionStore.ts\`
- \`types/subscription.ts\`
${config.app.backend === 'supabase' ? '- `supabase/functions/handle-revenuecat-webhook/index.ts`\n- `lib/supabase/subscriptions.sql`\n' : ''}
### 3. Initialize at App Startup

\`\`\`typescript
import { useSubscriptionStore } from '@/store/subscriptionStore';

// In your root component
useEffect(() => {
  subscriptionStore.initialize();
}, []);
\`\`\`

---

## Testing Checklist

- [ ] Environment variables configured
- [ ] Products created in App Store Connect
- [ ] Products created in Google Play Console
- [ ] Stores linked to RevenueCat
- [ ] Test purchase in sandbox (iOS)
- [ ] Test purchase in sandbox (Android)
- [ ] Restore purchases works
- [ ] Trial period works correctly
${config.app.backend === 'supabase' ? '- [ ] Webhook receives events\n- [ ] Database updates on purchase\n' : ''}- [ ] Entitlements unlock features
- [ ] Subscription status displays correctly

---

## Next Steps

1. **Complete Store Setup**
   - Finish App Store Connect configuration
   - Finish Google Play Console configuration
   - Link both stores to RevenueCat

2. **Test Integration**
   - Run app in development
   - Test sandbox purchases
   - Verify webhook events${config.app.backend === 'supabase' ? ' (check Supabase logs)' : ''}

3. **Build Paywall UI**
   - Display offerings to users
   - Handle purchase flow
   - Show subscription status

4. **Production Launch**
   - Switch RevenueCat to production mode
   - Update environment variables
   - Submit app for review

---

## Support

- **RevenueCat Docs**: https://docs.revenuecat.com
- **RevenueCat Dashboard**: https://app.revenuecat.com
${config.app.backend === 'supabase' ? '- **Supabase Docs**: https://supabase.com/docs\n' : ''}
---

**Generated by RevenueCat Setup CLI**
For issues or questions, refer to the documentation above or contact support.
`;

  return {
    path: 'REVENUECAT_SETUP_GUIDE.md',
    content,
    description: 'Comprehensive setup guide with configuration details',
  };
}
