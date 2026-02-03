/**
 * Android Package Name validation
 * Format: com.company.app (lowercase only)
 * Pattern: ^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$
 */

import { ValidationError } from '../utils/errors';

const PACKAGE_NAME_REGEX = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;

export function validatePackageName(packageName: string): boolean {
  return PACKAGE_NAME_REGEX.test(packageName);
}

export function assertValidPackageName(packageName: string): void {
  if (!validatePackageName(packageName)) {
    throw new ValidationError(
      'Invalid Android Package Name format. Must be lowercase like com.company.app',
      'packageName'
    );
  }
}

export function packageNameValidator(input: string): boolean | string {
  if (!input) {
    return 'Package name is required';
  }

  if (!validatePackageName(input)) {
    return 'Invalid format. Must be lowercase like: com.company.app (no uppercase letters)';
  }

  return true;
}
