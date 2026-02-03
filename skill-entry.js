#!/usr/bin/env node

/**
 * RevenueCat Setup Skill Entry Point
 * This file is executed when the /revenuecat-setup command is invoked
 */

const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Get the directory of this script
const skillDir = __dirname;
const runScript = path.join(skillDir, 'run.sh');
const mainScript = path.join(skillDir, 'dist', 'index.js');

// Check if compiled files exist
if (!fs.existsSync(mainScript)) {
  console.error('Error: Compiled files not found. Please run: npm run build');
  process.exit(1);
}

// Check if we should use the wrapper script or run directly
if (fs.existsSync(runScript)) {
  // Use run.sh wrapper (handles API key from env)
  const child = spawn('bash', [runScript], {
    stdio: 'inherit',
    cwd: process.cwd(), // Use current working directory, not skill directory
    env: process.env,
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });

  child.on('error', (error) => {
    console.error('Error executing RevenueCat Setup:', error);
    process.exit(1);
  });
} else {
  // Fallback: run directly with auto mode
  const child = spawn('node', [mainScript, '--auto'], {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: process.env,
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });

  child.on('error', (error) => {
    console.error('Error executing RevenueCat Setup CLI:', error);
    process.exit(1);
  });
}
