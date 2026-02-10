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
  products: ProductConfig[],
  appId?: string
): Promise<any[]> {
  const results = [];

  for (const product of products) {
    const payload: any = {
      id: product.id,
      type: product.type,
      store_identifier: product.storeProductIdentifier || product.id,
    };

    // Add app_id if provided (required for API v2)
    if (appId) {
      payload.app_id = appId;
    }

    // Add subscription details for subscription products
    if (product.type === 'subscription' && product.duration) {
      const isoDuration = durationToISO8601(product.duration);
      if (isoDuration) {
        payload.subscription = {
          duration: isoDuration,
        };
        // Note: trial_duration must be configured in the store (App Store Connect / Google Play Console)
        // It cannot be set via the RevenueCat API
      }
    }

    // Create product with retry logic
    const result = await retryWithBackoff(() => client.createProduct(payload));
    results.push(result);
  }

  return results;
}
