const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Canvas Scraper Service Running (Lightweight Version)' });
});

// Main scraping endpoint
app.post('/scrape', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  try {
    console.log(`🕷️ Scraping: ${url}`);
    
    // Fetch the HTML with better browser mimicking
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 30000,
      maxRedirects: 5,
      validateStatus: (status) => status < 500
    });
    
    const $ = cheerio.load(response.data);
    const bodyText = $('body').text();
    
    // Extract data
    const data = {
      title: $('title').text() || '',
      metaDescription: $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || '',
      phones: extractPhones(bodyText),
      emails: extractEmails(bodyText),
      services: extractServices(bodyText),
      technologies: extractTechnologies(bodyText),
      socialLinks: extractSocialLinks($),
      staff: extractStaff(bodyText),
      address: extractAddress(bodyText),
      hours: extractHours(bodyText),
      focusAreas: extractFocusAreas(bodyText),
      headers: {
        h1s: $('h1').map((i, el) => $(el).text().trim()).get(),
        h2s: $('h2').map((i, el) => $(el).text().trim()).get()
      },
      rawText: bodyText.substring(0, 5000)
    };
    
    console.log(`✅ Successfully scraped ${url}`);
    
    res.json({
      success: true,
      url,
      data,
      screenshot: null // No screenshot with lightweight scraper
    });
    
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Helper functions
function extractPhones(text) {
  const phoneRegex = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  return [...new Set(text.match(phoneRegex) || [])];
}

function extractEmails(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return [...new Set(text.match(emailRegex) || [])]
    .filter(e => !e.includes('example.com'));
}

function extractServices(text) {
  const serviceKeywords = [
    'implants', 'dental implants', 'surgery', 'extraction', 
    'crown', 'bridge', 'cleaning', 'whitening', 'orthodontics',
    'periodontics', 'endodontics', 'prosthodontics', 'cosmetic',
    'veneers', 'root canal', 'invisalign', 'braces', 'dentures'
  ];
  return serviceKeywords.filter(service => 
    text.toLowerCase().includes(service)
  );
}

function extractTechnologies(text) {
  const techKeywords = [
    'YOMI', 'robotic', 'digital', 'CAD/CAM', 'CEREC',
    'cone beam', 'CBCT', 'laser', '3D', 'intraoral scanner',
    'iTero', 'digital x-ray', 'panoramic'
  ];
  return techKeywords.filter(tech => 
    text.toLowerCase().includes(tech.toLowerCase())
  );
}

function extractSocialLinks($) {
  const socialLinks = {};
  
  $('a[href*="facebook.com"]').each((i, el) => {
    socialLinks.facebook = $(el).attr('href');
  });
  
  $('a[href*="instagram.com"]').each((i, el) => {
    socialLinks.instagram = $(el).attr('href');
  });
  
  $('a[href*="youtube.com"]').each((i, el) => {
    socialLinks.youtube = $(el).attr('href');
  });
  
  $('a[href*="linkedin.com"]').each((i, el) => {
    socialLinks.linkedin = $(el).attr('href');
  });
  
  // Extract Instagram handle from text
  const igHandleMatch = $('body').text().match(/@[\w\.]+/);
  if (igHandleMatch && !socialLinks.instagram) {
    socialLinks.instagramHandle = igHandleMatch[0];
  }
  
  return socialLinks;
}

function extractStaff(text) {
  const staffRegex = /Dr\.?\s+[A-Z][a-z]+\s+[A-Z][a-z]+|[A-Z][a-z]+\s+[A-Z][a-z]+,?\s+(DDS|DMD|MD)/g;
  return [...new Set(text.match(staffRegex) || [])];
}

function extractAddress(text) {
  const addressRegex = /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Drive|Dr|Road|Rd)[,\s]+[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}/;
  const match = text.match(addressRegex);
  return match ? match[0] : null;
}

function extractHours(text) {
  const hoursRegex = /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[:\s]+[\d:\s\-ampAMP]+/g;
  return text.match(hoursRegex) || [];
}

function extractFocusAreas(text) {
  const focusAreas = [];
  if (text.includes('Exclusive Dental Implants')) focusAreas.push('Exclusive Dental Implants');
  if (text.includes('Four Ever Smile')) focusAreas.push('Four Ever Smile™');
  return focusAreas;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Canvas Scraper Service (Lightweight) running on port ${PORT}`);
});