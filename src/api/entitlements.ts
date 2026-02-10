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
  entitlements: EntitlementConfig[],
  productIdMap?: Map<string, string>
): Promise<any[]> {
  const results = [];

  for (const entitlement of entitlements) {
    // Step 1: Create entitlement (without products)
    const payload = {
      lookup_key: entitlement.id, // API v2 uses lookup_key instead of id
      display_name: entitlement.displayName, // API v2 uses display_name instead of name
    };

    const result = await retryWithBackoff(() => client.createEntitlement(payload));
    
    // Step 2: Attach products to entitlement
    if (entitlement.productIds && entitlement.productIds.length > 0) {
      const entitlementId = result.id || result.object?.id;
      if (entitlementId) {
        // Convert store identifiers to actual product IDs
        const actualProductIds = productIdMap 
          ? entitlement.productIds.map(storeId => productIdMap.get(storeId) || storeId)
          : entitlement.productIds;
          
        await retryWithBackoff(() => 
          client.attachProductsToEntitlement(entitlementId, actualProductIds)
        );
      }
    }
    
    results.push(result);
  }

  return results;
}
