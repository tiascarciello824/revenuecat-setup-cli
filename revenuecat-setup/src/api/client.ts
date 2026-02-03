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
    id: string;
    name: string;
    product_ids: string[];
  }): Promise<any> {
    try {
      const response = await this.client.post(
        `/projects/${this.projectId}/entitlements`,
        entitlement
      );
      logger.success(`Created entitlement: ${entitlement.id}`);
      return response.data;
    } catch (error: any) {
      // Handle 409 - entitlement already exists
      if (error.response?.status === 409) {
        logger.warning(`Entitlement ${entitlement.id} already exists, skipping...`);
        return { id: entitlement.id, existed: true };
      }
      handleAPIError(error);
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
