/**
 * Social Media Intelligence Gathering using Apify Actors
 * Scrapes Instagram, LinkedIn, Facebook, Twitter for practice insights
 */

import { getApiEndpoint } from '../config/api';
import { type Doctor } from '../components/DoctorAutocomplete';

// Popular Apify actors for social media scraping
const APIFY_ACTORS = {
  INSTAGRAM_PROFILE: 'apify/instagram-profile-scraper',
  INSTAGRAM_POSTS: 'apify/instagram-post-scraper', 
  INSTAGRAM_HASHTAG: 'apify/instagram-hashtag-scraper',
  LINKEDIN_PROFILE: 'apify/linkedin-profile-scraper',
  FACEBOOK_PAGES: 'apify/facebook-pages-scraper',
  TWITTER_SCRAPER: 'apify/twitter-scraper',
  GOOGLE_REVIEWS: 'apify/google-reviews-scraper',
  YOUTUBE_CHANNEL: 'apify/youtube-scraper',
  TIKTOK_SCRAPER: 'apify/tiktok-scraper'
};

export interface SocialMediaProfile {
  platform: 'instagram' | 'linkedin' | 'facebook' | 'twitter' | 'tiktok';
  handle: string;
  url: string;
  followerCount: number;
  postCount: number;
  engagementRate: number;
  verified: boolean;
  bio: string;
  recentPosts: SocialPost[];
  insights: {
    postingFrequency: string;
    topHashtags: string[];
    contentThemes: string[];
    audienceGrowth: string;
  };
}

export interface SocialPost {
  id: string;
  url: string;
  text: string;
  timestamp: Date;
  likes: number;
  comments: number;
  shares?: number;
  hashtags: string[];
  mentions: string[];
  mediaType: 'photo' | 'video' | 'carousel' | 'text';
  insights: {
    sentiment: 'positive' | 'neutral' | 'negative';
    topics: string[];
    engagement: 'high' | 'medium' | 'low';
  };
}

export interface SocialMediaIntelligence {
  profiles: SocialMediaProfile[];
  overallPresence: 'Strong' | 'Moderate' | 'Weak' | 'None';
  contentStrategy: {
    primaryPlatforms: string[];
    postingConsistency: string;
    contentTypes: string[];
    audienceEngagement: string;
  };
  opportunities: {
    untappedPlatforms: string[];
    contentGaps: string[];
    engagementTips: string[];
  };
  competitorComparison: {
    averageFollowers: number;
    averageEngagement: number;
    position: 'Leader' | 'Average' | 'Lagging';
  };
}

/**
 * Call Apify Actor through our backend
 */
async function callApifyActor(actorId: string, input: unknown, waitForFinish = true): Promise<unknown[]> {
  try {
    const response = await fetch(getApiEndpoint('apifyActor'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ actorId, input, waitForFinish })
    });

    if (!response.ok) {
      throw new Error(`Apify API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (_) {
    console.error('Apify actor error:', error);
    return [];
  }
}

/**
 * Find and scrape Instagram profile for a doctor/practice
 */
export async function scrapeInstagramProfile(doctor: Doctor): Promise<SocialMediaProfile | null> {
  console.log('📸 Searching for Instagram profile:', doctor.displayName);
  
  try {
    // First, try to find their Instagram handle
    const searchTerms = [
      doctor.organizationName,
      `${doctor.displayName} dentist`,
      `${doctor.displayName} ${doctor.city}`
    ].filter(Boolean);
    
    for (const term of searchTerms) {
      if (!term) continue;
      const results = await callApifyActor(APIFY_ACTORS.INSTAGRAM_PROFILE, {
        usernames: [term.toLowerCase().replace(/[^a-z0-9]/g, '')],
        resultsLimit: 1
      });
      
      if (results && results.length > 0) {
        interface InstagramProfile {
          username: string;
          followersCount?: number;
          postsCount?: number;
          verified?: boolean;
        }
        const profile = results[0] as InstagramProfile;
        
        // Get recent posts
        const postsData = await callApifyActor(APIFY_ACTORS.INSTAGRAM_POSTS, {
          username: profile.username,
          resultsLimit: 12 // Last 12 posts
        });
        
        interface PostData {
          id: string;
          url: string;
          caption?: string;
          timestamp: string;
          likesCount?: number;
          commentsCount?: number;
          type?: string;
        }
        
        const recentPosts = ((postsData || []) as PostData[]).map((post: PostData) => ({
          id: post.id,
          url: post.url,
          text: post.caption || '',
          timestamp: new Date(post.timestamp),
          likes: post.likesCount || 0,
          comments: post.commentsCount || 0,
          hashtags: extractHashtags(post.caption || ''),
          mentions: extractMentions(post.caption || ''),
          mediaType: (post.type === 'Video' ? 'video' : post.type === 'Sidecar' ? 'carousel' : 'photo') as 'photo' | 'video' | 'carousel',
          insights: analyzePostContent(post as PostWithCaption)
        }));
        
        return {
          platform: 'instagram',
          handle: profile.username,
          url: `https://instagram.com/${profile.username}`,
          followerCount: profile.followersCount || 0,
          postCount: profile.postsCount || 0,
          engagementRate: calculateEngagementRate(profile, recentPosts),
          verified: profile.verified || false,
          bio: profile.biography || '',
          recentPosts,
          insights: generateInstagramInsights(profile, recentPosts)
        };
      }
    }
  } catch (_) {
    console.error('Instagram scraping error:', error);
  }
  
  return null;
}

