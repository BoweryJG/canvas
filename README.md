# RepSpheres Canvas - AI Sales Intelligence Platform

<div align="center">
  <img src="public/favicon.svg" alt="RepSpheres Canvas Logo" width="120" height="120">
  
  [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/BoweryJG/canvas)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
  
  **Transform medical professional data into actionable sales intelligence**
</div>

## 🚀 Overview

RepSpheres Canvas is a cutting-edge AI-powered sales intelligence platform designed specifically for medical device and pharmaceutical sales teams. It provides instant, comprehensive intelligence on healthcare providers, enabling sales representatives to build meaningful relationships and close more deals.

### Key Features

- **🔍 Instant Intelligence Gathering**: Get comprehensive profiles on any healthcare provider in seconds
- **🤖 AI-Powered Insights**: Advanced analysis of practice patterns, specialties, and opportunities
- **📊 Deep Market Analysis**: Understand local healthcare ecosystems and referral networks
- **📧 Multi-Channel Outreach**: Personalized email, SMS, and LinkedIn campaigns
- **🔗 Magic Link Sharing**: Secure, trackable intelligence report sharing with analytics
- **📈 Real-Time Analytics**: Track engagement and optimize your sales approach
- **🏢 Enterprise Integration**: CRM sync, team collaboration, and white-label options

## 📋 Table of Contents

