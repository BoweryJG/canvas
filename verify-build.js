#!/usr/bin/env node

// Simple build verification script to ensure dist folder exists
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

console.log('Verifying build output...');

// Check if dist folder exists
if (!fs.existsSync(distPath)) {
  console.error('❌ Error: dist folder not found');
  process.exit(1);
}

// Check if index.html exists
if (!fs.existsSync(indexPath)) {
  console.error('❌ Error: dist/index.html not found');
  process.exit(1);
}

// Get dist folder stats
const stats = fs.readdirSync(distPath);
console.log(`✅ Build successful! Found ${stats.length} items in dist folder`);

// List assets folder if it exists
const assetsPath = path.join(distPath, 'assets');
if (fs.existsSync(assetsPath)) {
  const assets = fs.readdirSync(assetsPath);
  console.log(`✅ Found ${assets.length} files in assets folder`);
}

console.log('✅ Build verification complete');
process.exit(0);