/**
 * Scrape Google Reviews for the practice
 */
interface GoogleReviewsResult {
  totalReviews: number;
  averageRating: number;
  reviews: Array<{
    text: string;
    rating: number;
    date: string;
    reviewer: string;
    responseFromOwner?: string;
  }>;
  insights: unknown;
}

export async function scrapeGoogleReviews(doctor: Doctor): Promise<GoogleReviewsResult | null> {
  try {
    const searchQuery = `${doctor.organizationName || doctor.displayName} ${doctor.city} ${doctor.state}`;
    
    const results = await callApifyActor(APIFY_ACTORS.GOOGLE_REVIEWS, {
      queries: [searchQuery],
      maxReviews: 20,
      includeReviewerDetails: true
    });
    
    if (results && results.length > 0) {
      const reviews = results[0].reviews || [];
      
      interface ReviewData {
        text: string;
        stars: number;
        publishedAtDate: string;
        name: string;
        responseFromOwnerText?: string;
      }
      
      return {
        totalReviews: results[0].totalScore,
        averageRating: results[0].averageRating,
        reviews: reviews.map((r: ReviewData) => ({
          text: r.text,
          rating: r.stars,
          date: r.publishedAtDate,
          reviewer: r.name,
          responseFromOwner: r.responseFromOwnerText
        })),
        insights: analyzeReviews(reviews)
      };
    }
  } catch (_) {
    console.error('Google Reviews scraping error:', error);
  }
  
  return null;
}

/**
 * Get comprehensive social media intelligence
 */
export async function gatherSocialMediaIntelligence(doctor: Doctor): Promise<SocialMediaIntelligence> {
  console.log('🌐 Gathering social media intelligence for:', doctor.displayName);
  
  const profiles: SocialMediaProfile[] = [];
  
  // Scrape multiple platforms in parallel
  const [instagram, _googleReviews] = await Promise.all([
    scrapeInstagramProfile(doctor),
    scrapeGoogleReviews(doctor)
  ]);
  
  if (instagram) {
    profiles.push(instagram);
  }
  
  // Determine overall presence
  const overallPresence = profiles.length === 0 ? 'None' :
    profiles.some(p => p.followerCount > 1000) ? 'Strong' :
    profiles.some(p => p.followerCount > 500) ? 'Moderate' : 'Weak';
  
  // Analyze content strategy
  const contentStrategy = analyzeContentStrategy(profiles);
  
  // Identify opportunities
  const opportunities = identifyOpportunities(profiles, doctor);
  
  // Compare with competitors (mock data for now)
  const competitorComparison = {
    averageFollowers: 850,
    averageEngagement: 3.2,
    position: (profiles.length > 0 && profiles[0].followerCount > 850 ? 'Leader' : 
              profiles.length > 0 ? 'Average' : 'Lagging') as 'Leader' | 'Average' | 'Lagging'
  };
  
  return {
    profiles,
    overallPresence,
    contentStrategy,
    opportunities,
    competitorComparison
  };
}

