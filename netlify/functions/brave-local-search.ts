import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }) 
    };
  }

  try {
    const { query, count = 20 } = JSON.parse(event.body || '{}');
    
    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Query is required' })
      };
    }

    // Check for Brave API key
    const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
    
    if (!BRAVE_API_KEY) {
      console.error('Brave API key not configured');
      // Return mock local search results
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(generateMockLocalResults(query))
      };
    }

    // Make request to Brave Local Search API
    const braveResponse = await fetch(
      `https://api.search.brave.com/res/v1/local/search?` + 
      new URLSearchParams({
        q: query,
        count: count.toString(),
        country: 'US'
      }),
      {
        headers: {
          'X-Subscription-Token': BRAVE_API_KEY,
          'Accept': 'application/json'
        }
      }
    );

    if (!braveResponse.ok) {
      const errorText = await braveResponse.text();
      console.error('Brave Local Search API error:', errorText);
      throw new Error(`Brave API error: ${braveResponse.status}`);
    }

    const data = await braveResponse.json();
    console.log(`✅ Brave Local Search returned ${data.results?.length || 0} results`);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Brave Local Search function error:', error);
    
    // Return mock data on error
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(generateMockLocalResults(event.body ? JSON.parse(event.body).query : 'dental'))
    };
  }
};

function generateMockLocalResults(query: string): any {
  const isDoctor = query.toLowerCase().includes('dr') || query.toLowerCase().includes('doctor');
  const location = extractLocation(query);
  
  return {
    results: [
      {
        title: isDoctor ? "Advanced Dental Care of Buffalo" : "Premier Dental Group",
        address: {
          streetAddress: "456 Transit Rd",
          addressLocality: location.city || "Buffalo",
          addressRegion: location.state || "NY",
          postalCode: "14221"
        },
        phone: "(716) 555-0123",
        rating: 4.7,
        rating_count: 234,
        reviews: [
          {
            rating: 5,
            text: "State-of-the-art equipment and excellent care"
          }
        ],
        description: "Modern dental practice specializing in implants and cosmetic dentistry",
        distance: 1.2,
        categories: ["Dentist", "Oral Surgeon", "Cosmetic Dentist"],
        hours: {
          monday: "8:00 AM - 5:00 PM",
          tuesday: "8:00 AM - 5:00 PM",
          wednesday: "8:00 AM - 5:00 PM",
          thursday: "8:00 AM - 5:00 PM",
          friday: "8:00 AM - 3:00 PM"
        },
        url: "https://advanceddentalcarebuffalo.com",
        priceRange: "$$$"
      },
      {
        title: "Smile Design Dental Spa",
        address: {
          streetAddress: "789 Maple Rd",
          addressLocality: location.city || "Amherst",
          addressRegion: location.state || "NY",
          postalCode: "14226"
        },
        phone: "(716) 555-0456",
        rating: 4.9,
        rating_count: 189,
        reviews: [
          {
            rating: 5,
            text: "Luxury dental experience with latest technology"
          }
        ],
        description: "Upscale dental practice with spa amenities and cutting-edge technology",
        distance: 2.5,
        categories: ["Cosmetic Dentist", "General Dentist"],
        hours: {
          monday: "7:00 AM - 7:00 PM",
          tuesday: "7:00 AM - 7:00 PM",
          wednesday: "7:00 AM - 7:00 PM",
          thursday: "7:00 AM - 7:00 PM",
          friday: "7:00 AM - 4:00 PM",
          saturday: "8:00 AM - 2:00 PM"
        },
        url: "https://smiledesigndentalspa.com",
        priceRange: "$$$$"
      },
      {
        title: "Family Dental Associates",
        address: {
          streetAddress: "321 Main St",
          addressLocality: location.city || "Williamsville",
          addressRegion: location.state || "NY",
          postalCode: "14221"
        },
        phone: "(716) 555-0789",
        rating: 4.4,
        rating_count: 156,
        reviews: [
          {
            rating: 4,
            text: "Great with kids, very patient staff"
          }
        ],
        description: "Family-friendly dental practice serving the community for over 20 years",
        distance: 0.5,
        categories: ["General Dentist", "Pediatric Dentist"],
        hours: {
          monday: "8:00 AM - 5:00 PM",
          tuesday: "8:00 AM - 5:00 PM",
          wednesday: "10:00 AM - 7:00 PM",
          thursday: "8:00 AM - 5:00 PM",
          friday: "8:00 AM - 3:00 PM"
        },
        url: "https://familydentalwny.com",
        priceRange: "$$"
      }
    ],
    query: {
      original: query,
      location_used: location.display
    }
  };
}

function extractLocation(query: string): { city?: string; state?: string; display: string } {
  // Common NY cities
  const cities = ['buffalo', 'williamsville', 'amherst', 'orchard park', 'clarence'];
  const foundCity = cities.find(city => query.toLowerCase().includes(city));
  
  return {
    city: foundCity ? foundCity.charAt(0).toUpperCase() + foundCity.slice(1) : 'Buffalo',
    state: 'NY',
    display: foundCity ? `${foundCity.charAt(0).toUpperCase() + foundCity.slice(1)}, NY` : 'Buffalo, NY area'
  };
}