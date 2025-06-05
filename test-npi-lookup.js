/**
 * Test NPI lookup locally
 */

const fetch = require('node-fetch');

async function testNPILookup() {
  console.log('Testing NPI lookup for Greg White...\n');
  
  // Test direct NPI API
  console.log('1. Testing direct NPI API:');
  const directUrl = 'https://npiregistry.cms.hhs.gov/api/?version=2.1&first_name=Greg&last_name=White&state=NY';
  
  try {
    const response = await fetch(directUrl);
    const data = await response.json();
    console.log(`Found ${data.result_count} results`);
    
    if (data.results && data.results.length > 0) {
      data.results.forEach((doc, idx) => {
        console.log(`\nResult ${idx + 1}:`);
        console.log(`Name: Dr. ${doc.basic.first_name} ${doc.basic.last_name}, ${doc.basic.credential}`);
        console.log(`Specialty: ${doc.taxonomies[0]?.desc}`);
        const location = doc.addresses.find(a => a.address_purpose === 'LOCATION') || doc.addresses[0];
        console.log(`Location: ${location.city}, ${location.state}`);
      });
    }
  } catch (error) {
    console.error('Direct API error:', error.message);
  }
  
  // Test our endpoint (when running locally)
  console.log('\n\n2. Testing our endpoint:');
  console.log('Run: netlify dev');
  console.log('Then visit: http://localhost:8888/.netlify/functions/npi-lookup?search=Greg%20White');
}

testNPILookup();