/**
 * Auto-Detection Utilities
 * Automatically detects project configuration from app.json, package.json, etc.
 */

import * as fs from 'fs';
import * as path from 'path';
import { AppConfig, BackendType, PlatformType } from '../types';
import { logger } from './logger';

export interface DetectedConfig {
  appName: string | null;
  iosBundleId: string | null;
  androidPackageName: string | null;
  platform: PlatformType | null;
  backend: BackendType | null;
  projectDirectory: string;
  detectionSuccess: boolean;
  detectionDetails: {
    appJsonFound: boolean;
    packageJsonFound: boolean;
    bundleIdSource: string | null;
    packageNameSource: string | null;
  };
}

/**
 * Auto-detect project configuration from files
 */
export function detectProjectConfig(directory?: string): DetectedConfig {
  const projectDir = directory || process.cwd();

  const result: DetectedConfig = {
    appName: null,
    iosBundleId: null,
    androidPackageName: null,
    platform: null,
    backend: null,
    projectDirectory: projectDir,
    detectionSuccess: false,
    detectionDetails: {
      appJsonFound: false,
      packageJsonFound: false,
      bundleIdSource: null,
      packageNameSource: null,
    },
  };

  try {
    // Try to detect from app.json (Expo)
    const appJsonPath = path.join(projectDir, 'app.json');
    if (fs.existsSync(appJsonPath)) {
      const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));
      result.detectionDetails.appJsonFound = true;

      if (appJson.expo) {
        // Expo project
        result.platform = 'expo';
        result.appName = appJson.expo.name || appJson.name;
        result.iosBundleId = appJson.expo.ios?.bundleIdentifier;
        result.androidPackageName = appJson.expo.android?.package;

        if (result.iosBundleId) {
          result.detectionDetails.bundleIdSource = 'app.json (expo.ios.bundleIdentifier)';
        }
        if (result.androidPackageName) {
          result.detectionDetails.packageNameSource = 'app.json (expo.android.package)';
        }
      }
    }

    // Try to detect from package.json
    const packageJsonPath = path.join(projectDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      result.detectionDetails.packageJsonFound = true;

      // Fallback app name from package.json if not found in app.json
      if (!result.appName) {
        result.appName = packageJson.name;
      }

      // Detect platform if not already detected
      if (!result.platform) {
        if (packageJson.dependencies?.expo || packageJson.devDependencies?.expo) {
          result.platform = 'expo';
        } else if (
          packageJson.dependencies?.['react-native'] ||
          packageJson.devDependencies?.['react-native']
        ) {
          result.platform = 'react-native';
        }
      }

      // Detect backend
      result.backend = detectBackend(packageJson);
    }

    // For React Native CLI projects, try to detect from native files
    if (result.platform === 'react-native' || !result.iosBundleId || !result.androidPackageName) {
      // Try Android build.gradle
      if (!result.androidPackageName) {
        const androidPackage = detectAndroidPackageName(projectDir);
        if (androidPackage) {
          result.androidPackageName = androidPackage;
          result.detectionDetails.packageNameSource = 'android/app/build.gradle';
        }
      }

      // Try iOS project files
      if (!result.iosBundleId) {
        const iosBundleId = detectIOSBundleId(projectDir);
        if (iosBundleId) {
          result.iosBundleId = iosBundleId;
          result.detectionDetails.bundleIdSource = 'ios/[AppName].xcodeproj';
        }
      }
    }

    // Check if detection was successful
    result.detectionSuccess =
      result.appName !== null &&
      result.iosBundleId !== null &&
      result.androidPackageName !== null &&
      result.platform !== null;
  } catch (error: any) {
    logger.warning(`Auto-detection failed: ${error.message}`);
  }

  return result;
}

/**
 * Detect backend type from package.json dependencies
 */
function detectBackend(packageJson: any): BackendType {
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  // Check for Supabase
  if (allDeps['@supabase/supabase-js']) {
    return 'supabase';
  }

  // Check for Firebase
  if (allDeps['firebase'] || allDeps['@react-native-firebase/app']) {
    return 'firebase';
  }

  // No backend detected
  return 'none';
}

/**
 * Detect Android package name from build.gradle
 */
function detectAndroidPackageName(projectDir: string): string | null {
  try {
    const buildGradlePath = path.join(projectDir, 'android', 'app', 'build.gradle');
    if (!fs.existsSync(buildGradlePath)) {
      return null;
    }

    const buildGradle = fs.readFileSync(buildGradlePath, 'utf-8');

    // Look for applicationId in build.gradle
    const match = buildGradle.match(/applicationId\s+["']([^"']+)["']/);
    if (match && match[1]) {
      return match[1];
    }

    // Alternative: namespace in newer Gradle files
    const namespaceMatch = buildGradle.match(/namespace\s+["']([^"']+)["']/);
    if (namespaceMatch && namespaceMatch[1]) {
      return namespaceMatch[1];
    }
  } catch (error) {
    // Silently fail
  }

  return null;
}

/**
 * Detect iOS bundle identifier from project files
 */
function detectIOSBundleId(projectDir: string): string | null {
  try {
    const iosDir = path.join(projectDir, 'ios');
    if (!fs.existsSync(iosDir)) {
      return null;
    }

    // Find .xcodeproj directory
    const files = fs.readdirSync(iosDir);
    const xcodeprojDir = files.find((f) => f.endsWith('.xcodeproj'));

    if (!xcodeprojDir) {
      return null;
    }

    // Read project.pbxproj
    const pbxprojPath = path.join(iosDir, xcodeprojDir, 'project.pbxproj');
    if (!fs.existsSync(pbxprojPath)) {
      return null;
    }

    const pbxproj = fs.readFileSync(pbxprojPath, 'utf-8');

    // Look for PRODUCT_BUNDLE_IDENTIFIER
    const match = pbxproj.match(/PRODUCT_BUNDLE_IDENTIFIER\s*=\s*([^;]+);/);
    if (match && match[1]) {
      return match[1].trim().replace(/['"]/g, '');
    }
  } catch (error) {
    // Silently fail
  }

  return null;
}

/**
 * Generate a product ID prefix from app name
 */
export function generateProductPrefix(appName: string): string {
  return appName
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
}

/**
 * Display detected configuration
 */
export function displayDetectedConfig(config: DetectedConfig): void {
  logger.section('📱 Configurazione Rilevata');

  if (!config.detectionSuccess) {
    logger.warning('⚠️  Rilevamento automatico incompleto');
    logger.dim('Sarà necessario fornire alcune informazioni manualmente.\n');
  }

  logger.info(`Nome App: ${config.appName || chalk.dim('non rilevato')}`);
  logger.info(`Bundle ID iOS: ${config.iosBundleId || chalk.dim('non rilevato')}`);
  if (config.detectionDetails.bundleIdSource) {
    logger.dim(`  Fonte: ${config.detectionDetails.bundleIdSource}`);
  }

  logger.info(`Package Name Android: ${config.androidPackageName || chalk.dim('non rilevato')}`);
  if (config.detectionDetails.packageNameSource) {
    logger.dim(`  Fonte: ${config.detectionDetails.packageNameSource}`);
  }

  logger.info(`Platform: ${config.platform || chalk.dim('non rilevato')}`);
  logger.info(`Backend: ${config.backend || chalk.dim('none')}`);

  logger.newline();
}

// Import chalk for dim text
import chalk from 'chalk';
