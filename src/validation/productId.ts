/**
 * Product ID validation
 * Format: app_pro_monthly (lowercase, numbers, underscores only)
 * Pattern: ^[a-z0-9_]+$
 * Max length: 255
 */

import { ValidationError } from '../utils/errors';

const PRODUCT_ID_REGEX = /^[a-z0-9_]+$/;
const MAX_LENGTH = 255;

export function validateProductId(productId: string): boolean {
  return (
    productId.length > 0 &&
    productId.length <= MAX_LENGTH &&
    PRODUCT_ID_REGEX.test(productId)
  );
}

export function assertValidProductId(productId: string): void {
  if (!validateProductId(productId)) {
    throw new ValidationError(
      'Invalid Product ID. Must be lowercase letters, numbers, and underscores only (max 255 chars)',
      'productId'
    );
  }
}

export function productIdValidator(input: string): boolean | string {
  if (!input) {
    return 'Product ID is required';
  }

  if (input.length > MAX_LENGTH) {
    return `Product ID must be ${MAX_LENGTH} characters or less`;
  }

  if (!PRODUCT_ID_REGEX.test(input)) {
    return 'Invalid format. Use only lowercase letters, numbers, and underscores (e.g., app_pro_monthly)';
  }

  return true;
}