// Helper functions
function extractHashtags(text: string): string[] {
  const regex = /#\w+/g;
  return (text.match(regex) || []).map(tag => tag.toLowerCase());
}

function extractMentions(text: string): string[] {
  const regex = /@\w+/g;
  return (text.match(regex) || []).map(mention => mention.toLowerCase());
}

interface ProfileWithFollowers {
  followersCount?: number;
}

function calculateEngagementRate(profile: ProfileWithFollowers, posts: SocialPost[]): number {
  if (!posts.length || !profile.followersCount) return 0;
  
  const totalEngagement = posts.reduce((sum, post) => sum + post.likes + post.comments, 0);
  const avgEngagement = totalEngagement / posts.length;
  
  return Number(((avgEngagement / profile.followersCount) * 100).toFixed(2));
}

interface PostWithCaption {
  caption?: string;
  likesCount?: number;
  commentsCount?: number;
}

function analyzePostContent(post: PostWithCaption): SocialPost['insights'] {
  const text = (post.caption || '').toLowerCase();
  
  // Simple sentiment analysis
  const positiveWords = ['happy', 'excited', 'love', 'great', 'amazing', 'wonderful', 'best'];
  const negativeWords = ['sad', 'disappointed', 'sorry', 'unfortunately', 'problem'];
  
  const positiveCount = positiveWords.filter(word => text.includes(word)).length;
  const negativeCount = negativeWords.filter(word => text.includes(word)).length;
  
  const sentiment = positiveCount > negativeCount ? 'positive' : 
                   negativeCount > positiveCount ? 'negative' : 'neutral';
  
  // Extract topics
  const topics = [];
  if (text.includes('patient') || text.includes('smile')) topics.push('patient care');
  if (text.includes('team') || text.includes('staff')) topics.push('team culture');
  if (text.includes('technology') || text.includes('equipment')) topics.push('technology');
  if (text.includes('community') || text.includes('event')) topics.push('community involvement');
  
  // Engagement level
  const likes = post.likesCount || 0;
  const comments = post.commentsCount || 0;
  const engagement = (likes + comments * 2) > 100 ? 'high' :
                    (likes + comments * 2) > 50 ? 'medium' : 'low';
  
  return { sentiment, topics, engagement };
}

function generateInstagramInsights(_profile: ProfileWithFollowers, posts: SocialPost[]): SocialMediaProfile['insights'] {
  // Calculate posting frequency
  const dateRange = posts.length > 1 ? 
    (Date.now() - posts[posts.length - 1].timestamp.getTime()) / (1000 * 60 * 60 * 24) : 30;
  const postsPerWeek = (posts.length / dateRange) * 7;
  
  const postingFrequency = postsPerWeek > 3 ? 'Very Active (3+ posts/week)' :
                          postsPerWeek > 1 ? 'Active (1-3 posts/week)' :
                          postsPerWeek > 0.5 ? 'Moderate (2-4 posts/month)' :
                          'Inactive (< 2 posts/month)';
  
  // Get top hashtags
  const allHashtags = posts.flatMap(p => p.hashtags);
  const hashtagCounts = allHashtags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topHashtags = Object.entries(hashtagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag);
  
  // Identify content themes
  const allTopics = posts.flatMap(p => p.insights.topics);
  const uniqueThemes = [...new Set(allTopics)];
  
  // Estimate audience growth
  const avgEngagement = posts.reduce((sum, p) => sum + p.likes + p.comments, 0) / posts.length;
  const audienceGrowth = avgEngagement > 50 ? 'Growing' : 
                        avgEngagement > 20 ? 'Stable' : 'Stagnant';
  
  return {
    postingFrequency,
    topHashtags,
    contentThemes: uniqueThemes,
    audienceGrowth
  };
}

