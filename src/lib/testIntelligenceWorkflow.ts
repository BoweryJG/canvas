/**
 * TEST INTELLIGENCE WORKFLOW
 * Demonstrates the complete 3-step intelligence gathering and content generation system
 */

import { orchestrateIntelligenceWorkflow, formatOrchestrationSummary } from './intelligenceOrchestrator';

/**
 * Test the complete workflow with sample doctors
 */
export async function testIntelligenceWorkflow() {
  console.log('='.repeat(80));
  console.log('INTELLIGENCE WORKFLOW TEST');
  console.log('='.repeat(80));
  
  // Test Case 1: Greg White - Dental Practice
  console.log('\n📋 Test Case 1: Dr. Greg White - Pure Dental');
  const result1 = await orchestrateIntelligenceWorkflow(
    'Greg White',
    'Invisalign G5',
    'Las Vegas, NV',
    'Dentist',
    'Pure Dental',
    undefined,
    {
      name: 'Jason Smith',
      company: 'Align Technology'
    }
  );
  
  console.log('\n' + formatOrchestrationSummary(result1));
  
  if (result1.success && result1.content?.generatedContent) {
    console.log('\n📧 Generated Email:');
    console.log(`Subject: ${result1.content.generatedContent.email.subject}`);
    console.log(`Preview: ${result1.content.generatedContent.email.preheader}`);
    console.log('\n' + result1.content.generatedContent.email.body);
    
    console.log('\n💬 Generated SMS:');
    console.log(result1.content.generatedContent.sms.message);
  }
  
  // Test Case 2: Different specialty
  console.log('\n' + '='.repeat(80));
  console.log('\n📋 Test Case 2: Dr. Sarah Johnson - Dermatology');
  const result2 = await orchestrateIntelligenceWorkflow(
    'Sarah Johnson',
    'CoolSculpting Elite',
    'Miami, FL',
    'Dermatologist',
    undefined,
    undefined,
    {
      name: 'Mike Chen',
      company: 'Allergan Aesthetics'
    }
  );
  
  console.log('\n' + formatOrchestrationSummary(result2));
  
  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));
  console.log(`Test 1 (Dr. White): ${result1.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Test 2 (Dr. Johnson): ${result2.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  // Performance metrics
  if (result1.success) {
    console.log(`\nPerformance (Dr. White):`);
    console.log(`- Total time: ${(result1.totalTimeElapsed / 1000).toFixed(1)}s`);
    console.log(`- Data points: ${result1.intelligence?.dataPoints || 0}`);
    console.log(`- Match score: ${result1.content?.matchScore || 0}%`);
  }
  
  if (result2.success) {
    console.log(`\nPerformance (Dr. Johnson):`);
    console.log(`- Total time: ${(result2.totalTimeElapsed / 1000).toFixed(1)}s`);
    console.log(`- Data points: ${result2.intelligence?.dataPoints || 0}`);
    console.log(`- Match score: ${result2.content?.matchScore || 0}%`);
  }
}

/**
 * Run a single test with detailed output
 */
export async function testSingleDoctor(
  doctorName: string,
  productName: string,
  location?: string,
  specialty?: string,
  practiceName?: string
) {
  console.log(`\n🔬 Testing Intelligence Workflow for Dr. ${doctorName}`);
  console.log(`Product: ${productName}`);
  console.log(`Location: ${location || 'Not specified'}`);
  console.log(`Specialty: ${specialty || 'Not specified'}`);
  console.log(`Practice: ${practiceName || 'Not specified'}`);
  console.log('-'.repeat(60));
  
  const result = await orchestrateIntelligenceWorkflow(
    doctorName,
    productName,
    location,
    specialty,
    practiceName,
    undefined,
    {
      name: 'Test Rep',
      company: 'Test Company'
    }
  );
  
  // Detailed output
  if (result.discovery?.websiteFound) {
    console.log('\n🌐 WEBSITE DISCOVERY:');
    console.log(`URL: ${result.discovery.websiteUrl}`);
    console.log(`Confidence: ${result.discovery.confidence}%`);
    console.log(`Method: ${result.discovery.discoveryMethod}`);
    console.log(`Time: ${result.discovery.timeElapsed}ms`);
  }
  
  if (result.intelligence?.websiteData) {
    console.log('\n📊 EXTRACTED INTELLIGENCE:');
    const data = result.intelligence.websiteData;
    console.log(`Title: ${data.title}`);
    console.log(`Services: ${data.services.length} found`);
    console.log(`Tech Stack: ${JSON.stringify(data.techStack, null, 2)}`);
    console.log(`Social Media: ${JSON.stringify(data.socialMedia, null, 2)}`);
    console.log(`Pain Points: ${data.painPoints?.join(', ') || 'None identified'}`);
    console.log(`Team Size: ${data.practiceInfo?.teamSize || 'Unknown'}`);
  }
  
  if (result.content?.productIntelligence) {
    console.log('\n🎯 PRODUCT INTELLIGENCE:');
    const intel = result.content.productIntelligence;
    console.log(`Match Score: ${intel.matchScore}%`);
    console.log(`ROI Timeline: ${intel.roiCalculation.timeToROI}`);
    console.log(`Patient Volume Increase: ${intel.roiCalculation.patientVolumeIncrease}`);
    console.log(`Integration Opportunities: ${intel.integrationOpportunities.join(', ')}`);
    console.log(`Personalized Benefits:`);
    intel.personalizedBenefits.forEach((benefit, i) => {
      console.log(`  ${i + 1}. ${benefit}`);
    });
  }
  
  if (result.content?.generatedContent) {
    console.log('\n✉️  GENERATED CONTENT:');
    console.log('\nEmail:');
    console.log(`Subject: ${result.content.generatedContent.email.subject}`);
    console.log(`Body Preview: ${result.content.generatedContent.email.body.substring(0, 200)}...`);
    
    console.log('\nSMS:');
    console.log(result.content.generatedContent.sms.message);
    
    if (result.content.generatedContent.linkedin) {
      console.log('\nLinkedIn:');
      console.log(`Connection: ${result.content.generatedContent.linkedin.connectionRequest}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(formatOrchestrationSummary(result));
  
  return result;
}

// Example usage:
// await testIntelligenceWorkflow();
// await testSingleDoctor('Greg White', 'Invisalign G5', 'Las Vegas, NV', 'Dentist', 'Pure Dental');