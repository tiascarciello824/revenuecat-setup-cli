/**
 * Entitlement creation helpers
 */

import { RevenueCatClient } from './client';
import { EntitlementConfig } from '../types';
import { retryWithBackoff } from '../utils/retry';

/**
 * Create entitlements via RevenueCat API
 */
export async function createEntitlements(
  client: RevenueCatClient,
  entitlements: EntitlementConfig[]
): Promise<any[]> {
  const results = [];

  for (const entitlement of entitlements) {
    const payload = {
      lookup_key: entitlement.id, // API v2 uses lookup_key instead of id
      display_name: entitlement.displayName, // API v2 uses display_name instead of name
      product_ids: entitlement.productIds,
    };

    // Create entitlement with retry logic
    const result = await retryWithBackoff(() => client.createEntitlement(payload));
    results.push(result);
  }

  return results;
}
