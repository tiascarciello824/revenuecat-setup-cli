/**
 * RevenueCat OAuth 2.0 Authentication Flow
 * Implements Authorization Code flow with PKCE
 */

import * as crypto from 'crypto';
import * as http from 'http';
import { logger } from '../utils/logger';
import open from 'open';

const OAUTH_BASE_URL = 'https://api.revenuecat.com/oauth2';
const REDIRECT_URI = 'http://localhost:3000/callback';

// OAuth Client registered with RevenueCat
const CLIENT_ID = process.env.REVENUECAT_OAUTH_CLIENT_ID || 'UmV2ZW51ZUNhdCBTZXR1cCBDTEk=';

interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

/**
 * Generate PKCE code verifier and challenge
 */
function generatePKCE(): { verifier: string; challenge: string } {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');

  return { verifier, challenge };
}

/**
 * Generate a random state parameter for CSRF protection
 */
function generateState(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Start local HTTP server to receive OAuth callback
 */
function startCallbackServer(
  expectedState: string,
  codeVerifier: string
): Promise<OAuthTokenResponse> {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url!, `http://localhost:3000`);

      if (url.pathname === '/callback') {
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const error = url.searchParams.get('error');

        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: system-ui; text-align: center; padding-top: 50px;">
                <h1>❌ Authorization Failed</h1>
                <p>Error: ${error}</p>
                <p>You can close this window.</p>
              </body>
            </html>
          `);
          server.close();
          reject(new Error(`OAuth error: ${error}`));
          return;
        }

        if (!code || state !== expectedState) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: system-ui; text-align: center; padding-top: 50px;">
                <h1>❌ Invalid Request</h1>
                <p>Missing or invalid authorization code.</p>
                <p>You can close this window.</p>
              </body>
            </html>
          `);
          server.close();
          reject(new Error('Invalid OAuth callback'));
          return;
        }

        // Exchange authorization code for tokens
        try {
          const tokens = await exchangeCodeForTokens(code, codeVerifier);

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: system-ui; text-align: center; padding-top: 50px;">
                <h1>✅ Authorization Successful!</h1>
                <p>You can now close this window and return to the CLI.</p>
                <script>setTimeout(() => window.close(), 2000)</script>
              </body>
            </html>
          `);

          server.close();
          resolve(tokens);
        } catch (error: any) {
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: system-ui; text-align: center; padding-top: 50px;">
                <h1>❌ Token Exchange Failed</h1>
                <p>${error.message}</p>
                <p>You can close this window.</p>
              </body>
            </html>
          `);
          server.close();
          reject(error);
        }
      }
    });

    server.listen(3000, () => {
      logger.info('🔓 OAuth callback server started on http://localhost:3000');
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      server.close();
      reject(new Error('OAuth flow timed out'));
    }, 5 * 60 * 1000);
  });
}

/**
 * Exchange authorization code for access and refresh tokens
 */
async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<OAuthTokenResponse> {
  const axios = require('axios');

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: codeVerifier,
  });

  try {
    const response = await axios.post(`${OAUTH_BASE_URL}/token`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(
      `Token exchange failed: ${error.response?.data?.error_description || error.message}`
    );
  }
}

/**
 * Main OAuth authentication flow
 * Opens browser for user to authorize, then returns access token
 */
export async function authenticateWithOAuth(): Promise<string> {
  // OAuth is ready to use!

  logger.section('🔐 RevenueCat OAuth Authentication');
  logger.info('Opening browser for authorization...\n');

  // Generate PKCE and state
  const { verifier, challenge } = generatePKCE();
  const state = generateState();

  // Build authorization URL
  const authUrl = new URL(`${OAUTH_BASE_URL}/authorize`);
  authUrl.searchParams.set('client_id', CLIENT_ID);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
  authUrl.searchParams.set('scope', 'projects:write apps:write products:write entitlements:write offerings:write');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', challenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  // Start callback server
  const tokensPromise = startCallbackServer(state, verifier);

  // Open browser
  try {
    await open(authUrl.toString());
    logger.success('✓ Browser opened. Please authorize the application.\n');
  } catch (error) {
    logger.warning('Could not open browser automatically.');
    logger.info('Please open this URL in your browser:\n');
    logger.highlight(authUrl.toString());
    logger.newline();
  }

  // Wait for callback
  logger.info('⏳ Waiting for authorization...\n');
  const tokens = await tokensPromise;

  logger.success('✓ Authorization successful!\n');
  return tokens.access_token;
}
