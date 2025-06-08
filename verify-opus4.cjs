#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Claude Opus 4 Configuration\n');

// Files to check
const filesToCheck = [
  {
    path: './src/lib/apiEndpoints.ts',
    name: 'Frontend API Endpoints',
    pattern: /model.*=.*['"]([^'"]+)['"]/g
  },
  {
    path: './netlify/functions/openrouter.ts',
    name: 'Netlify Function',
    pattern: /model.*=.*['"]([^'"]+)['"]/g
  },
  {
    path: '../osbackend-canvas/research-routes.js',
    name: 'Backend Routes',
    pattern: /model.*=.*['"]([^'"]+)['"]/g
  }
];

let allOpus4 = true;

filesToCheck.forEach(file => {
  const fullPath = path.resolve(file.path);
  
  if (fs.existsSync(fullPath)) {
    console.log(`\n✅ ${file.name} (${file.path}):`);
    const content = fs.readFileSync(fullPath, 'utf8');
    
    const matches = [...content.matchAll(file.pattern)];
    if (matches.length > 0) {
      matches.forEach(match => {
        const model = match[1];
        const isOpus4 = model.includes('opus-4');
        console.log(`   Model: ${model} ${isOpus4 ? '✓' : '❌ NOT OPUS 4!'}`);
        if (!isOpus4 && !model.includes('instant')) {
          allOpus4 = false;
        }
      });
    } else {
      console.log('   No model defaults found');
    }
  } else {
    console.log(`\n❌ ${file.name} - File not found: ${file.path}`);
  }
});

console.log('\n' + '='.repeat(50));
if (allOpus4) {
  console.log('✅ All files are correctly configured to use Claude Opus 4!');
} else {
  console.log('❌ Some files still have old Claude 3 models!');
}

// Check for any remaining claude-3 references
console.log('\n🔍 Checking for any remaining Claude 3 references:');
const claudeRefs = [];
['./src', './netlify', '../osbackend-canvas'].forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir, { recursive: true });
    files.forEach(file => {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        const content = fs.readFileSync(path.join(dir, file), 'utf8');
        if (content.includes('claude-3') && !content.includes('claude-3.5')) {
          claudeRefs.push(path.join(dir, file));
        }
      }
    });
  }
});

if (claudeRefs.length > 0) {
  console.log('Found Claude 3 references in:');
  claudeRefs.forEach(file => console.log(`  - ${file}`));
} else {
  console.log('✅ No Claude 3 references found!');
}