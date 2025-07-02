/**
 * Magic Link Generator - Creates secure sharing links with tier-based features
 */

import { v4 as uuidv4 } from 'uuid';
import { type MagicLink, type SubscriptionTier, MAGIC_LINK_CONFIGS } from '../types/magicLink';
import { supabase } from '../auth/supabase';
import { SecureStorage } from '../utils/security';

interface GenerateLinkOptions {
  reportData: any;
  doctorName: string;
  userId: string;
  tier: SubscriptionTier;
  password?: string;
  customMessage?: string;
  domainRestrictions?: string[];
  allowDownload?: boolean;
  allowComments?: boolean;
  requires2FA?: boolean;
}

/**
 * Generate a secure magic link for sharing intelligence reports
 */
export async function generateMagicLink(options: GenerateLinkOptions): Promise<MagicLink> {
  const {
    reportData,
    doctorName,
    userId,
    tier,
    password,
    customMessage,
    domainRestrictions,
    allowDownload = false,
    allowComments = false,
    requires2FA = false
  } = options;
  
  const config = MAGIC_LINK_CONFIGS[tier];
  const linkId = uuidv4();
  
  // Calculate expiration
  const now = new Date();
  const expiresAt = config.expirationHours === -1 
    ? new Date('2099-12-31') // "permanent" = 75+ years
    : new Date(now.getTime() + (config.expirationHours * 60 * 60 * 1000));
  
  // Encrypt sensitive report data
  const encryptedReport = await SecureStorage.encrypt(JSON.stringify(reportData));
  
  // Hash password if provided
  let hashedPassword = null;
  if (password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    hashedPassword = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  const magicLink: MagicLink = {
    id: linkId,
    reportId: reportData.id || uuidv4(),
    doctorName,
    createdBy: userId,
    createdAt: now,
    expiresAt,
    tier,
    password: hashedPassword || undefined,
    customMessage,
    allowDownload: allowDownload && config.features.includes('download'),
    allowComments: allowComments && config.features.includes('comments'),
    domainRestrictions,
    requires2FA: requires2FA && config.features.includes('2fa'),
    views: 0,
    downloads: 0,
    analytics: {
      views: [],
      downloads: [],
      timeSpent: [],
      sectionEngagement: {},
      devices: []
    }
  };
  
  try {
    // Store in database
    const { error } = await supabase
      .from('magic_links')
      .insert({
        id: linkId,
        report_data: encryptedReport,
        doctor_name: doctorName,
        created_by: userId,
        expires_at: expiresAt.toISOString(),
        tier,
        password_hash: hashedPassword,
        custom_message: customMessage,
        allow_download: magicLink.allowDownload,
        allow_comments: magicLink.allowComments,
        domain_restrictions: domainRestrictions,
        requires_2fa: magicLink.requires2FA,
        views: 0,
        downloads: 0,
        analytics: magicLink.analytics
      });
    
    if (error) throw error;
    
    // Log share event
    await logShareEvent(userId, linkId, doctorName, tier);
    
    return magicLink;
  } catch (error) {
    console.error('Error creating magic link:', error);
    throw new Error('Failed to create share link');
  }
}

/**
 * Validate magic link access
 */
export async function validateMagicLink(
  linkId: string, 
  password?: string,
  userEmail?: string,
  userIp?: string
): Promise<{ valid: boolean; data?: any; error?: string }> {
  try {
    // Fetch link from database
    const { data: link, error } = await supabase
      .from('magic_links')
      .select('*')
      .eq('id', linkId)
      .single();
    
    if (error || !link) {
      return { valid: false, error: 'Invalid link' };
    }
    
    // Check if revoked
    if (link.revoked_at) {
      return { valid: false, error: 'This link has been revoked' };
    }
    
    // Check expiration
    if (new Date(link.expires_at) < new Date()) {
      return { valid: false, error: 'This link has expired' };
    }
    
    // Check password
    if (link.password_hash && password) {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashedPassword = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      if (hashedPassword !== link.password_hash) {
        return { valid: false, error: 'Incorrect password' };
      }
    } else if (link.password_hash && !password) {
      return { valid: false, error: 'Password required' };
    }
    
    // Check domain restrictions
    if (link.domain_restrictions?.length > 0 && userEmail) {
      const emailDomain = userEmail.split('@')[1];
      if (!link.domain_restrictions.includes(emailDomain)) {
        return { valid: false, error: 'Access restricted to specific domains' };
      }
    }
    
    // Check IP whitelist
    if (link.ip_whitelist?.length > 0 && userIp) {
      if (!link.ip_whitelist.includes(userIp)) {
        return { valid: false, error: 'Access restricted to specific IP addresses' };
      }
    }
    
    // Decrypt report data
    const decryptedReport = await SecureStorage.decrypt(link.report_data);
    
    // Track view
    await trackView(linkId, userIp);
    
    return { 
      valid: true, 
      data: {
        ...link,
        report_data: JSON.parse(decryptedReport)
      }
    };
  } catch (error) {
    console.error('Error validating magic link:', error);
    return { valid: false, error: 'Failed to validate link' };
  }
}

/**
 * Track view event
 */
async function trackView(linkId: string, userIp?: string) {
  try {
    // Increment view count
    const { error: updateError } = await supabase.rpc('increment_magic_link_views', {
      link_id: linkId
    });
    
    if (updateError) throw updateError;
    
    // Add view event to analytics
    const viewEvent = {
      timestamp: new Date().toISOString(),
      ip: userIp,
      user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
    };
    
    const { error: analyticsError } = await supabase
      .from('magic_link_analytics')
      .insert({
        link_id: linkId,
        event_type: 'view',
        event_data: viewEvent
      });
    
    if (analyticsError) console.error('Error tracking view:', analyticsError);
  } catch (error) {
    console.error('Error tracking view:', error);
  }
}

/**
 * Track download event
 */
export async function trackDownload(linkId: string, format: 'pdf' | 'csv' | 'json') {
  try {
    // Increment download count
    const { error: updateError } = await supabase.rpc('increment_magic_link_downloads', {
      link_id: linkId
    });
    
    if (updateError) throw updateError;
    
    // Add download event to analytics
    const downloadEvent = {
      timestamp: new Date().toISOString(),
      format
    };
    
    const { error: analyticsError } = await supabase
      .from('magic_link_analytics')
      .insert({
        link_id: linkId,
        event_type: 'download',
        event_data: downloadEvent
      });
    
    if (analyticsError) console.error('Error tracking download:', analyticsError);
  } catch (error) {
    console.error('Error tracking download:', error);
  }
}

/**
 * Log share event for user analytics
 */
async function logShareEvent(userId: string, linkId: string, doctorName: string, tier: SubscriptionTier) {
  try {
    const { error } = await supabase
      .from('share_events')
      .insert({
        user_id: userId,
        link_id: linkId,
        doctor_name: doctorName,
        tier,
        created_at: new Date().toISOString()
      });
    
    if (error) console.error('Error logging share event:', error);
  } catch (error) {
    console.error('Error logging share event:', error);
  }
}

/**
 * Get share analytics for a user
 */
export async function getShareAnalytics(userId: string) {
  try {
    const { data, error } = await supabase
      .from('magic_links')
      .select(`
        *,
        magic_link_analytics (*)
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error fetching share analytics:', error);
    return [];
  }
}

/**
 * Revoke a magic link
 */
export async function revokeMagicLink(linkId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('magic_links')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', linkId)
      .eq('created_by', userId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error revoking magic link:', error);
    return { success: false, error: 'Failed to revoke link' };
  }
}

