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
    console.log(`[NPI Lookup] Search query: "${search}"`);
    
    if (search.length < 3) {
      console.log('[NPI Lookup] Query too short, returning empty array');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([])
      };
    }

    // Parse search term - handle variations
    const searchLower = search.toLowerCase().trim();
    const terms = search.trim().split(/\s+/);
    
    // Extract name and location parts
    let nameTerms: string[] = [];
    let locationTerms: string[] = [];
    let foundLocation = false;
    
    // Location keywords for Buffalo area
    const buffaloAreaKeywords = ['buffalo', 'williamsville', 'amherst', 'clarence', 'cheektowaga', 'tonawanda', 'orchard park', 'ny', 'new york'];
    const dentalKeywords = ['dental', 'dentist', 'oral', 'surgeon', 'dds', 'dmd'];
    
    // Parse terms to separate name from location
    for (let i = 0; i < terms.length; i++) {
      const term = terms[i].toLowerCase();
      
      // Check if this term or combination with next term is a location
      if (buffaloAreaKeywords.includes(term) || 
          (i < terms.length - 1 && buffaloAreaKeywords.includes(`${term} ${terms[i + 1].toLowerCase()}`))) {
        foundLocation = true;
      }
      
      // Skip dental keywords in name extraction
      if (dentalKeywords.includes(term)) {
        continue;
      }
      
      if (!foundLocation && !buffaloAreaKeywords.includes(term)) {
        nameTerms.push(terms[i]);
      } else {
        locationTerms.push(terms[i]);
      }
    }
    
    // Extract first and last name
    let firstName = nameTerms[0] || '';
    let lastName = nameTerms.length > 1 ? nameTerms[nameTerms.length - 1] : '';
    
    // Handle special cases like "Dr. Greg White"
    if (firstName.toLowerCase() === 'dr' || firstName.toLowerCase() === 'dr.') {
      firstName = nameTerms[1] || '';
      lastName = nameTerms.length > 2 ? nameTerms[nameTerms.length - 1] : '';
    }
    
    // Set state for Buffalo area searches
    let state = '';
    if (searchLower.includes('buffalo') || searchLower.includes('williamsville') || 
        searchLower.includes('amherst') || searchLower.includes('ny')) {
      state = 'NY';
    }
    
    // For dental specialties, include taxonomy codes
    let taxonomyParams: Record<string, string> = {};
    if (searchLower.includes('oral surgeon') || searchLower.includes('oral surgery')) {
      taxonomyParams['taxonomy_description'] = 'Oral';
    } else if (searchLower.includes('dentist') || searchLower.includes('dental')) {
      taxonomyParams['taxonomy_description'] = 'Dentist';
    }

    // Build NPI API URL with flexible parameters
    const params = new URLSearchParams({
      version: '2.1',
      limit: '50',  // Increased limit to capture more results
      ...(firstName && { first_name: firstName }),
      ...(lastName && { last_name: lastName }),
      ...(state && { state: state }),
      ...taxonomyParams
    });
    
    console.log(`[NPI Lookup] API params:`, params.toString());
    console.log(`[NPI Lookup] firstName: "${firstName}", lastName: "${lastName}", state: "${state}"`);

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    const npiResponse = await fetch(
      `https://npiregistry.cms.hhs.gov/api/?${params}`,
      { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; CanvasApp/1.0)'
        }
      }
    );
    
    clearTimeout(timeoutId);

    if (!npiResponse.ok) {
      console.error(`[NPI Lookup] API error: ${npiResponse.status} ${npiResponse.statusText}`);
      throw new Error(`NPI API error: ${npiResponse.status}`);
    }

    const data = await npiResponse.json();
    console.log(`[NPI Lookup] API returned ${data.result_count || 0} results`);
    
    // Define priority specialties for dental/aesthetic focus
    const prioritySpecialties = [
      'oral & maxillofacial surgery',
      'oral and maxillofacial surgery',
      'oral surgeon',
      'dentist',
      'general practice dentistry',
      'prosthodontics',
      'periodontics',
      'endodontics',
      'orthodontics',
      'pediatric dentistry',
      'plastic surgery',
      'dermatology',
      'cosmetic surgery',
      'facial plastic surgery'
    ];
    
    // Transform and filter results
    let doctors = (data.results || []).map((result: any) => {
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
        organizationName: basic.organization_name || '',
        isPriority: false,
        relevanceScore: 0
      };
    });
    
    // Calculate relevance scores and filter
    doctors = doctors.map((doctor: any) => {
      let score = 0;
      const specialtyLower = doctor.specialty.toLowerCase();
      
      // Check if specialty matches priority list
      const isPriority = prioritySpecialties.some(ps => 
        specialtyLower.includes(ps.toLowerCase())
      );
      
      if (isPriority) {
        score += 100;
        doctor.isPriority = true;
      }
      
      // Boost score for exact name matches
      if (firstName && doctor.firstName.toLowerCase() === firstName.toLowerCase()) {
        score += 50;
      }
      if (lastName && doctor.lastName.toLowerCase() === lastName.toLowerCase()) {
        score += 50;
      }
      
      // Boost score for Buffalo area locations
      const cityLower = doctor.city.toLowerCase();
      if (cityLower.includes('buffalo') || cityLower.includes('williamsville') ||
          cityLower.includes('amherst') || cityLower.includes('clarence')) {
        score += 25;
      }
      
      // Boost for specific searched specialties
      if (searchLower.includes('oral surgeon') && specialtyLower.includes('oral')) {
        score += 50;
      }
      if (searchLower.includes('dentist') && specialtyLower.includes('dent')) {
        score += 30;
      }
      
      doctor.relevanceScore = score;
      return doctor;
    });
    
    // Sort by relevance score (highest first)
    doctors.sort((a: any, b: any) => b.relevanceScore - a.relevanceScore);
    
    // Remove non-relevant results if we have enough priority ones
    const priorityDoctors = doctors.filter((d: any) => d.isPriority);
    if (priorityDoctors.length >= 5) {
      doctors = priorityDoctors;
    }
    
    // Limit results to top 20 most relevant
    doctors = doctors.slice(0, 20);
    
    // Remove internal scoring fields before returning
    doctors = doctors.map((d: any) => {
      const { isPriority, relevanceScore, ...cleanDoctor } = d;
      return cleanDoctor;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(doctors)
    };

  } catch (error: any) {
    console.error('[NPI Lookup] Error:', error.message || error);
    console.error('[NPI Lookup] Stack:', error.stack);
    
    // Handle timeout specifically
    if (error.name === 'AbortError') {
      return {
        statusCode: 504,
        headers,
        body: JSON.stringify({ error: 'NPI API request timed out after 8 seconds' })
      };
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to search NPI registry',
        details: error.message || 'Unknown error'
      })
    };
  }
};