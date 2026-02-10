/**
 * Offering creation helpers
 */

import { RevenueCatClient } from './client';
import { OfferingConfig, PackageType } from '../types';
import { retryWithBackoff } from '../utils/retry';

/**
 * Map package type to RevenueCat package identifier
 */
function getPackageIdentifier(type: PackageType): string {
  const map: Record<PackageType, string> = {
    monthly: '$rc_monthly',
    annual: '$rc_annual',
    lifetime: '$rc_lifetime',
    custom: '$rc_custom',
  };

  return map[type];
}

/**
 * Create offerings via RevenueCat API
 */
export async function createOfferings(
  client: RevenueCatClient,
  offerings: OfferingConfig[],
  productIdMap?: Map<string, string>
): Promise<any[]> {
  const results = [];

  for (const offering of offerings) {
    const payload = {
      lookup_key: offering.id, // API v2 uses lookup_key instead of id
      display_name: offering.id.charAt(0).toUpperCase() + offering.id.slice(1), // Generate display name from id
      is_current: offering.isCurrent,
      packages: offering.packages.map((pkg) => {
        // Convert store identifier to actual product ID if map is available
        const actualProductId = productIdMap 
          ? productIdMap.get(pkg.productId) || pkg.productId
          : pkg.productId;
          
        return {
          lookup_key: getPackageIdentifier(pkg.type), // API v2 uses lookup_key for packages too
          product_id: actualProductId,
        };
      }),
    };

    // Create offering with retry logic
    const result = await retryWithBackoff(() => client.createOffering(payload));
    results.push(result);
  }

  return results;
}
