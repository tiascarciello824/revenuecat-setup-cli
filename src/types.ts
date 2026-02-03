/**
 * Type definitions for RevenueCat Setup CLI
 */

export type ProductType = 'subscription' | 'non_consumable' | 'consumable';
export type SubscriptionDuration = 'monthly' | 'annual' | 'lifetime' | 'custom';
export type PackageType = 'monthly' | 'annual' | 'lifetime' | 'custom';
export type PlatformType = 'expo' | 'react-native';
export type BackendType = 'supabase' | 'firebase' | 'custom' | 'none';

export interface ProductConfig {
  id: string;
  displayName: string;
  type: ProductType;
  duration?: SubscriptionDuration;
  trialPeriodDays?: number;
  storeProductIdentifier?: string;
}

export interface EntitlementConfig {
  id: string;
  displayName: string;
  productIds: string[];
}

export interface PackageConfig {
  id: string;
  type: PackageType;
  productId: string;
}

export interface OfferingConfig {
  id: string;
  isCurrent: boolean;
  packages: PackageConfig[];
}

export interface AppConfig {
  projectName: string;
  appDisplayName: string;
  iosBundleId: string;
  androidPackageName: string;
  platform: PlatformType;
  backend: BackendType;
}

export interface SetupConfig {
  apiKey: string;
  app: AppConfig;
  products: ProductConfig[];
  entitlements: EntitlementConfig[];
  offerings: OfferingConfig[];
}

export interface GeneratedFile {
  path: string;
  content: string;
  description: string;
}

export interface SetupResult {
  success: boolean;
  outputDirectory: string;
  files: GeneratedFile[];
  apiResults: {
    productsCreated: number;
    entitlementsCreated: number;
    offeringsCreated: number;
  };
  nextSteps: string[];
}

// RevenueCat API Types
export interface RevenueCatProduct {
  id: string;
  type: ProductType;
  store_product_identifier: string;
  duration?: string; // ISO 8601 duration (e.g., "P1M" for monthly)
}

export interface RevenueCatEntitlement {
  id: string;
  name: string;
  product_ids: string[];
}

export interface RevenueCatOffering {
  id: string;
  is_current: boolean;
  packages: RevenueCatPackage[];
}

export interface RevenueCatPackage {
  id: string;
  type: string;
  product_id: string;
}
