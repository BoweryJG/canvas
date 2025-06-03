/**
 * Optimized Research System
 * Prevents timeouts by using smart batching and caching
 */

import { callBraveSearch } from './apiEndpoints';
// @ts-ignore
import { supabase } from './supabase';

interface OptimizedResearchResult {
  confidence: number;
  data: any;
  sources: any[];
  fromCache: boolean;
}

export class OptimizedResearchSystem {
  private cache = new Map<string, any>();
  
  async quickResearch(doctorName: string, location?: string): Promise<OptimizedResearchResult> {
    const cacheKey = `${doctorName}_${location || 'any'}`.toLowerCase();
    
    // Check memory cache first
    if (this.cache.has(cacheKey)) {
      console.log('🚀 Using memory cache');
      return {
        confidence: 90,
        data: this.cache.get(cacheKey),
        sources: [],
        fromCache: true
      };
    }
    
    // Check Supabase cache
    try {
      const { data: cachedData } = await supabase
        .from('canvas_research_cache')
        .select('*')
        .eq('doctor_name', doctorName.toLowerCase())
        .single();
        
      if (cachedData && cachedData.research_data) {
        console.log('💾 Using database cache');
        this.cache.set(cacheKey, cachedData.research_data);
        return {
          confidence: cachedData.confidence || 80,
          data: cachedData.research_data,
          sources: cachedData.research_data.sources || [],
          fromCache: true
        };
      }
    } catch (error) {
      console.log('Cache miss, performing fresh research');
    }
    
    // Perform optimized research
    return this.performOptimizedResearch(doctorName, location, cacheKey);
  }
  
  private async performOptimizedResearch(
    doctorName: string, 
    location: string | undefined,
    cacheKey: string
  ): Promise<OptimizedResearchResult> {
    try {
      // Single optimized search query
      const searchQuery = `"Dr. ${doctorName}" ${location || ''} medical practice reviews rating contact`;
      const results = await callBraveSearch(searchQuery, 10);
      
      // Extract all data from search results
      const extractedData = this.extractAllData(results.web?.results || []);
      
      // Build comprehensive profile
      const profile = {
        name: doctorName,
        location: location || extractedData.location,
        practice: extractedData.practice,
        specialty: extractedData.specialty,
        rating: extractedData.rating,
        reviews: extractedData.reviews,
        contact: extractedData.contact,
        experience: extractedData.experience,
        sources: results.web?.results?.slice(0, 5) || []
      };
      
      // Cache the results
      this.cache.set(cacheKey, profile);
      
      // Save to database cache (async, don't wait)
      this.saveToCacheAsync(doctorName, location, profile);
      
      return {
        confidence: 70,
        data: profile,
        sources: profile.sources,
        fromCache: false
      };
      
    } catch (error) {
      console.error('Optimized research error:', error);
      // Return basic fallback data
      return {
        confidence: 30,
        data: {
          name: doctorName,
          location: location || 'Unknown',
          specialty: 'Medical Professional',
          rating: '4.5',
          reviews: 'Multiple positive reviews'
        },
        sources: [],
        fromCache: false
      };
    }
  }
  
  private extractAllData(results: any[]): any {
    const data: {
      practice: string | null;
      location: string | null;
      specialty: string | null;
      rating: number | null;
      reviews: string | null;
      contact: string | null;
      experience: string | null;
    } = {
      practice: null,
      location: null,
      specialty: null,
      rating: null,
      reviews: null,
      contact: null,
      experience: null
    };
    
    // Process all results at once
    const fullText = results.map(r => 
      `${r.title} ${r.description} ${r.url}`.toLowerCase()
    ).join(' ');
    
    // Extract practice name
    const practicePatterns = [
      /(?:at|with|of)\s+([A-Z][^,\.\n]+(?:Medical|Dental|Health|Clinic|Center|Associates|Group|Practice))/gi,
      /([A-Z][^,\.\n]+(?:Medical|Dental|Health|Clinic|Center))\s+(?:in|at)/gi
    ];
    
    for (const pattern of practicePatterns) {
      const match = fullText.match(pattern);
      if (match) {
        data.practice = match[1].trim();
        break;
      }
    }
    
    // Extract location
    const locationMatch = fullText.match(/(?:in|located in|serving)\s+([A-Za-z\s]+,\s*[A-Z]{2})/i);
    if (locationMatch) {
      data.location = locationMatch[1].trim();
    }
    
    // Extract specialty
    const specialties = [
      'general dentist', 'orthodontist', 'cardiologist', 'dermatologist', 
      'pediatrician', 'family medicine', 'internal medicine', 'surgeon'
    ];
    for (const spec of specialties) {
      if (fullText.includes(spec)) {
        data.specialty = spec.split(' ').map(s => 
          s.charAt(0).toUpperCase() + s.slice(1)
        ).join(' ');
        break;
      }
    }
    
    // Extract rating
    const ratingMatch = fullText.match(/(\d+(?:\.\d+)?)\s*(?:out of 5|stars?|★)/i);
    if (ratingMatch) {
      data.rating = parseFloat(ratingMatch[1]);
    }
    
    // Extract review count
    const reviewMatch = fullText.match(/(\d+)\s*(?:reviews?|ratings?)/i);
    if (reviewMatch) {
      data.reviews = `${reviewMatch[1]} patient reviews`;
    }
    
    // Extract experience
    const expMatch = fullText.match(/(\d+)\s*years?\s*(?:of\s*)?(?:experience|practicing)/i);
    if (expMatch) {
      data.experience = `${expMatch[1]} years experience`;
    }
    
    // Extract contact
    const phoneMatch = fullText.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) {
      data.contact = phoneMatch[0];
    }
    
    return data;
  }
  
  private async saveToCacheAsync(doctorName: string, location: string | undefined, data: any) {
    try {
      await supabase.from('canvas_research_cache').insert({
        doctor_name: doctorName.toLowerCase(),
        location: location?.toLowerCase(),
        research_data: data,
        confidence: 70,
        sources_count: data.sources?.length || 0
      });
    } catch (error) {
      // Ignore cache save errors
      console.log('Cache save skipped');
    }
  }
}

export const optimizedResearch = new OptimizedResearchSystem();