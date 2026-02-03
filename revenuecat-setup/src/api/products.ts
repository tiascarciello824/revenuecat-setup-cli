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
 */
export async function createProducts(
  client: RevenueCatClient,
  products: ProductConfig[]
): Promise<any[]> {
  const results = [];

  for (const product of products) {
    const payload: any = {
      id: product.id,
      type: product.type,
      store_product_identifier: product.storeProductIdentifier || product.id,
    };

    // Add duration for subscriptions
    if (product.type === 'subscription' && product.duration) {
      const isoDuration = durationToISO8601(product.duration);
      if (isoDuration) {
        payload.duration = isoDuration;
      }
    }

    // Create product with retry logic
    const result = await retryWithBackoff(() => client.createProduct(payload));
    results.push(result);
  }

  return results;
}
