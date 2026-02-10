/**
 * RevenueCat API Client
 * Handles all HTTP communication with RevenueCat REST API v2
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { handleAPIError } from '../utils/errors';
import { logger } from '../utils/logger';

const API_BASE_URL = 'https://api.revenuecat.com/v2';

export class RevenueCatClient {
  private client: AxiosInstance;
  private projectId: string;

  constructor(apiKey: string, projectId: string) {
    this.projectId = projectId;
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Validate API key by making a test request
   */
  async validateApiKey(): Promise<boolean> {
    try {
      await this.client.get('/projects');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all projects (for validation)
   */
  async getProjects(): Promise<any> {
    try {
      const response = await this.client.get('/projects');
      return response.data;
    } catch (error) {
      handleAPIError(error);
    }
  }

  /**
   * Create a new project
   */
  async createProject(name: string): Promise<any> {
    try {
      const response = await this.client.post('/projects', {
        name,
      });
      logger.success(`Created project: ${name}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        logger.warning(`Project ${name} already exists`);
        return { name, existed: true };
      }
      handleAPIError(error);
    }
  }

  /**
   * Create an iOS app
   */
  async createIOSApp(bundleId: string, name: string): Promise<any> {
    try {
      const response = await this.client.post(
        `/projects/${this.projectId}/apps`,
        {
          name,
          type: 'app_store',
          app_store: {
            bundle_id: bundleId,
          },
        }
      );
      logger.success(`Created iOS app: ${name}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        logger.warning(`iOS app already exists, skipping...`);
        return { bundle_id: bundleId, existed: true };
      }
      handleAPIError(error);
    }
  }

  /**
   * Create an Android app
   */
  async createAndroidApp(packageName: string, name: string): Promise<any> {
    try {
      const response = await this.client.post(
        `/projects/${this.projectId}/apps`,
        {
          name,
          type: 'play_store',
          play_store: {
            package_name: packageName,
          },
        }
      );
      logger.success(`Created Android app: ${name}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 409) {
        logger.warning(`Android app already exists, skipping...`);
        return { package_name: packageName, existed: true };
      }
      handleAPIError(error);
    }
  }

  /**
   * Get all apps in the project
   */
  async getApps(): Promise<any[]> {
    try {
      const response = await this.client.get(`/projects/${this.projectId}/apps`);
      return response.data.items || response.data || [];
    } catch (error) {
      handleAPIError(error);
      return [];
    }
  }

  /**
   * Find app by bundle ID (iOS)
   */
  async findAppByBundleId(bundleId: string): Promise<any | null> {
    try {
      const apps = await this.getApps();
      return apps.find((app: any) => 
        app.app_store?.bundle_id === bundleId || 
        app.bundle_id === bundleId
      ) || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Find app by package name (Android)
   */
  async findAppByPackageName(packageName: string): Promise<any | null> {
    try {
      const apps = await this.getApps();
      return apps.find((app: any) => 
        app.play_store?.package_name === packageName || 
        app.package_name === packageName
      ) || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get public API keys for a specific app
   */
  async getAppKeys(appId: string): Promise<any> {
    try {
      const response = await this.client.get(
        `/projects/${this.projectId}/apps/${appId}/api_keys`
      );
      return response.data;
    } catch (error) {
      handleAPIError(error);
    }
  }

  /**
   * Get app details including the public key
   */
  async getAppDetails(appId: string): Promise<any> {
    try {
      const response = await this.client.get(
        `/projects/${this.projectId}/apps/${appId}`
      );
      return response.data;
    } catch (error) {
      handleAPIError(error);
    }
  }

  /**
   * Create a product
   */
  async createProduct(product: {
    id: string;
    type: string;
    store_product_identifier: string;
    duration?: string;
  }): Promise<any> {
    try {
      const response = await this.client.post(
        `/projects/${this.projectId}/products`,
        product
      );
      logger.success(`Created product: ${product.id}`);
      return response.data;
    } catch (error: any) {
      // Handle 409 - product already exists (not necessarily an error)
      if (error.response?.status === 409) {
        logger.warning(`Product ${product.id} already exists, skipping...`);
        return { id: product.id, existed: true };
      }
      handleAPIError(error);
    }
  }

  /**
   * Create an entitlement
   */
  async createEntitlement(entitlement: {
    lookup_key: string;
    display_name: string;
  }): Promise<any> {
    try {
      const response = await this.client.post(
        `/projects/${this.projectId}/entitlements`,
        entitlement
      );
      logger.success(`Created entitlement: ${entitlement.lookup_key}`);
      return response.data;
    } catch (error: any) {
      // Handle 409 - entitlement already exists
      if (error.response?.status === 409) {
        logger.warning(`Entitlement ${entitlement.lookup_key} already exists, skipping...`);
        return { lookup_key: entitlement.lookup_key, existed: true };
      }
      handleAPIError(error);
    }
  }

  /**
   * Attach products to an entitlement
   */
  async attachProductsToEntitlement(
    entitlementId: string,
    productIds: string[]
  ): Promise<any> {
    try {
      const response = await this.client.post(
        `/projects/${this.projectId}/entitlements/${entitlementId}/actions/attach_products`,
        {
          product_ids: productIds,
        }
      );
      logger.success(`Attached ${productIds.length} products to entitlement`);
      return response.data;
    } catch (error: any) {
      handleAPIError(error);
    }
  }

  /**
   * Get all products in the project
   */
  async getProducts(): Promise<any[]> {
    try {
      const response = await this.client.get(`/projects/${this.projectId}/products`);
      return response.data.items || response.data || [];
    } catch (error) {
      handleAPIError(error);
      return [];
    }
  }

  /**
   * Find product by store identifier
   */
  async findProductByStoreIdentifier(storeIdentifier: string): Promise<any | null> {
    try {
      const products = await this.getProducts();
      return products.find((product: any) => 
        product.store_identifier === storeIdentifier
      ) || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Create an offering
   */
  async createOffering(offering: {
    id: string;
    is_current: boolean;
    packages: Array<{
      id: string;
      type: string;
      product_id: string;
    }>;
  }): Promise<any> {
    try {
      const response = await this.client.post(
        `/projects/${this.projectId}/offerings`,
        offering
      );
      logger.success(`Created offering: ${offering.id}`);
      return response.data;
    } catch (error: any) {
      // Handle 409 - offering already exists
      if (error.response?.status === 409) {
        logger.warning(`Offering ${offering.id} already exists, skipping...`);
        return { id: offering.id, existed: true };
      }
      handleAPIError(error);
    }
  }
}
