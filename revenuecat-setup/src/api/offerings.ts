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
  offerings: OfferingConfig[]
): Promise<any[]> {
  const results = [];

  for (const offering of offerings) {
    const payload = {
      id: offering.id,
      is_current: offering.isCurrent,
      packages: offering.packages.map((pkg) => ({
        id: getPackageIdentifier(pkg.type),
        type: pkg.type,
        product_id: pkg.productId,
      })),
    };

    // Create offering with retry logic
    const result = await retryWithBackoff(() => client.createOffering(payload));
    results.push(result);
  }

  return results;
}
