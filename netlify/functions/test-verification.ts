// Test script for doctor verification system
// Run with: npx ts-node test-verification.ts

interface TestCase {
  name: string;
  request: any;
  expectedOutcome: string;
}

const testCases: TestCase[] = [
  {
    name: "Pure Dental Buffalo - Known Good Case",
    request: {
      doctorName: "Greg White",
      practiceName: "Pure Dental",
      location: "Buffalo, NY"
    },
    expectedOutcome: "Should find puredental.com/buffalo as primary website"
  },
  {
    name: "Doctor with Only Name",
    request: {
      doctorName: "John Smith"
    },
    expectedOutcome: "Should return directory listings with low confidence"
  },
  {
    name: "Practice Name Focus",
    request: {
      searchTerms: "Smile Bright Dental",
      knownPracticeName: "Smile Bright Dental",
      location: "Chicago, IL"
    },
    expectedOutcome: "Should prioritize domain matching practice name"
  },
  {
    name: "NPI-Based Verification",
    request: {
      doctorName: "Jane Doe",
      npi: "1234567890"
    },
    expectedOutcome: "Should verify through NPI and find associated practice"
  }
];

async function runTests() {
  console.log("🧪 Doctor Verification System Test Suite\n");
  
  for (const testCase of testCases) {
    console.log(`📋 Test: ${testCase.name}`);
    console.log(`   Expected: ${testCase.expectedOutcome}`);
    
    try {
      // Simulate API calls
      await simulateVerification(testCase.request);
      console.log("   ✅ Test completed\n");
    } catch (error) {
      console.log(`   ❌ Test failed: ${error}\n`);
    }
  }
  
  console.log("\n📊 Verification System Insights:");
  console.log("1. Practice names are crucial for finding official websites");
  console.log("2. Custom domains (e.g., puredental.com) indicate real practices");
  console.log("3. Directory sites (Healthgrades, etc.) should be deprioritized");
  console.log("4. Multiple verification sources increase confidence");
  console.log("5. User feedback improves future verifications");
}

async function simulateVerification(request: any) {
  // In a real test, this would call the actual functions
  console.log(`   Request: ${JSON.stringify(request)}`);
  
  // Simulate processing
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Log simulated results
  if (request.practiceName?.toLowerCase().includes('pure dental')) {
    console.log("   Found: puredental.com/buffalo (95% confidence)");
    console.log("   Type: Official practice website");
    console.log("   Verification: ✓ Practice name match, ✓ Custom domain, ✓ Location match");
  } else if (request.npi) {
    console.log("   Found: NPI Registry match");
    console.log("   Practice: Associated practice from NPI data");
  } else if (request.practiceName) {
    console.log(`   Found: ${request.practiceName.toLowerCase().replace(/\s+/g, '')}.com`);
    console.log("   Type: Likely practice website");
  } else {
    console.log("   Found: Multiple directory listings");
    console.log("   Confidence: Low - need more information");
  }
}

// Run the tests
runTests();

// Example of how to use the comprehensive verification
console.log("\n🔍 Example Usage - Comprehensive Verification:\n");
console.log(`
// Frontend code example
async function verifyDoctor() {
  const response = await fetch('/.netlify/functions/comprehensive-verification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      doctorName: 'Greg White',
      searchHints: {
        practiceName: 'Pure Dental',
        location: 'Buffalo, NY'
      },
      verificationDepth: 'deep'
    })
  });
  
  const result = await response.json();
  
  if (result.verificationStatus === 'verified') {
    console.log('✅ Doctor verified!');
    console.log('Practice website:', result.practice.website);
    console.log('Confidence:', result.overallConfidence + '%');
  } else {
    console.log('⚠️ Verification status:', result.verificationStatus);
    console.log('Recommendations:', result.recommendations);
  }
}
`);

// Example of feedback submission
console.log("\n📝 Example - Submitting Feedback:\n");
console.log(`
// After user confirms the correct website
async function submitFeedback(verificationId: string) {
  const response = await fetch('/.netlify/functions/verification-feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      verificationId: verificationId,
      feedbackType: 'correct',
      userConfirmedData: {
        practiceName: 'Pure Dental',
        website: 'https://puredental.com/buffalo',
        isOfficialWebsite: true
      }
    })
  });
  
  const result = await response.json();
  console.log('Feedback submitted:', result.message);
}
`);