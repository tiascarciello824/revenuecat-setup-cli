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
      id: entitlement.id,
      name: entitlement.displayName,
      product_ids: entitlement.productIds,
    };

    // Create entitlement with retry logic
    const result = await retryWithBackoff(() => client.createEntitlement(payload));
    results.push(result);
  }

  return results;
}