- [Features](#-features)
- [Getting Started](#-getting-started)
- [Architecture](#-architecture)
- [Magic Link Sharing](#-magic-link-sharing)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Features

### Intelligence Gathering

#### Basic Scan (15-30 seconds)
- NPI verification and validation
- Practice information and locations
- Contact details and specialties
- Insurance acceptance
- Basic demographics
- Instant tactical insights

#### Deep Intelligence Scan (2-4 minutes)
- Website discovery and analysis
- Social media presence
- Published articles and research
- Professional affiliations
- Technology stack analysis
- Competitive landscape
- Patient reviews and sentiment
- Comprehensive practice profiling

### AI-Powered Analysis

- **Personality Insights**: Communication style preferences based on digital footprint
- **Opportunity Scoring**: AI-driven lead scoring based on multiple factors
- **Best Time to Contact**: Optimal outreach timing based on practice patterns
- **Talking Points**: Personalized conversation starters and value propositions
- **Risk Assessment**: Identify potential objections and prepare responses
- **100% Confidence**: When actual practice website is found
- **85%+ Confidence**: For directory and aggregated data

### Outreach Capabilities

#### Email Campaigns
- AI-generated personalized emails
- Multi-touch campaign sequences
- A/B testing capabilities
- Open and click tracking
- Magic link integration

#### SMS Outreach
- HIPAA-compliant messaging
- Appointment scheduling links
- Follow-up automation
- Opt-out management

#### LinkedIn Integration
- Profile analysis
- Connection request templates
- InMail optimization
- Engagement tracking

### 🔗 Magic Link Sharing System

Our revolutionary magic link system allows secure sharing of intelligence reports with customizable permissions and detailed analytics.

#### Subscription Tiers

##### Free Tier
- **Duration**: 24-hour expiring links
- **Features**: View-only access with watermark
- **Limits**: Maximum 3 shares per month
- **Security**: Basic link protection

##### Starter Tier ($29/month)
- **Duration**: 7-day expiring links
- **Features**:
  - PDF download capability
  - Basic analytics (views, downloads)
  - Custom messages for recipients
- **Limits**: 10 shares per month
- **Analytics**: Basic tracking

##### Professional Tier ($99/month)
- **Duration**: 30-day expiring links
- **Features**:
  - Password protection
  - Full analytics dashboard
  - Comments and collaboration
  - White-label branding
  - Device breakdown analytics
  - Engagement time tracking
- **Limits**: Unlimited shares
- **Analytics**: Comprehensive dashboard

##### Enterprise Tier (Custom Pricing)
- **Duration**: Permanent links (no expiration)
- **Features**:
  - Domain restriction (email domain locking)
  - IP whitelist
  - 2FA requirement
  - Team collaboration
  - Version history
  - Audit trail
  - CRM integration
  - Custom branding
- **Limits**: Unlimited everything
- **Support**: Priority support & SLA

### 📊 Analytics Dashboard

Track the performance of your shared intelligence reports with comprehensive analytics:

#### Metrics Overview
- **Total Views**: Track every access to your shared reports
- **Downloads**: Monitor PDF download activity
- **Active Links**: See how many links are currently live
- **Average Engagement Time**: Understand how long recipients spend on reports

#### Detailed Analytics (Professional+)
- **Views Over Time**: Chart showing daily/weekly/monthly trends
- **Device Breakdown**: Desktop vs mobile vs tablet usage
- **Geographic Distribution**: Where your reports are being accessed
- **Link Performance**: Compare different sharing campaigns
- **Recipient Behavior**: Scroll depth and section engagement

#### Link Management
- **Status Tracking**: Active, expired, or revoked links
- **One-Click Revocation**: Instantly disable any shared link
- **Copy Links**: Quick sharing with clipboard integration
- **Bulk Actions**: Manage multiple links at once

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- API keys for:
  - OpenRouter (AI models)
  - Perplexity (web search)
  - Firecrawl (web scraping)
  - Stripe (payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BoweryJG/canvas.git
   cd canvas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your API keys:
   ```env
   # Supabase
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Stripe
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
   
   # AI/API Services
   VITE_OPENROUTER_API_KEY=your_openrouter_key
   VITE_PERPLEXITY_API_KEY=your_perplexity_key
   VITE_FIRECRAWL_API_KEY=your_firecrawl_key
   ```

4. **Set up Supabase database**
   ```bash
   # Link to your project
   supabase link --project-ref your-project-ref
   
   # Run migrations
   supabase db push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🏗 Architecture

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Material-UI v7
- **Styling**: Emotion + Custom CSS + Tailwind utilities
- **State Management**: React Hooks + Context
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **AI Integration**: 
  - OpenRouter (Claude 3.5, GPT-4)
  - Perplexity API
- **Search**: Brave Search API
- **Web Scraping**: Firecrawl
- **Payments**: Stripe
- **Analytics**: Custom implementation + Google Analytics
- **Deployment**: Netlify

### Project Structure

```
canvas/
├── src/
│   ├── components/          # React components
│   │   ├── DeepIntelligenceScan.tsx
│   │   ├── ShareIntelligenceModal.tsx
│   │   ├── MagicLinkAnalytics.tsx
│   │   ├── EnhancedActionSuite.tsx
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── CanvasHomePremium.tsx
│   │   ├── SharedIntelligence.tsx
│   │   ├── ShareAnalytics.tsx
│   │   └── ...
│   ├── lib/                # Core business logic
│   │   ├── deepIntelligenceGatherer.ts
│   │   ├── magicLinkGenerator.ts
│   │   ├── simpleFastScan.ts
│   │   ├── enhancedAI.ts
│   │   └── ...
│   ├── types/              # TypeScript types
│   │   ├── magicLink.ts
│   │   └── ...
│   ├── auth/               # Authentication
│   ├── utils/              # Utilities
│   └── styles/             # Global styles
├── supabase/
│   └── migrations/         # Database migrations
├── public/                 # Static assets
└── docs/                   # Documentation
    ├── MAGIC_LINKS.md     # Magic link system docs
    └── ...
```

### Database Schema

#### Magic Links System
```sql
-- Core tables
magic_links              -- Store link metadata and configuration
magic_link_analytics     -- Track all link interactions
share_events            -- User sharing activity log

-- Key features
- Row Level Security (RLS) policies
- Encrypted report data storage
- Automatic view/download tracking
- Comprehensive audit trail
```

## 📡 API Documentation

### Core APIs

#### Intelligence Gathering
```typescript
// Basic scan with instant results
const result = await simpleFastScan(doctorName, location, {
  skipWebResearch: false,
  includeReviews: true
});

// Deep intelligence scan with website analysis
const deepResults = await gatherDeepIntelligence({
  doctor: doctorName,
  npi: npiNumber,
  location: location,
  websites: discoveredWebsites,
  searchQuery: customQuery
});
```

#### Magic Link Generation
```typescript
// Generate a secure magic link
const link = await generateMagicLink({
  reportData: scanResults,
  doctorName: "Dr. Smith",
  userId: currentUser.id,
  tier: "professional",
  password: "optional-password",
  customMessage: "Check out this comprehensive report!",
  domainRestrictions: ["company.com"],
  allowDownload: true,
  allowComments: true,
  requires2FA: false
});

// Result includes
{
  id: "uuid",
  expiresAt: Date,
  url: "https://app.repspheres.com/intel/uuid",
  features: ["download", "password", "analytics"]
}
```

#### Analytics Retrieval
```typescript
// Get comprehensive share analytics
const analytics = await getShareAnalytics(userId, {
  timeframe: "30d", // 7d, 30d, all
  includeDetails: true
});

// Revoke a link
const result = await revokeMagicLink(linkId, userId);
```

### External APIs

- **NPI Registry**: Healthcare provider verification
- **OpenRouter**: AI model access (Claude 3.5 Sonnet, GPT-4)
- **Perplexity**: Advanced web search and research
- **Brave Search**: General web search
- **Firecrawl**: Website content extraction and analysis
- **Supabase**: Database, auth, and real-time updates
- **Stripe**: Payment processing and subscriptions

## 🚀 Deployment

### Netlify Deployment (Recommended)

1. **Connect GitHub repository**
   ```bash
   # One-click deploy
   [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)]
   ```

2. **Configure build settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

3. **Set environment variables**
   In Netlify dashboard → Site settings → Environment variables:
   ```
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   VITE_STRIPE_PUBLISHABLE_KEY
   VITE_OPENROUTER_API_KEY
   VITE_PERPLEXITY_API_KEY
   VITE_FIRECRAWL_API_KEY
   ```

4. **Configure headers**
   The `public/_headers` file includes security headers automatically

### Database Setup

1. **Create Supabase project**
2. **Run migrations** in SQL editor:
   ```sql
   -- Execute contents of:
   -- supabase/migrations/20240702_magic_links.sql
   ```

3. **Enable Row Level Security**
4. **Configure Auth providers**

## 🔒 Security

### Best Practices Implemented

- **API Key Rotation**: Automatic rotation every 90 days
- **Environment Variables**: All sensitive keys in env vars
- **CORS Configuration**: Strict origin validation
- **Rate Limiting**: 
  - API calls: 10 req/min per endpoint
  - Auth attempts: 5/hour
- **Input Validation**: Comprehensive sanitization
- **HTTPS Only**: Enforced via headers
- **CSP Headers**: Strict Content Security Policy

### Data Protection

- **Encryption**: 
  - All report data encrypted at rest (AES-256)
  - TLS 1.3 for data in transit
- **Password Hashing**: SHA-256 for magic link passwords
- **Row Level Security**: PostgreSQL RLS policies on all tables
- **Audit Logging**: Comprehensive activity tracking
- **HIPAA Considerations**: 
  - No PHI stored
  - Secure data handling practices
  - Regular security audits

### Security Headers
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: [strict policy]
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **TypeScript**: Strict mode enabled
- **React**: Functional components with hooks
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier
- **Commits**: Conventional commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by the RepSpheres team
- Powered by Claude (Anthropic) and GPT-4 (OpenAI)
- Special thanks to all contributors and beta testers

## 📞 Support

- **Documentation**: [docs.repspheres.com](https://docs.repspheres.com)
- **Email**: support@repspheres.com
- **Discord**: [Join our community](https://discord.gg/repspheres)
- **Issues**: [GitHub Issues](https://github.com/BoweryJG/canvas/issues)

---

<div align="center">
  <strong>Ready to revolutionize your medical sales?</strong>
  <br>
  <a href="https://canvas.repspheres.com">Get Started Today</a>
  <br><br>
  <a href="https://canvas.repspheres.com">Website</a> •
  <a href="https://docs.repspheres.com">Documentation</a> •
  <a href="https://blog.repspheres.com">Blog</a> •
  <a href="https://twitter.com/repspheres">Twitter</a>
</div>