# RevenueCat Setup CLI

Automated RevenueCat configuration for React Native and Expo applications.

## Overview

This CLI tool automates the tedious process of setting up RevenueCat in your React Native or Expo app. It:

- ✅ Configures products, entitlements, and offerings via RevenueCat API
- ✅ Generates production-ready integration code
- ✅ Creates Zustand stores for subscription management
- ✅ Generates Supabase webhooks and database migrations (optional)
- ✅ Produces comprehensive setup documentation

## Installation

### NPX (Recommended)

```bash
npx revenuecat-setup-cli
```

### Global Installation

```bash
npm install -g revenuecat-setup-cli
revenuecat-setup
```

## Prerequisites

Before running this tool, you need:

1. **RevenueCat Account** - Sign up at [revenuecat.com](https://www.revenuecat.com)
2. **RevenueCat Project** - Create a project in the RevenueCat dashboard
3. **Secret API Key** - Get from RevenueCat Dashboard → Project Settings → API Keys
4. **App Configuration** - Have your iOS Bundle ID and Android Package Name ready

## What This Tool Does

### Automated via API
- Creates products (subscriptions, one-time purchases)
- Creates entitlements and links them to products
- Creates offerings with package configuration

### Generated Files
- `lib/services/revenuecat.ts` - RevenueCat service layer
- `store/subscriptionStore.ts` - Zustand subscription store
- `types/subscription.ts` - TypeScript type definitions
- `.env.template` - Environment variables template
- `REVENUECAT_SETUP_GUIDE.md` - Comprehensive setup documentation

### Supabase Integration (Optional)
- `supabase/functions/handle-revenuecat-webhook/index.ts` - Webhook handler
- `lib/supabase/subscriptions.sql` - Database migration

## Usage

Run the CLI and follow the interactive prompts:

```bash
npx revenuecat-setup-cli
```

### Workflow Steps

1. **API Key Validation** - Enter your RevenueCat Secret API Key
2. **Project Setup** - Confirm your project name and ID
3. **App Configuration** - Enter iOS Bundle ID and Android Package Name
4. **Platform Selection** - Choose Expo or React Native CLI
5. **Product Configuration** - Configure subscription products
6. **Entitlement Configuration** - Set up entitlements
7. **Offering Configuration** - Configure offerings and packages
8. **API Automation** - Tool creates everything in RevenueCat
9. **Code Generation** - Tool generates integration files
10. **Output** - Files saved to `revenuecat-output-{date}/`

## Manual Steps Required

Due to RevenueCat API limitations, you must manually:

1. **Create Project** in RevenueCat Dashboard
2. **Create Apps** (iOS and Android) in RevenueCat Dashboard
3. **Configure App Store Connect** - Create in-app purchases
4. **Configure Google Play Console** - Create subscription products
5. **Link Stores** to RevenueCat

The generated setup guide includes detailed instructions for all manual steps.

## Generated Code Example

The tool generates a complete RevenueCat integration based on proven patterns:

```typescript
import { useSubscriptionStore } from '@/store/subscriptionStore';

// Initialize at app startup
useEffect(() => {
  subscriptionStore.initialize();
}, []);

// Purchase a subscription
const handlePurchase = async () => {
  const success = await subscriptionStore.purchaseSubscription('$rc_monthly');
  if (success) {
    console.log('Purchase successful!');
  }
};

// Check subscription status
const { tier, status, canAddProduct } = useSubscriptionStore();
```

## Environment Variables

The tool generates an `.env.template` file. Copy to `.env` and fill in:

```env
# Expo
EXPO_PUBLIC_REVENUECAT_IOS_KEY=your_ios_key
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_android_key

# React Native
REVENUECAT_IOS_KEY=your_ios_key
REVENUECAT_ANDROID_KEY=your_android_key

# Supabase (if applicable)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_REVENUECAT_WEBHOOK_SECRET=your_webhook_secret
```

## Supabase Integration

If you select Supabase as your backend, the tool generates:

1. **Database Migration** - Adds subscription tables and functions
2. **Webhook Handler** - Supabase Edge Function to sync subscription events
3. **RLS Policies** - Secure access to subscription data

Deploy the webhook:

```bash
# Run SQL migration
supabase db push

# Deploy webhook function
supabase functions deploy handle-revenuecat-webhook

# Set webhook secret
supabase secrets set SUPABASE_REVENUECAT_WEBHOOK_SECRET=your_secret
```

## Testing

After setup:

1. Install generated dependencies:
   ```bash
   npm install react-native-purchases zustand
   ```

2. Copy generated files to your project

3. Test in sandbox mode:
   - iOS: Use sandbox Apple ID
   - Android: Use test account in Google Play Console

4. Verify webhook events (if using Supabase):
   ```bash
   supabase functions logs handle-revenuecat-webhook
   ```

## Dependencies

Generated code requires:
- `react-native-purchases` - RevenueCat SDK
- `zustand` - State management (optional)
- `@supabase/supabase-js` - Supabase client (if using Supabase)

## Examples

### Standard Setup (Monthly + Annual)
```bash
npx revenuecat-setup-cli
# Choose "Standard (Monthly + Annual)" preset
# Generates: app_pro_monthly, app_pro_annual
```

### With Lifetime Purchase
```bash
npx revenuecat-setup-cli
# Choose "With Lifetime" preset
# Generates: monthly, annual, lifetime products
```

### Custom Products
```bash
npx revenuecat-setup-cli
# Choose "Custom" preset
# Add products interactively
```

## Troubleshooting

### "Invalid API Key"
- Ensure you're using a **Secret API Key**, not a Public Key
- Check key is from the correct project

### "Product already exists"
- This is normal if re-running the tool
- Existing products are skipped automatically

### "Webhook not receiving events"
- Verify webhook URL in RevenueCat Dashboard
- Check webhook secret matches Supabase secret
- Review Supabase function logs

## Support

- **RevenueCat Documentation**: https://docs.revenuecat.com
- **Supabase Documentation**: https://supabase.com/docs
- **Issues**: Report bugs on GitHub

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.

## Credits

Built with:
- [Inquirer.js](https://github.com/SBoudrias/Inquirer.js) - Interactive prompts
- [Chalk](https://github.com/chalk/chalk) - Terminal colors
- [Ora](https://github.com/sindresorhus/ora) - Spinners
- [Handlebars](https://handlebarsjs.com/) - Templates
- [Axios](https://axios-http.com/) - HTTP client

---

**Generated code based on proven patterns from production applications.**
