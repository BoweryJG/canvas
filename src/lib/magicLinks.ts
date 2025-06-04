/**
 * Magic Link Email System
 * Generates links that open user's email client with pre-filled content
 */

export interface EmailCampaign {
  id: string;
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  replyTo?: string;
}

export interface MagicLinkOptions {
  trackingId?: string;
  provider?: 'gmail' | 'outlook' | 'yahoo' | 'apple' | 'default';
}

/**
 * Detect email provider from email address
 */
export const detectEmailProvider = (email: string): string => {
  const domain = email.split('@')[1]?.toLowerCase();
  
  if (!domain) return 'default';
  
  if (domain.includes('gmail.com') || domain.includes('googlemail.com')) {
    return 'gmail';
  }
  if (domain.includes('outlook.') || domain.includes('hotmail.') || domain.includes('live.')) {
    return 'outlook';
  }
  if (domain.includes('yahoo.') || domain.includes('ymail.')) {
    return 'yahoo';
  }
  if (domain.includes('icloud.') || domain.includes('me.com') || domain.includes('mac.com')) {
    return 'apple';
  }
  
  return 'default';
};

/**
 * Generate tracking BCC email for analytics
 */
const getTrackingBCC = (campaignId: string): string => {
  return `track-${campaignId}@repspheres.com`;
};

/**
 * Encode text for URL parameters
 */
const encodeForUrl = (text: string): string => {
  return encodeURIComponent(text);
};

/**
 * Generate magic link for different email providers
 */
export const generateMagicLink = (
  campaign: EmailCampaign,
  options: MagicLinkOptions = {}
): string => {
  const { trackingId, provider } = options;
  
  // Add tracking BCC if tracking enabled
  const bcc = trackingId 
    ? getTrackingBCC(trackingId)
    : campaign.bcc;
  
  // Build email parameters
  const params = {
    to: campaign.to,
    subject: campaign.subject,
    body: campaign.body,
    cc: campaign.cc,
    bcc
  };
  
  switch (provider || detectEmailProvider(campaign.to)) {
    case 'gmail':
      return generateGmailLink(params);
    
    case 'outlook':
      return generateOutlookLink(params);
    
    case 'yahoo':
      return generateYahooLink(params);
    
    case 'apple':
      return generateAppleMailLink(params);
    
    default:
      return generateMailtoLink(params);
  }
};

/**
 * Gmail compose link
 */
const generateGmailLink = (params: any): string => {
  let url = 'https://mail.google.com/mail/?view=cm';
  
  if (params.to) url += `&to=${encodeForUrl(params.to)}`;
  if (params.subject) url += `&su=${encodeForUrl(params.subject)}`;
  if (params.body) url += `&body=${encodeForUrl(params.body)}`;
  if (params.cc) url += `&cc=${encodeForUrl(params.cc)}`;
  if (params.bcc) url += `&bcc=${encodeForUrl(params.bcc)}`;
  
  return url;
};

/**
 * Outlook web compose link
 */
const generateOutlookLink = (params: any): string => {
  let url = 'https://outlook.live.com/mail/0/deeplink/compose?';
  
  const queryParams = [];
  if (params.to) queryParams.push(`to=${encodeForUrl(params.to)}`);
  if (params.subject) queryParams.push(`subject=${encodeForUrl(params.subject)}`);
  if (params.body) queryParams.push(`body=${encodeForUrl(params.body)}`);
  if (params.cc) queryParams.push(`cc=${encodeForUrl(params.cc)}`);
  if (params.bcc) queryParams.push(`bcc=${encodeForUrl(params.bcc)}`);
  
  return url + queryParams.join('&');
};

/**
 * Yahoo mail compose link
 */
const generateYahooLink = (params: any): string => {
  let url = 'https://compose.mail.yahoo.com/?';
  
  const queryParams = [];
  if (params.to) queryParams.push(`to=${encodeForUrl(params.to)}`);
  if (params.subject) queryParams.push(`subject=${encodeForUrl(params.subject)}`);
  if (params.body) queryParams.push(`body=${encodeForUrl(params.body)}`);
  if (params.cc) queryParams.push(`cc=${encodeForUrl(params.cc)}`);
  if (params.bcc) queryParams.push(`bcc=${encodeForUrl(params.bcc)}`);
  
  return url + queryParams.join('&');
};

/**
 * Apple Mail link (uses mailto)
 */
const generateAppleMailLink = generateMailtoLink;

/**
 * Universal mailto link
 */
function generateMailtoLink(params: any): string {
  let mailto = `mailto:${params.to || ''}?`;
  
  const queryParams = [];
  if (params.subject) queryParams.push(`subject=${encodeForUrl(params.subject)}`);
  if (params.body) queryParams.push(`body=${encodeForUrl(params.body)}`);
  if (params.cc) queryParams.push(`cc=${encodeForUrl(params.cc)}`);
  if (params.bcc) queryParams.push(`bcc=${encodeForUrl(params.bcc)}`);
  
  return mailto + queryParams.join('&');
}

/**
 * Check if email is too long for URL (browsers have ~2000 char limit)
 */
export const isEmailTooLong = (campaign: EmailCampaign): boolean => {
  const testLink = generateMagicLink(campaign);
  return testLink.length > 2000;
};

/**
 * Generate mobile app deep links
 */
export const generateMobileLink = (campaign: EmailCampaign): string => {
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  
  if (isIOS) {
    // iOS Gmail app deep link
    return `googlegmail://co?to=${campaign.to}&subject=${encodeForUrl(campaign.subject)}&body=${encodeForUrl(campaign.body)}`;
  }
  
  if (isAndroid) {
    // Android intent
    return `intent://compose?to=${campaign.to}&subject=${encodeForUrl(campaign.subject)}&body=${encodeForUrl(campaign.body)}#Intent;scheme=mailto;package=com.google.android.gm;end`;
  }
  
  // Fallback to web
  return generateMagicLink(campaign);
};

/**
 * Create temporary email page for long emails
 */
export const createTempEmailPage = async (
  campaign: EmailCampaign
): Promise<string> => {
  const tempId = crypto.randomUUID();
  
  // Store in Supabase
  const { error } = await import('../auth/supabase').then(({ supabase }) => 
    supabase.from('temp_emails').insert({
      id: tempId,
      campaign_id: campaign.id,
      email_data: campaign,
      expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour
    })
  );
  
  if (error) throw error;
  
  return `${window.location.origin}/send/${tempId}`;
};