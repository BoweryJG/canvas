# Magic Link Sharing System

## Overview

The Magic Link sharing system allows users to share intelligence reports with external recipients through secure, time-limited links. Features are tier-based, with more advanced capabilities available to higher subscription levels.

## Subscription Tiers

### Free Tier
- **Expiration**: 24 hours
- **Features**: View-only access with watermark
- **Max Shares**: 3 per month

### Starter Tier
- **Expiration**: 7 days
- **Features**:
  - View and download (PDF)
  - Basic analytics (views, downloads)
  - Custom message for recipients
- **Max Shares**: 10 per month

### Professional Tier
- **Expiration**: 30 days
- **Features**:
  - All Starter features
  - Password protection
  - Comments and collaboration
  - Full analytics dashboard
  - White-label branding
- **Max Shares**: Unlimited

### Enterprise Tier
- **Expiration**: No expiration (permanent links)
- **Features**:
  - All Professional features
  - Domain restriction (email domain locking)
  - IP whitelist
  - 2FA requirement
  - Team collaboration
  - Version history
  - Audit trail
  - CRM integration
- **Max Shares**: Unlimited

## Implementation Details

### Key Components

1. **ShareIntelligenceModal** (`/src/components/ShareIntelligenceModal.tsx`)
   - Modal interface for creating share links
   - Tier-based feature display
   - Password, custom message, and domain restriction options

2. **magicLinkGenerator** (`/src/lib/magicLinkGenerator.ts`)
   - Generates secure magic links with encryption
   - Validates link access with various security checks
   - Tracks analytics for views and downloads

3. **SharedIntelligence** (`/src/pages/SharedIntelligence.tsx`)
   - Landing page for magic link recipients
   - Password protection handling
   - Download functionality
   - Call-to-action for sign-ups

4. **Database Schema** (`/supabase/migrations/20240702_magic_links.sql`)
   - `magic_links` table for link storage
   - `magic_link_analytics` table for detailed tracking
   - `share_events` table for user activity
   - Row Level Security (RLS) policies

### Security Features

1. **Encryption**: Report data is encrypted before storage
2. **Password Protection**: Optional password hashing (SHA-256)
3. **Domain Restriction**: Limit access to specific email domains
4. **IP Whitelist**: Enterprise-only feature for IP-based access control
5. **2FA**: Enterprise-only two-factor authentication requirement
6. **Expiration**: Automatic link expiration based on tier
7. **Revocation**: Users can revoke links at any time

### Analytics Tracking

- **Views**: Track each time a link is accessed
- **Downloads**: Track PDF downloads
- **Time Spent**: Track engagement duration (Professional+)
- **Section Engagement**: Track which sections are viewed (Professional+)
- **Device Information**: Track device types accessing links (Professional+)

## Usage

### Creating a Share Link

```typescript
// In EnhancedActionSuite component
<button onClick={() => setShowShareModal(true)}>
  Share Intelligence Report
</button>

<ShareIntelligenceModal
  open={showShareModal}
  onClose={() => setShowShareModal(false)}
  reportData={scanResult}
  doctorName={scanResult.doctor}
  userTier={getUserTier()}
  userId={user?.id || ''}
/>
```

### Accessing a Shared Link

Recipients access links via: `https://yourapp.com/intel/{linkId}`

- If password protected, they'll see a password prompt
- If domain restricted, their email domain is verified
- Analytics are tracked automatically
- Download is available based on link permissions

## Environment Variables

Add these to your `.env` file:

```bash
# Supabase (required for magic links)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup

Run the migration in Supabase:

```sql
-- Execute the contents of:
-- /supabase/migrations/20240702_magic_links.sql
```

## Future Enhancements

1. **Batch Sharing**: Share multiple reports at once
2. **Custom Branding**: Upload company logos and colors
3. **Email Integration**: Send links directly via email
4. **Link Templates**: Save and reuse common sharing configurations
5. **Advanced Analytics**: Heatmaps, scroll depth, engagement scoring
6. **API Access**: Programmatic link generation for integrations
7. **Link Forwarding**: Track when links are shared by recipients
8. **A/B Testing**: Test different report formats and CTAs