#!/usr/bin/env node

/**
 * Direct test of NPI API to verify it's working
 */

import fetch from 'node-fetch';

async function testNPIDirectly() {
  console.log('🔍 Testing NPI API directly...\n');
  
  const searches = [
    { name: 'Greg White', state: 'NY' },
    { name: 'John Smith', state: 'CA' },
    { name: 'Sarah Johnson', state: '' }
  ];
  
  for (const search of searches) {
    console.log(`\n🏥 Searching for: ${search.name}${search.state ? ' in ' + search.state : ''}`);
    console.log('─'.repeat(50));
    
    const params = new URLSearchParams({
      version: '2.1',
      limit: '10'
    });
    
    // Parse name
    const [firstName, ...lastNameParts] = search.name.split(' ');
    const lastName = lastNameParts.join(' ');
    
    if (firstName) params.append('first_name', firstName);
    if (lastName) params.append('last_name', lastName);
    if (search.state) params.append('state', search.state);
    
    const url = `https://npiregistry.cms.hhs.gov/api/?${params}`;
    console.log(`URL: ${url}`);
    
    const startTime = Date.now();
    
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; TestScript/1.0)'
        }
      });
      
      const responseTime = Date.now() - startTime;
      console.log(`Response time: ${responseTime}ms`);
      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`Results found: ${data.result_count || 0}`);
        
        if (data.results && data.results.length > 0) {
          console.log('\nFirst 3 results:');
          data.results.slice(0, 3).forEach((doc, idx) => {
            const basic = doc.basic || {};
            const address = doc.addresses?.find(a => a.address_purpose === 'LOCATION') || {};
            const taxonomy = doc.taxonomies?.find(t => t.primary) || {};
            
            console.log(`\n${idx + 1}. Dr. ${basic.first_name} ${basic.last_name}${basic.credential ? ', ' + basic.credential : ''}`);
            console.log(`   NPI: ${doc.number}`);
            console.log(`   Specialty: ${taxonomy.desc || 'Not specified'}`);
            console.log(`   Location: ${address.city || 'Unknown'}, ${address.state || 'Unknown'}`);
          });
        }
      } else {
        const errorText = await response.text();
        console.error(`API Error: ${errorText}`);
      }
    } catch (error) {
      console.error(`Network Error: ${error.message}`);
      console.error(`This might indicate the API is down or there's a connection issue`);
    }
  }
  
  console.log('\n\n✅ Test complete!');
  console.log('If searches took > 10 seconds, the NPI API might be slow today.');
  console.log('If all searches failed, there might be a network or API issue.');
}

// Run the test
testNPIDirectly().catch(console.error);