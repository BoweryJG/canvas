import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const search = event.queryStringParameters?.search || '';
    
    if (search.length < 3) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([])
      };
    }

    // Parse search term - handle variations
    const searchLower = search.toLowerCase().trim();
    const terms = search.trim().split(/\s+/);
    let firstName = terms[0];
    let lastName = terms.length > 1 ? terms[terms.length - 1] : '';
    let state = '';
    let city = '';
    
    // Check if search includes location hints
    if (searchLower.includes('buffalo') || searchLower.includes('ny')) {
      // Extract location if present
      const locationMatch = searchLower.match(/(buffalo|williamsville|west seneca)/);
      if (locationMatch) {
        city = locationMatch[1];
      }
      if (searchLower.includes('ny')) {
        state = 'NY';
      }
    }

    // Build NPI API URL with flexible parameters
    const params = new URLSearchParams({
      version: '2.1',
      limit: '20',  // Increased limit
      first_name: firstName,
      ...(lastName && { last_name: lastName }),
      ...(state && { state: state }),
      ...(city && { city: city })
    });

    const npiResponse = await fetch(
      `https://npiregistry.cms.hhs.gov/api/?${params}`
    );

    if (!npiResponse.ok) {
      throw new Error('NPI API error');
    }

    const data = await npiResponse.json();
    
    // Transform results for easy consumption
    const doctors = (data.results || []).map((result: any) => {
      const basic = result.basic || {};
      // Prefer location address over mailing address
      const locationAddress = result.addresses?.find((a: any) => a.address_purpose === 'LOCATION') || {};
      const mailingAddress = result.addresses?.find((a: any) => a.address_purpose === 'MAILING') || {};
      const address = locationAddress.address_1 ? locationAddress : mailingAddress;
      
      const taxonomy = result.taxonomies?.find((t: any) => t.primary) || {};
      
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
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(doctors)
    };

  } catch (error) {
    console.error('NPI lookup error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to search NPI registry' })
    };
  }
};