const https = require('https');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test the NPI API with different search variations
async function testNPIAPI(firstName, lastName) {
  return new Promise((resolve, reject) => {
    const url = `https://npiregistry.cms.hhs.gov/api/?version=2.1&first_name=${firstName}&last_name=${lastName}&limit=5`;
    
    log(`\n📡 Testing: ${firstName} ${lastName}`, 'cyan');
    log(`URL: ${url}`, 'blue');
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          log(`✅ Status: ${res.statusCode}`, 'green');
          log(`📊 Results found: ${json.result_count}`, 'yellow');
          
          if (json.results && json.results.length > 0) {
            log('\n👥 Doctors found:', 'bright');
            json.results.forEach((doc, idx) => {
              const basic = doc.basic || {};
              const taxonomy = (doc.taxonomies || []).find(t => t.primary) || {};
              const address = (doc.addresses || []).find(a => a.address_purpose === 'LOCATION') || {};
              
              console.log(`\n  ${idx + 1}. ${basic.first_name} ${basic.last_name}${basic.credential ? ', ' + basic.credential : ''}`);
              console.log(`     NPI: ${doc.number}`);
              console.log(`     Specialty: ${taxonomy.desc || 'Not specified'}`);
              console.log(`     Location: ${address.city || 'N/A'}, ${address.state || 'N/A'}`);
            });
          } else {
            log('❌ No results found', 'red');
          }
          
          resolve(json);
        } catch (error) {
          log(`❌ Parse error: ${error.message}`, 'red');
          reject(error);
        }
      });
    }).on('error', (error) => {
      log(`❌ Request error: ${error.message}`, 'red');
      reject(error);
    });
  });
}

// Test our Netlify function transformation logic
function transformNPIResult(result) {
  const basic = result.basic || {};
  const locationAddress = result.addresses?.find((a) => a.address_purpose === 'LOCATION') || {};
  const mailingAddress = result.addresses?.find((a) => a.address_purpose === 'MAILING') || {};
  const address = locationAddress.address_1 ? locationAddress : mailingAddress;
  const taxonomy = result.taxonomies?.find((t) => t.primary) || {};
  
  // Format name properly
  const formattedFirstName = basic.first_name
    ? basic.first_name.charAt(0).toUpperCase() + basic.first_name.slice(1).toLowerCase()
    : '';
  const formattedLastName = basic.last_name
    ? basic.last_name.charAt(0).toUpperCase() + basic.last_name.slice(1).toLowerCase()
    : '';
  
  return {
    npi: result.number,
    displayName: `Dr. ${formattedFirstName} ${formattedLastName}${basic.credential ? ', ' + basic.credential : ''}`,
    firstName: formattedFirstName,
    lastName: formattedLastName,
    credential: basic.credential || '',
    specialty: taxonomy.desc || 'Not specified',
    city: address.city || '',
    state: address.state || '',
    fullAddress: address.address_1 
      ? `${address.address_1}, ${address.city}, ${address.state} ${address.postal_code}`
      : '',
    phone: address.telephone_number || '',
    organizationName: basic.organization_name || ''
  };
}

// Main test function
async function runTests() {
  log('\n🔍 NPI API Test Suite\n', 'bright');
  log('=' .repeat(50), 'cyan');
  
  // Test variations
  const testCases = [
    { first: 'Greg', last: 'White' },
    { first: 'Gregory', last: 'White' },
    { first: 'G', last: 'White' },
    { first: 'greg', last: 'white' },  // Test case sensitivity
    { first: 'GREG', last: 'WHITE' }   // Test uppercase
  ];
  
  for (const testCase of testCases) {
    try {
      const result = await testNPIAPI(testCase.first, testCase.last);
      
      // If we found results, test the transformation
      if (result.results && result.results.length > 0) {
        log('\n🔄 Testing transformation:', 'magenta');
        const transformed = transformNPIResult(result.results[0]);
        console.log(JSON.stringify(transformed, null, 2));
      }
      
    } catch (error) {
      log(`Failed: ${error.message}`, 'red');
    }
    
    log('\n' + '-'.repeat(50), 'cyan');
  }
  
  // Provide debugging tips
  log('\n💡 Debugging Tips:', 'yellow');
  log('1. If no results for "Greg White", the API might not have this specific doctor', 'reset');
  log('2. Try searching for common names like "John Smith" to verify API works', 'reset');
  log('3. Check if the API requires exact name matches or supports partial matches', 'reset');
  log('4. The API might be case-sensitive or require specific formatting', 'reset');
  log('\n📝 Next Steps:', 'green');
  log('1. Open test-npi-debug.html in your browser for interactive testing', 'reset');
  log('2. Run "netlify dev" and test the function at http://localhost:8888/.netlify/functions/npi-lookup?search=Greg%20White', 'reset');
  log('3. Check browser console for any CORS or network errors', 'reset');
  log('4. Verify the Netlify function is properly deployed and accessible', 'reset');
}

// Run the tests
runTests();