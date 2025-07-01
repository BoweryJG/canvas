const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Canvas Scraper Service Running (Puppeteer Version)' });
});

// Main scraping endpoint
app.post('/scrape', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  let browser;
  try {
    console.log(`🕷️ Scraping: ${url}`);
    
    // Launch Puppeteer with Railway-optimized settings
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
      ]
    });
    
    const page = await browser.newPage();
    
    // Block unnecessary resources for faster loading
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.resourceType() === 'image' || 
          req.resourceType() === 'stylesheet' || 
          req.resourceType() === 'font') {
        req.abort();
      } else {
        req.continue();
      }
    });
    
    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // Extract all the data we need
    const data = await page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.textContent.trim() : '';
      };
      
      const bodyText = document.body.innerText;
      
      // Phone numbers
      const phoneRegex = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
      const phones = [...new Set(bodyText.match(phoneRegex) || [])];
      
      // Emails
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = [...new Set(bodyText.match(emailRegex) || [])]
        .filter(e => !e.includes('example.com'));
      
      // Services
      const serviceKeywords = [
        'implants', 'dental implants', 'surgery', 'extraction', 
        'crown', 'bridge', 'cleaning', 'whitening', 'orthodontics',
        'periodontics', 'endodontics', 'prosthodontics', 'cosmetic',
        'veneers', 'root canal', 'invisalign', 'braces', 'dentures'
      ];
      const services = serviceKeywords.filter(service => 
        bodyText.toLowerCase().includes(service)
      );
      
      // Technologies
      const techKeywords = [
        'YOMI', 'robotic', 'digital', 'CAD/CAM', 'CEREC',
        'cone beam', 'CBCT', 'laser', '3D', 'intraoral scanner',
        'iTero', 'digital x-ray', 'panoramic'
      ];
      const technologies = techKeywords.filter(tech => 
        bodyText.toLowerCase().includes(tech.toLowerCase())
      );
      
      // Social media
      const socialLinks = {};
      document.querySelectorAll('a[href*="facebook.com"]').forEach(link => {
        socialLinks.facebook = link.href;
      });
      document.querySelectorAll('a[href*="instagram.com"]').forEach(link => {
        socialLinks.instagram = link.href;
      });
      document.querySelectorAll('a[href*="youtube.com"]').forEach(link => {
        socialLinks.youtube = link.href;
      });
      document.querySelectorAll('a[href*="linkedin.com"]').forEach(link => {
        socialLinks.linkedin = link.href;
      });
      
      // Extract Instagram handle from text
      const igHandleMatch = bodyText.match(/@[\w\.]+/);
      if (igHandleMatch && !socialLinks.instagram) {
        socialLinks.instagramHandle = igHandleMatch[0];
      }
      
      // Staff names
      const staffRegex = /Dr\.?\s+[A-Z][a-z]+\s+[A-Z][a-z]+|[A-Z][a-z]+\s+[A-Z][a-z]+,?\s+(DDS|DMD|MD)/g;
      const staff = [...new Set(bodyText.match(staffRegex) || [])];
      
      // Address
      const addressRegex = /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Drive|Dr|Road|Rd)[,\s]+[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}/;
      const address = bodyText.match(addressRegex)?.[0];
      
      // Hours
      const hoursRegex = /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[:\s]+[\d:\s\-ampAMP]+/g;
      const hours = bodyText.match(hoursRegex) || [];
      
      // Get page title and meta description
      const title = document.title;
      const metaDesc = document.querySelector('meta[name="description"]')?.content || 
                       document.querySelector('meta[property="og:description"]')?.content;
      
      // Look for specific focus areas
      const focusAreas = [];
      if (bodyText.includes('Exclusive Dental Implants')) focusAreas.push('Exclusive Dental Implants');
      if (bodyText.includes('Four Ever Smile')) focusAreas.push('Four Ever Smile™');
      
      // Extract any taglines or slogans (usually in headers)
      const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.textContent.trim());
      const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim());
      
      return {
        title,
        metaDescription: metaDesc,
        phones,
        emails,
        services,
        technologies,
        socialLinks,
        staff,
        address,
        hours,
        focusAreas,
        headers: { h1s, h2s },
        rawText: bodyText.substring(0, 5000)
      };
    });
    
    await browser.close();
    
    console.log(`✅ Successfully scraped ${url}`);
    
    res.json({
      success: true,
      url,
      data,
      screenshot: null
    });
    
  } catch (error) {
    console.error('Scraping error:', error);
    if (browser) await browser.close();
    
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Canvas Scraper Service (Puppeteer) running on port ${PORT}`);
});