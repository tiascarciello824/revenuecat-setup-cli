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
    // Step 1: Create offering (without packages)
    const offeringPayload = {
      lookup_key: offering.id, // API v2 uses lookup_key instead of id
      display_name: offering.id.charAt(0).toUpperCase() + offering.id.slice(1), // Generate display name from id
    };

    const result = await retryWithBackoff(() => client.createOffering(offeringPayload));
    const offeringId = result.id || result.object?.id;
    
    // Step 2: Create packages in the offering and attach products
    if (offeringId && offering.packages && offering.packages.length > 0) {
      for (const pkg of offering.packages) {
        // Convert store identifier to actual product ID if map is available
        const actualProductId = productIdMap 
          ? productIdMap.get(pkg.productId) || pkg.productId
          : pkg.productId;
        
        // Generate display name from package type
        const displayName = pkg.type.charAt(0).toUpperCase() + pkg.type.slice(1);
        
        // Step 2a: Create package (without product)
        const packagePayload = {
          lookup_key: getPackageIdentifier(pkg.type),
          display_name: displayName,
        };
        
        const createdPkg = await retryWithBackoff(() => 
          client.createPackage(offeringId, packagePayload)
        );
        
        // Step 2b: Attach products to package
        const packageId = createdPkg?.id || createdPkg?.object?.id;
        if (packageId && actualProductId) {
          await retryWithBackoff(() =>
            client.attachProductsToPackage(offeringId, packageId, [actualProductId])
          );
        }
      }
    }
    
    // Step 3: Set as current offering if specified
    if (offeringId && offering.isCurrent) {
      await retryWithBackoff(() => client.setCurrentOffering(offeringId));
    }
    
    results.push(result);
  }

  return results;
}
