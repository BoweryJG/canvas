# Canvas - AI-Powered Medical Sales Intelligence Platform

Canvas is a comprehensive sales intelligence platform that combines NPI data, web scraping, AI content generation, and multi-channel outreach to help medical sales representatives connect with healthcare providers effectively.

## 🎯 Overview

Canvas bridges the gap between generic medical provider data and actionable sales intelligence by:
- Automatically discovering practice websites from NPI data
- Extracting relevant practice information through intelligent web scraping
- Generating personalized outreach content based on practice focus and product alignment
- Enabling multi-channel communication (email, SMS, LinkedIn)
- Tracking engagement and managing relationships through CRM integration

## 🏗️ Architecture

### System Components

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend UI   │────▶│ Netlify Functions│────▶│ Scraper Service │
│  (React + TS)   │     │   (Serverless)   │     │   (Node.js)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │                         │
         └───────────┬───────────┘                         │
                     ▼                                     ▼
              ┌─────────────┐                    ┌─────────────────┐
              │  Supabase   │                    │  External APIs  │
              │  Database   │                    │ NPI, AI Models  │
              └─────────────┘                    └─────────────────┘
```

### Data Flow

1. **Input Phase**: Sales rep enters doctor name + product (e.g., "Dr. Gregory White" + "Yomi")
2. **Discovery Phase**: 
   - NPI API lookup for official provider data
   - Smart search combining NPI data + product context
   - Website validation and URL extraction
3. **Intelligence Phase**:
   - Web scraping for practice details
   - AI analysis of services, technologies, staff
   - Confidence scoring and verification
4. **Generation Phase**:
   - AI-powered content creation
   - Personalized messaging based on practice focus
   - Multi-channel template generation
5. **Outreach Phase**:
   - Email/SMS delivery
   - CRM integration
   - Engagement tracking

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Netlify account
- API keys for: OpenRouter, Perplexity, Brave Search, Firecrawl

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/YourUsername/canvas.git
cd canvas

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

### Backend Setup (Netlify Functions)

```bash
# Install function dependencies
cd netlify/functions
npm install

# Deploy to Netlify
netlify deploy --prod
```

### Scraper Service Setup

```bash
# On your scraper server (e.g., Dell at 192.168.0.94)
cd ~/scraper-service
npm install

# Install Chrome for Puppeteer
npx puppeteer browsers install chrome

# Install system dependencies
sudo apt-get update
sudo apt-get install -y libnss3 libnspr4 libatk1.0-0t64 libatk-bridge2.0-0t64 libcups2t64 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libasound2t64

# Start the service
PORT=3001 node server.js
```

### Database Setup

Run the migrations in `supabase/migrations/` in order:

```sql
-- Run each migration file in sequence
-- 001_initial_setup.sql through 010_create_user_settings.sql
```

## 📋 API Documentation

### NPI Lookup
```typescript
POST /api/npi-lookup
{
  "firstName": "Gregory",
  "lastName": "White",
  "state": "NY"
}
```

### Practice Website Discovery
```typescript
POST /api/practice-finder
{
  "doctorName": "Dr. Gregory White",
  "location": "Buffalo, NY",
  "npiData": { /* NPI response */ },
  "product": "Yomi"
}
```

### Web Scraping
```typescript
POST http://scraper-server:3001/scrape
{
  "url": "https://www.puredental.com/buffalo/"
}
```

### AI Content Generation
```typescript
POST /api/claude-outreach
{
  "doctorName": "Dr. Gregory White",
  "productName": "Yomi",
  "researchData": { /* Scraped data */ },
  "salesRepName": "John Smith",
  "companyName": "MedTech Inc"
}
```

## 🔑 Key Features

### Intelligent Search Strategy
- Combines NPI classifications with product context
- Progressive search queries for better results
- Validates against multiple data points

### Advanced Web Scraping
- Headless Chrome with Puppeteer
- Extracts structured data: phones, emails, services, staff
- Screenshot capability for visual verification

### AI-Powered Insights
- Multiple AI models (Claude, GPT-4, Perplexity)
- Context-aware content generation
- Personalization based on practice focus

### Multi-Channel Outreach
- Email templates with personalization
- SMS messages with compliance
- LinkedIn connection requests
- Call scripts for sales reps

### Analytics & Tracking
- Engagement metrics
- Conversion tracking
- ROI reporting
- CRM synchronization

## 🔧 Configuration

### Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# AI Services
VITE_OPENROUTER_API_KEY=your-openrouter-key
VITE_PERPLEXITY_API_KEY=your-perplexity-key

# Search & Scraping
VITE_BRAVE_SEARCH_API_KEY=your-brave-key
VITE_FIRECRAWL_API_KEY=your-firecrawl-key

# Communication
VITE_SENDGRID_API_KEY=your-sendgrid-key
VITE_TWILIO_ACCOUNT_SID=your-twilio-sid
VITE_TWILIO_AUTH_TOKEN=your-twilio-token
```

### Scraper Configuration

Edit `server.js` to configure:
- Port binding: `app.listen(PORT, '0.0.0.0')`
- Chrome executable path (if non-standard)
- Timeout settings
- Screenshot options

## 📊 Usage Examples

### Basic Doctor Search
```javascript
const result = await searchDoctor({
  name: "Dr. Scott Kissel",
  location: "New York, NY",
  product: "Yomi"
});
```

### Complete Research Flow
```javascript
// 1. NPI Lookup
const npiData = await npiLookup({ firstName: "Scott", lastName: "Kissel", state: "NY" });

// 2. Find Website
const website = await findPracticeWebsite({
  doctorName: "Dr. Scott Kissel",
  npiData,
  product: "Yomi"
});

// 3. Scrape Website
const scrapedData = await scrapeWebsite(website.url);

// 4. Generate Content
const content = await generateOutreach({
  doctorName: "Dr. Scott Kissel",
  productName: "Yomi",
  researchData: scrapedData
});

// 5. Send Outreach
await sendEmail(content.email);
```

## 🛠️ Development

### Project Structure
```
canvas/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── lib/               # Core business logic
│   └── pages/             # Route pages
├── netlify/functions/      # Serverless backend
├── scraper-service/        # Web scraping service
├── public/                 # Static assets
└── supabase/              # Database migrations
```

### Key Libraries
- Frontend: React, TypeScript, Vite, TailwindCSS
- Backend: Netlify Functions, TypeScript
- Scraping: Puppeteer, Express
- AI: OpenRouter, Perplexity API
- Database: Supabase (PostgreSQL)

## 📈 Performance Optimization

- Intelligent caching of research results
- Rate limiting for API calls
- Progressive loading for better UX
- Parallel processing where possible
- Fallback strategies for API failures

## 🔒 Security

- API keys stored in environment variables
- Row Level Security (RLS) in Supabase
- Input validation and sanitization
- CORS configuration
- Rate limiting per user

## 🚨 Troubleshooting

### Common Issues

1. **Scraper Connection Failed**
   - Check firewall settings (port 3001)
   - Verify server is listening on 0.0.0.0
   - Test with `curl http://server:3001/scrape`

2. **Chrome Launch Failed**
   - Install missing dependencies
   - Check Chrome executable path
   - Verify Puppeteer installation

3. **API Rate Limits**
   - Implement exponential backoff
   - Use caching for repeated queries
   - Consider upgrading API plans

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

- GitHub Issues: [github.com/YourUsername/canvas/issues](https://github.com/YourUsername/canvas/issues)
- Documentation: [docs.canvasplatform.com](https://docs.canvasplatform.com)
- Email: support@canvasplatform.com

---

Built with ❤️ by the Canvas Team