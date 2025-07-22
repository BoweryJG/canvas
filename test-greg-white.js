// Test script for Dr. Greg White search logic
import { searchDoctorsByName } from './src/lib/npiLookup.ts';
import { callBraveSearch } from './src/lib/apiEndpoints.ts';

async function testGregWhiteSearch() {
  console.log('🔍 Testing search logic for Dr. Greg White, Buffalo NY...\n');
  
  try {
    // Step 1: Get NPI data
    console.log('STEP 1: NPI Lookup');
    console.log('==================');
    const npiResults = await searchDoctorsByName('Greg White');
    
    // Find the Buffalo dentist
    const gregWhite = npiResults.find(doc => 
      doc.city && doc.city.toLowerCase().includes('buffalo') && 
      doc.specialty && doc.specialty.toLowerCase().includes('dent')
    );
    
    if (!gregWhite) {
      console.log('❌ Could not find Dr. Greg White in Buffalo');
      return;
    }
    
    console.log('✅ Found Dr. Greg White in NPI:');
    console.log('Name:', gregWhite.displayName);
    console.log('Organization:', gregWhite.organizationName || 'None listed');
    console.log('Address:', gregWhite.address);
    console.log('City:', gregWhite.city);
    console.log('State:', gregWhite.state);
    console.log('Specialty:', gregWhite.specialty);
    console.log('Phone:', gregWhite.phone);
    console.log('NPI:', gregWhite.npi);
    
    // Step 2: Build search queries using our logic
    console.log('\n\nSTEP 2: Building Search Queries');
    console.log('================================');
    
    const organizationName = gregWhite.organizationName || '';
    const address = gregWhite.address || '';
    const location = `${gregWhite.city} ${gregWhite.state}`;
    const specialty = gregWhite.specialty || '';
    
    const queries = [];
    
    // PRIORITY 1: Organization name with address (highest confidence)
    if (organizationName && address) {
      queries.push(`"${organizationName}" "${address}"`);
    }
    
    // PRIORITY 2: Organization name with location
    if (organizationName) {
      queries.push(`"${organizationName}" ${location}`);
      queries.push(`"${organizationName}" "Dr. Greg White"`);
      
      // Try direct domain search
      const orgClean = organizationName.toLowerCase().replace(/[^a-z0-9]/g, '');
      queries.push(`site:${orgClean}.com OR site:www.${orgClean}.com`);
    }
    
    // PRIORITY 3: Doctor + address (very specific)
    if (address) {
      queries.push(`"Dr. Greg White" "${address}"`);
    }
    
    // PRIORITY 4: Doctor + location + specialty
    queries.push(`"Dr. Greg White" ${location} ${specialty}`);
    
    // PRIORITY 5: Practice patterns
    queries.push(`"White dental" ${location}`);
    
    console.log('Generated queries:');
    queries.slice(0, 5).forEach((q, i) => {
      console.log(`${i + 1}. ${q}`);
    });
    
    // Step 3: Execute searches
    console.log('\n\nSTEP 3: Executing Searches');
    console.log('==========================');
    
    for (const query of queries.slice(0, 3)) { // Test first 3 queries
      console.log(`\nSearching: "${query}"`);
      try {
        const results = await callBraveSearch(query, 5);
        if (results?.web?.results) {
          console.log(`Found ${results.web.results.length} results:`);
          results.web.results.forEach((result, idx) => {
            console.log(`  ${idx + 1}. ${result.title}`);
            console.log(`     URL: ${result.url}`);
            if (result.url.toLowerCase().includes('puredental')) {
              console.log(`     ⭐ POTENTIAL MATCH: Pure Dental website!`);
            }
          });
        }
      } catch (error) {
        console.log(`  Error: ${error.message}`);
      }
    }
    
    console.log('\n\nSUMMARY');
    console.log('=======');
    console.log('With the NPI data, we should be able to find the practice website');
    console.log('by searching for the organization name + address combination.');
    console.log('This gives us near 100% confidence when the address matches.');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testGregWhiteSearch().catch(console.error);