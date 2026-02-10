/**
 * Product creation helpers
 */

import { RevenueCatClient } from './client';
import { ProductConfig, SubscriptionDuration } from '../types';
import { retryWithBackoff } from '../utils/retry';

/**
 * Convert subscription duration to ISO 8601 duration string
 */
function durationToISO8601(duration: SubscriptionDuration): string | undefined {
  const map: Record<SubscriptionDuration, string | undefined> = {
    monthly: 'P1M',
    annual: 'P1Y',
    lifetime: undefined, // Lifetime purchases don't have duration
    custom: undefined,
  };

  return map[duration];
}

/**
 * Create products via RevenueCat API
 * Returns map of store_identifier -> generated product ID
 */
export async function createProducts(
  client: RevenueCatClient,
  products: ProductConfig[],
  appId?: string
): Promise<Map<string, string>> {
  const productIdMap = new Map<string, string>();

  for (const product of products) {
    const payload: any = {
      type: product.type,
      store_identifier: product.storeProductIdentifier || product.id,
    };

    // Add app_id if provided (required for API v2)
    if (appId) {
      payload.app_id = appId;
    }
    
    // Add display_name if available
    if (product.displayName) {
      payload.display_name = product.displayName;
    }

    // Note: For real store products, subscription parameters (duration, trial)
    // are automatically read from App Store Connect / Google Play Console.
    // They cannot be set via the RevenueCat API - configure them in the store instead.

    // Create product with retry logic
    const result = await retryWithBackoff(() => client.createProduct(payload));
    
    // Map store_identifier to generated product ID
    const storeIdentifier = product.storeProductIdentifier || product.id;
    let productId = result?.id || result?.object?.id;
    
    // If product already existed (409), fetch it to get the ID
    if (result?.existed && !productId) {
      const existingProduct = await client.findProductByStoreIdentifier(storeIdentifier);
      productId = existingProduct?.id;
      console.log(`Found existing product: ${storeIdentifier} -> ${productId}`);
    }
    
    if (productId) {
      productIdMap.set(storeIdentifier, productId);
      console.log(`Mapped: ${storeIdentifier} -> ${productId}`);
    } else {
      console.log(`WARNING: No product ID found for ${storeIdentifier}`);
    }
  }

  return productIdMap;
}
