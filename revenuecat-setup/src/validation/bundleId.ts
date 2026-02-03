/**
 * iOS Bundle ID validation
 * Format: com.company.app
 * Pattern: ^[a-zA-Z][a-zA-Z0-9-]*(\.[a-zA-Z][a-zA-Z0-9-]*)+$
 */

import { ValidationError } from '../utils/errors';

const BUNDLE_ID_REGEX = /^[a-zA-Z][a-zA-Z0-9-]*(\.[a-zA-Z][a-zA-Z0-9-]*)+$/;

export function validateBundleId(bundleId: string): boolean {
  return BUNDLE_ID_REGEX.test(bundleId);
}

export function assertValidBundleId(bundleId: string): void {
  if (!validateBundleId(bundleId)) {
    throw new ValidationError(
      'Invalid iOS Bundle ID format. Must be like com.company.app',
      'bundleId'
    );
  }
}

export function bundleIdValidator(input: string): boolean | string {
  if (!input) {
    return 'Bundle ID is required';
  }

  if (!validateBundleId(input)) {
    return 'Invalid format. Must be like: com.company.app (starts with letter, contains dots)';
  }

  return true;
}
