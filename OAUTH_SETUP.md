# OAuth Setup for RevenueCat CLI

## 🎯 Goal
Enable seamless browser-based authentication where users only need to:
1. Click "Login with RevenueCat"
2. Authorize the app
3. ✨ Everything else is automatic

## 📋 Current Status

**✅ Code Implementation**: Complete and ready
**⏳ OAuth Client Registration**: Pending

The OAuth flow is fully implemented but requires a registered OAuth client from RevenueCat.

## 🔧 How to Enable OAuth

### Step 1: Register OAuth Client with RevenueCat

Send an email to: **support@revenuecat.com**

```
Subject: OAuth Client Registration Request - RevenueCat Setup CLI

Hi RevenueCat Team,

I'm developing an open-source CLI tool to automate RevenueCat project 
setup for React Native/Expo developers. I'd like to register an OAuth 
client for this tool.

Client Details:
- Client Name: RevenueCat Setup CLI
- Client Type: Public (CLI/Desktop application)
- Client URI: https://github.com/[your-github]/revenuecat-setup-cli
- Redirect URIs:
  - http://localhost:3000/callback
  - http://127.0.0.1:3000/callback

The tool will help developers automatically:
- Create projects and apps
- Configure products and entitlements
- Generate integration code

Users will authorize via OAuth flow in their browser.

Thank you!
```

### Step 2: Receive Client ID

RevenueCat will respond with your `client_id`.

### Step 3: Configure Environment Variable

Set the client ID as an environment variable:

```bash
export REVENUECAT_OAUTH_CLIENT_ID="your_client_id_here"
```

Or add it to your shell profile:

```bash
# ~/.zshrc or ~/.bashrc
export REVENUECAT_OAUTH_CLIENT_ID="your_client_id_here"
```

### Step 4: Hardcode in Production (Optional)

For distribution, you can hardcode the client_id in `src/auth/oauth.ts`:

```typescript
const CLIENT_ID = 'your_registered_client_id';
```

## 🚀 Usage

Once configured, users will see:

```
🔑 Autenticazione RevenueCat

? Scegli il metodo di autenticazione:
  ❯ 🌐 Login con browser (OAuth) - Consigliato
    🔑 API Key manuale
```

Selecting OAuth will:
1. Open browser automatically
2. Redirect to RevenueCat login
3. Show authorization screen
4. Redirect back to localhost
5. ✅ Done! Setup continues automatically

## 📚 Technical Details

### OAuth Flow Implementation

- **Flow Type**: Authorization Code with PKCE (RFC 7636)
- **Grant Type**: `authorization_code`
- **PKCE**: S256 challenge method
- **Scopes**: `projects:write apps:write products:write entitlements:write offerings:write`
- **Redirect URI**: `http://localhost:3000/callback`
- **Token Type**: Bearer access tokens

### Security Features

- ✅ PKCE (Proof Key for Code Exchange)
- ✅ State parameter for CSRF protection
- ✅ Automatic token expiration
- ✅ Granular permission scopes
- ✅ Local callback server (no external services)

## 🔄 Fallback to API Key

If OAuth is not configured or fails, the CLI automatically falls back to the API key method, ensuring the tool always works.

## 📝 File Structure

```
src/
├── auth/
│   └── oauth.ts           # OAuth flow implementation
├── smartCli.ts            # Integrates OAuth auth step
└── api/
    └── client.ts          # Uses access token for API calls
```

## 🎉 Benefits

- **User Experience**: No copying/pasting API keys
- **Security**: Tokens expire automatically
- **Permissions**: Granular scopes
- **Trust**: Users see RevenueCat's official login
- **Multi-account**: Easy to switch accounts

## ❓ Questions?

- OAuth Implementation Guide: https://www.revenuecat.com/docs/projects/oauth-setup
- RevenueCat Support: support@revenuecat.com
