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

    // Parse search term
    const terms = search.trim().split(/\s+/);
    const firstName = terms[0];
    const lastName = terms.length > 1 ? terms[terms.length - 1] : '';

    // Build NPI API URL
    const params = new URLSearchParams({
      version: '2.1',
      limit: '10',
      first_name: firstName,
      ...(lastName && { last_name: lastName })
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
      const address = result.addresses?.[0] || {};
      const taxonomy = result.taxonomies?.find((t: any) => t.primary) || {};
      
      return {
        npi: result.number,
        displayName: `Dr. ${basic.first_name} ${basic.last_name}${basic.credential ? ', ' + basic.credential : ''}`,
        firstName: basic.first_name,
        lastName: basic.last_name,
        credential: basic.credential,
        specialty: taxonomy.desc || 'Not specified',
        city: address.city,
        state: address.state,
        fullAddress: `${address.address_1}, ${address.city}, ${address.state} ${address.postal_code}`,
        phone: address.telephone_number,
        organizationName: basic.organization_name
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