function analyzeContentStrategy(profiles: SocialMediaProfile[]): SocialMediaIntelligence['contentStrategy'] {
  if (profiles.length === 0) {
    return {
      primaryPlatforms: [],
      postingConsistency: 'No social media presence',
      contentTypes: [],
      audienceEngagement: 'None'
    };
  }
  
  const primaryPlatforms = profiles
    .sort((a, b) => b.followerCount - a.followerCount)
    .map(p => p.platform);
  
  const avgPostingFrequency = profiles
    .map(p => p.insights.postingFrequency)
    .filter(f => f.includes('Active'))[0] || 'Inconsistent';
  
  const allContentTypes = profiles
    .flatMap(p => p.recentPosts.map(post => post.mediaType))
    .filter((v, i, a) => a.indexOf(v) === i);
  
  const avgEngagementRate = profiles.reduce((sum, p) => sum + p.engagementRate, 0) / profiles.length;
  const audienceEngagement = avgEngagementRate > 5 ? 'High' :
                            avgEngagementRate > 2 ? 'Moderate' : 'Low';
  
  return {
    primaryPlatforms,
    postingConsistency: avgPostingFrequency,
    contentTypes: allContentTypes,
    audienceEngagement
  };
}

function identifyOpportunities(profiles: SocialMediaProfile[], _doctor: Doctor): SocialMediaIntelligence['opportunities'] {
  const activePlatforms = new Set(profiles.map(p => p.platform));
  const allPlatforms = ['instagram', 'facebook', 'linkedin', 'twitter', 'tiktok'];
  
  const untappedPlatforms = allPlatforms.filter(p => !activePlatforms.has(p as 'instagram' | 'facebook' | 'linkedin' | 'twitter' | 'tiktok'));
  
  const contentGaps = [];
  if (!profiles.some(p => p.recentPosts.some(post => post.insights.topics.includes('patient testimonials')))) {
    contentGaps.push('Patient success stories and testimonials');
  }
  if (!profiles.some(p => p.recentPosts.some(post => post.insights.topics.includes('technology')))) {
    contentGaps.push('Showcase practice technology and innovations');
  }
  if (!profiles.some(p => p.recentPosts.some(post => post.mediaType === 'video'))) {
    contentGaps.push('Video content (tours, procedures, team intros)');
  }
  
  const engagementTips = [];
  if (profiles.some(p => p.engagementRate < 2)) {
    engagementTips.push('Use more engaging captions with questions');
    engagementTips.push('Post at optimal times (lunch and evening)');
    engagementTips.push('Respond to all comments within 24 hours');
  }
  
  return {
    untappedPlatforms,
    contentGaps,
    engagementTips
  };
}

interface ReviewData {
  stars: number;
  text: string;
  responseFromOwner?: boolean;
}

interface ReviewAnalysis {
  averageRating: number;
  totalReviews: number;
  sentimentBreakdown: Record<string, number>;
  commonThemes: string[];
  responseRate: number;
}

function analyzeReviews(reviews: ReviewData[]): ReviewAnalysis {
  const sentiments = reviews.map(r => {
    if (r.stars >= 4) return 'positive';
    if (r.stars >= 3) return 'neutral';
    return 'negative';
  });
  
  const themes = [];
  const allText = reviews.map((r: ReviewData) => r.text.toLowerCase()).join(' ');
  
  if (allText.includes('friendly') || allText.includes('nice')) themes.push('Friendly staff');
  if (allText.includes('clean') || allText.includes('modern')) themes.push('Clean facility');
  if (allText.includes('wait') || allText.includes('time')) themes.push('Wait times');
  if (allText.includes('pain') || allText.includes('gentle')) themes.push('Pain management');
  
  return {
    sentimentBreakdown: {
      positive: sentiments.filter(s => s === 'positive').length,
      neutral: sentiments.filter(s => s === 'neutral').length,
      negative: sentiments.filter(s => s === 'negative').length
    },
    commonThemes: themes,
    responseRate: reviews.filter((r: ReviewData) => r.responseFromOwner).length / reviews.length
  };
}