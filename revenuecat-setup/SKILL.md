```json
{
  "name": "revenuecat-setup",
  "command": "revenuecatsetup",
  "description": "Automate complete RevenueCat project setup with apps, products, entitlements, and offerings configuration",
  "category": "development",
  "version": "1.0.0"
}
```

# RevenueCat Setup CLI - Usage Guide

## Command Usage

```
/revenuecatsetup
```

This command launches an interactive setup wizard that configures your entire RevenueCat project.

## Quick Start

```bash
npx revenuecat-setup-cli
```

## What You Need

1. RevenueCat Secret API Key (from dashboard)
2. iOS Bundle ID (e.g., `com.company.app`)
3. Android Package Name (e.g., `com.company.app`)
4. Project ID from RevenueCat Dashboard

## What It Generates

- **Service Layer** - `lib/services/revenuecat.ts`
- **State Store** - `store/subscriptionStore.ts`
- **Types** - `types/subscription.ts`
- **Environment** - `.env.template`
- **Documentation** - `REVENUECAT_SETUP_GUIDE.md`
- **Supabase** (optional) - Webhook + SQL migration

## Workflow

1. Run CLI
2. Enter API key
3. Configure products
4. Tool creates in RevenueCat
5. Tool generates code
6. Copy files to project
7. Complete manual steps (stores, linking)

## Options

### Product Presets
- **Standard** - Monthly + Annual subscriptions
- **With Lifetime** - Monthly + Annual + Lifetime
- **Custom** - Define your own

### Backend Options
- **Supabase** - Full webhook + database integration
- **Firebase** - Code only (webhook not included)
- **Custom** - Code only
- **None** - RevenueCat only

### Platform Options
- **Expo** - Uses `EXPO_PUBLIC_` env vars
- **React Native** - Standard env vars

## Integration

```typescript
// App startup
import { useSubscriptionStore } from '@/store/subscriptionStore';

useEffect(() => {
  subscriptionStore.initialize();
}, []);

// Purchase flow
const handlePurchase = async () => {
  const success = await subscriptionStore.purchaseSubscription('$rc_monthly');
};

// Check status
const { tier, canAddProduct } = useSubscriptionStore();
```

## After Running

1. Copy generated files to your project
2. Install dependencies: `npm install react-native-purchases zustand`
3. Set up App Store Connect products
4. Set up Google Play Console products
5. Link stores in RevenueCat Dashboard
6. (Supabase) Run SQL migration
7. (Supabase) Deploy webhook function
8. Test in sandbox mode

## Tips

- Use same product IDs across RevenueCat, App Store, and Google Play
- Test with sandbox accounts before going live
- Check webhook events in RevenueCat Dashboard
- Review generated documentation carefully

## Common Issues

**"Invalid API Key"** - Use Secret key, not Public key

**"Product exists"** - Normal when re-running, skips automatically

**Webhook not working** - Check URL and secret match

## Output Location

Files saved to: `revenuecat-output-YYYY-MM-DD/`

## More Info

See generated `REVENUECAT_SETUP_GUIDE.md` for complete instructions.
