# Canvas Sales Intelligence

AI-powered sales intelligence platform that provides instant, comprehensive research on healthcare professionals to accelerate B2B medical sales.

## ✨ Latest Updates

### Production-Ready Features (NEW!)
- **📱 Mobile-First Design**: Responsive layouts, touch-friendly interfaces, haptic feedback
- **🔌 Offline Support**: Service worker, resilient API calls, connection monitoring
- **🔒 Enterprise Security**: CSP headers, CSRF protection, secure storage
- **📊 Analytics & Tracking**: Session management, user behavior tracking
- **🚀 Performance**: Rate limiting, API key rotation, data compression
- **👋 Onboarding**: 5-step tutorial for new users

### Two-Tier Intelligence System
- **⚡ Instant Intelligence (15-30s)**: Immediate tactical briefs, key insights, and personalized outreach templates
- **🔬 Deep Research (2-4 min)**: Comprehensive analysis with website scanning, competitor intelligence, and detailed practice profiling

### Enhanced UI/UX Flow
- **Streamlined Interface**: Generate Intel button appears immediately after doctor + product entry
- **Dynamic Intelligence Gauge**: Shows real-time data analysis with binary code, news snippets, and reviews flying inside
- **Mobile-First Design**: Fixed autocomplete styling and enhanced loading animations for mobile devices
- **Smart Verification**: NPI-selected doctors skip verification (they're pre-verified!)

## Features

### 🎯 Instant Doctor Intelligence
- **NPI-Verified Search**: Autocomplete search with real-time NPI database verification
- **Two-Speed Intelligence**:
  - Instant (15-30s): Quick tactical briefs and outreach templates
  - Deep Research (2-4 min): Full website analysis and competitor intelligence
- **Comprehensive Profiles**: Practice information, reviews, credentials, and business intelligence
- **AI-Powered Analysis**: Uses Claude Opus 4 and Sequential Thinking for intelligent research

### 📱 Mobile & Offline Capabilities
- **Progressive Web App**: Install on mobile devices for app-like experience
- **Offline Support**: 
  - Cached data available without internet
  - Form auto-save functionality
  - Sync when connection restored
- **Touch Optimized**: 48px minimum touch targets, swipe gestures
- **Responsive Design**: Adapts to any screen size

### 🔒 Enterprise Security
- **Content Security Policy**: Strict CSP headers prevent XSS attacks
- **CSRF Protection**: Token-based request validation
- **Secure Storage**: AES-256 encryption for sensitive data
- **Input Validation**: Comprehensive sanitization
- **Rate Limiting**: 
  - NPI lookups: 30/minute
  - Web research: 10/minute
  - AI generation: 5/minute

### 🚀 Power Pack Scaling
- **Batch Processing**: Scale from x10 to x2500 doctors in one go
- **Tiered Pricing**: Volume discounts from $4.50/scan (x10) down to $1.99/scan (x2500)
- **CSV Upload**: Upload doctor lists for bulk analysis
- **Export Options**: Download results as CSV or comprehensive reports

### 💰 Cost-Optimized Architecture
- **Smart API Usage**: Reduced costs from ~$1.58 to ~$0.50-$0.80 per lookup
- **API Key Rotation**: Automatic failover between multiple keys
- **Deduplication**: Prevents duplicate API calls during doctor selection
- **Intelligent Caching**: Reuses research data where appropriate
- **Progressive Enhancement**: Basic results first, then enhanced data

### 📊 Analytics & Insights
- **User Behavior Tracking**: Understand how reps use the platform
- **Session Analytics**: Track engagement and success metrics
- **Export Analytics**: Download usage reports
- **Performance Metrics**: Monitor API usage and costs

### 🎨 Modern UI/UX
- **Streamlined Flow**: Simplified UI with intelligent button placement
- **Data Visualization**: Live data streaming window showing analysis in progress
- **Real-time Progress**: Visual feedback during research with dynamic percentage updates
- **Confidence Scoring**: Shows research quality and source verification
- **Cinematic Animations**: Enhanced Intelligence Gauge with theme-based variations

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Mobile-First CSS Framework
- **AI Models**: 
  - Claude Opus 4 (via OpenRouter)
  - Sequential Thinking for adaptive research
- **APIs**:
  - NPI Database for doctor verification
  - Brave Search API for web research
  - Custom API endpoints for data processing
- **State Management**: React Hooks + Context API
- **Security**: CSP, CSRF tokens, AES-256 encryption
- **Offline**: Service Workers + IndexedDB
- **Analytics**: Custom analytics with Google Analytics integration
- **Deployment**: Netlify with security headers

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- API keys for OpenRouter and Brave Search

### Installation

1. Clone the repository:
```bash
git clone https://github.com/BoweryJG/canvasheader.git
cd canvasheader
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# API Endpoints
VITE_API_ENDPOINT=your-api-endpoint
VITE_NPI_LOOKUP_ENDPOINT=your-npi-endpoint

# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe Configuration  
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-key

# API Keys (if not using backend proxy)
VITE_OPENROUTER_API_KEY=your-openrouter-key
VITE_BRAVE_API_KEY=your-brave-key

# Multiple API Keys for rotation (optional)
REACT_APP_OPENAI_API_KEY=your-openai-key
REACT_APP_OPENAI_API_KEY_2=your-openai-key-2
REACT_APP_PERPLEXITY_API_KEY=your-perplexity-key

# Analytics (optional)
REACT_APP_GA_MEASUREMENT_ID=your-ga-id
```

4. Start the development server:
```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Usage

### 1. Single Doctor Lookup
- Start typing a doctor's name in the search bar
- Select from NPI-verified results
- Add product/context information
- Choose intelligence speed:
  - **Instant Intel**: 15-30 second tactical brief
  - **Deep Research**: 2-4 minute comprehensive analysis

### 2. Batch Processing
- Complete a single lookup first
- Click "Scale This x10-2500" button
- Select your power pack size
- Upload CSV or manually enter doctor list
- Process and download results

### 3. Offline Usage
- Previously searched doctors are cached
- Forms auto-save as you type
- View scan history without internet
- Data syncs when reconnected

### 4. Mobile Experience
- Add to home screen for app experience
- Swipe between research tabs
- Touch-optimized interface
- Works offline after first load

## Production Features

### Security Headers (Netlify)
Automatically applied via `public/_headers`:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict CSP policy
- HSTS enabled

### Performance Optimizations
- **Bundle Size**: ~1.2MB (383KB gzipped)
- **Code Splitting**: Dynamic imports for large components
- **Caching Strategy**: 
  - Static assets: 1 year
  - API responses: 5 min - 24 hours
  - Service worker: Offline-first

### Monitoring & Analytics
- Real-time connection status
- API usage tracking
- User session analytics
- Error tracking and reporting

## Cost Structure

| Power Pack | Scans | Price | Per Scan |
|------------|-------|-------|----------|
| Starter | 10 | $45 | $4.50 |
| Growth | 25 | $100 | $4.00 |
| Professional | 50 | $175 | $3.50 |
| Team | 100 | $300 | $3.00 |
| Business | 250 | $625 | $2.50 |
| Enterprise | 500 | $1,125 | $2.25 |
| Scale | 1000 | $2,100 | $2.10 |
| Ultimate | 2500 | $4,975 | $1.99 |

## API Cost Optimization

Recent optimizations have significantly reduced API costs:

- **Before**: ~$1.58 per doctor lookup (duplicate API calls)
- **After**: ~$0.50-$0.80 per lookup
- **Savings**: 50-68% reduction in API costs

Key optimizations:
- Removed duplicate background research on doctor selection
- Added debouncing to prevent rapid selections
- API key rotation for rate limit management
- Intelligent caching with compression
- Consolidated API calls in unified research system

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks
- `npm test` - Run tests (when configured)

### Project Structure

```
canvasheader/
├── src/
│   ├── components/      # React components
│   │   └── Onboarding/ # User onboarding flow
│   ├── lib/            # Core business logic
│   ├── pages/          # Page components
│   ├── auth/           # Authentication
│   ├── config/         # Configuration
│   ├── hooks/          # Custom React hooks
│   ├── middleware/     # Security middleware
│   ├── utils/          # Utility functions
│   │   ├── analytics.ts     # Analytics tracking
│   │   ├── apiKeyManager.ts # API key rotation
│   │   ├── dataManager.ts   # Data persistence
│   │   ├── rateLimiter.ts   # Rate limiting
│   │   ├── resilientApi.ts  # Offline support
│   │   └── security.ts      # Security utilities
│   ├── styles/         # CSS files
│   │   └── mobile.css  # Mobile-first framework
│   └── assets/         # Static assets
├── public/             # Public assets
│   ├── _headers        # Netlify headers
│   ├── service-worker.js # PWA support
│   └── index.html      # Main HTML
├── dist/               # Build output
└── netlify/           # Netlify functions
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For support, email support@repspheres.com or visit [canvas.repspheres.com](https://canvas.repspheres.com)

---

Built with ❤️ by the RepSpheres team