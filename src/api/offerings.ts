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
    let offeringId = result?.id || result?.object?.id;
    
    // If offering already existed, the ID should be in the result
    if (result?.existed && !offeringId) {
      // The result from getOfferings should already have the ID
      offeringId = result?.id;
    }
    
    console.log(`Offering ID for ${offering.id}: ${offeringId}`);
    
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
        
        let createdPkg;
        let packageAlreadyExisted = false;
        
        try {
          createdPkg = await retryWithBackoff(() => 
            client.createPackage(offeringId, packagePayload)
          );
        } catch (error: any) {
          // If 409, package exists - fetch it
          if (error.response?.status === 409 || error.message?.includes('already exists')) {
            packageAlreadyExisted = true;
            const packages = await client.getPackages(offeringId);
            createdPkg = packages.find((p: any) => p.lookup_key === getPackageIdentifier(pkg.type));
            console.log('Package already exists, fetched existing:', createdPkg?.id);
          } else {
            throw error;
          }
        }
        
        // Step 2b: Get package ID
        const packageId = createdPkg?.id || createdPkg?.object?.id;
        
        if (!packageId) {
          console.log('Package response:', JSON.stringify(createdPkg, null, 2));
          throw new Error(`Package ID not found for ${pkg.type}`);
        }
        
        if (!actualProductId) {
          console.log('Product ID mapping:', Array.from(productIdMap?.entries() || []));
          throw new Error(`Product ID not found for ${pkg.productId}`);
        }
        
        // Only attach products if package was just created (not if it already existed)
        if (!packageAlreadyExisted) {
          console.log(`Attaching product ${actualProductId} to package ${packageId} in offering ${offeringId}...`);
          
          try {
            await retryWithBackoff(() =>
              client.attachProductsToPackage(offeringId, packageId, [actualProductId])
            );
          } catch (error: any) {
            // If attachment fails, it might be because product is already attached
            if (error.response?.status === 409) {
              console.log('Product already attached to package, continuing...');
            } else {
              console.log('Attachment error details:', error.response?.data || error.message);
              throw error;
            }
          }
        } else {
          console.log(`Package ${pkg.type} already existed, skipping product attachment`);
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
