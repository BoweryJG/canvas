/**
 * Script to fix all optional property access errors
 * This generates sed commands to add optional chaining
 */

const files = [
  {
    path: 'src/lib/enhancedEmailTemplates.ts',
    fixes: [
      { from: 'productIntel.marketData.awareness', to: 'productIntel?.marketData?.awareness' },
      { from: 'doctorIntel.salesStrategy.objectionHandlers', to: 'doctorIntel?.salesStrategy?.objectionHandlers' },
      { from: 'productIntel.competitiveLandscape.marketShare', to: 'productIntel?.competitiveLandscape?.marketShare' },
      { from: 'productIntel.marketData.limitedTimeOffers.length', to: 'productIntel?.marketData?.limitedTimeOffers?.length' },
      { from: 'productIntel.marketData.adoptionRate', to: 'productIntel?.marketData?.adoptionRate' },
      { from: 'productIntel.competitiveLandscape', to: 'productIntel?.competitiveLandscape' }
    ]
  },
  {
    path: 'src/lib/superIntelligentDoctorResearch.ts',
    fixes: [
      { from: 'doctor: {},', to: "doctor: '' as string," },
      { from: 'product: {},', to: "product: '' as string," },
      { from: 'insights: {},', to: 'insights: [] as string[],' },
      { from: 'keyPoints: {},', to: 'keyPoints: [] as string[],' }
    ]
  }
];

// Generate bash script
console.log('#!/bin/bash\n');
console.log('# Auto-generated script to fix optional property access\n');

files.forEach(file => {
  console.log(`# Fixing ${file.path}`);
  file.fixes.forEach(fix => {
    // Escape dots and other special characters for sed
    const escapedFrom = fix.from.replace(/\./g, '\\.');
    const escapedTo = fix.to.replace(/\./g, '\\.');
    console.log(`sed -i '' 's/${escapedFrom}/${escapedTo}/g' ${file.path}`);
  });
  console.log('');
});

console.log('echo "✅ Optional property fixes applied"');