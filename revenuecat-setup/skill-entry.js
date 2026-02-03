#!/usr/bin/env node

/**
 * RevenueCat Setup Skill Entry Point
 * This file is executed when the /revenuecatsetup command is invoked
 */

const path = require('path');
const { spawn } = require('child_process');

// Get the directory of this script
const skillDir = __dirname;
const mainScript = path.join(skillDir, 'dist', 'index.js');

// Check if compiled files exist
const fs = require('fs');
if (!fs.existsSync(mainScript)) {
  console.error('Error: Compiled files not found. Please run: npm run build');
  process.exit(1);
}

// Execute the main CLI script
const child = spawn('node', [mainScript], {
  stdio: 'inherit',
  cwd: skillDir,
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.error('Error executing RevenueCat Setup CLI:', error);
  process.exit(1);
});
