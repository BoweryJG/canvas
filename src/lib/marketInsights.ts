/**
 * Market Insights Data Service
 * Fetches real-time medical market intelligence
 */

import { callPerplexityAPI, callFirecrawlAPI, callBraveSearch } from './marketInsightsAPI';
import { supabase } from '../auth/supabase';

export interface MarketInsight {
  id: string;
  category: 'procedure_volume' | 'market_share' | 'trending' | 'competitor' | 'opportunity';
  title: string;
  metric: string | number;
  change?: number; // percentage change
  trend?: 'up' | 'down' | 'stable';
  details: string;
  source?: string;
  lastUpdated: string;
  territory?: string;
}

export interface ProcedureData {
  name: string;
  specialty: string;
  volume: number;
  growthRate: number;
  reimbursement?: number;
  territory?: string;
}

export interface CompetitorData {
  company: string;
  product: string;
  marketShare: number;
  trend: 'gaining' | 'losing' | 'stable';
  keyDifferentiators: string[];
}

export interface TerritoryMetrics {
  territory: string;
  totalProcedures: number;
  topSpecialties: Array<{name: string; volume: number}>;
  growthRate: number;
  marketPotential: number; // 0-100 score
}

class MarketInsightsService {
  private cache = new Map<string, {data: any, timestamp: number}>();
  private cacheTimeout = 1000 * 60 * 60; // 1 hour cache

  async getMarketOverview(specialty?: string, territory?: string): Promise<MarketInsight[]> {
    const cacheKey = `overview_${specialty}_${territory}`;
    
    // Check cache
    const cached = this.checkCache(cacheKey);
    if (cached) return cached;

    try {
      // Fetch real-time market data
      const query = `medical device market ${specialty || 'all specialties'} ${territory || 'United States'} 2024 statistics trends`;
      
      const searchResults = await callBraveSearch(query);
      const insights: MarketInsight[] = [];

      // Process search results for market insights
      if (searchResults?.web?.results) {
        for (const result of searchResults.web.results.slice(0, 5)) {
          // Extract insights from search results
          const insight = await this.extractMarketInsight(result);
          if (insight) insights.push(insight);
        }
      }

      // Get deeper analysis using Perplexity
      const analysis = await callPerplexityAPI({
        query: `What are the current market trends and procedure volumes for ${specialty || 'medical devices'} in ${territory || 'the US'}? Include specific numbers and growth rates.`,
        model: 'sonar'
      });

      if (analysis) {
        insights.push({
          id: `analysis_${Date.now()}`,
          category: 'market_share',
          title: 'Market Analysis',
          metric: 'AI Analysis',
          details: analysis,
          lastUpdated: new Date().toISOString()
        });
      }

      this.setCache(cacheKey, insights);
      return insights;
    } catch (error) {
      console.error('Error fetching market overview:', error);
      return [];
    }
  }

  async getProcedureVolumes(specialty: string, territory?: string): Promise<ProcedureData[]> {
    const cacheKey = `procedures_${specialty}_${territory}`;
    const cached = this.checkCache(cacheKey);
    if (cached) return cached;

    try {
      // Search for specific procedure volume data
      const query = `${specialty} procedure volumes statistics ${territory || 'US'} 2024 medical`;
      const results = await callBraveSearch(query);
      
      const procedures: ProcedureData[] = [];
      
      // Scrape detailed data from relevant sources
      if (results?.web?.results) {
        for (const result of results.web.results.slice(0, 3)) {
          if (result.url.includes('cms.gov') || result.url.includes('ama-assn.org')) {
            try {
              const scraped = await callFirecrawlAPI({
                url: result.url,
                formats: ['markdown']
              });
              
              // Extract procedure data from scraped content
              const extracted = this.extractProcedureData(scraped?.markdown || '', specialty);
              procedures.push(...extracted);
            } catch (err) {
              console.error('Scraping error:', err);
            }
          }
        }
      }

      // Get AI-enhanced insights
      const aiInsights = await callPerplexityAPI({
        query: `List the top 10 ${specialty} procedures by volume with specific numbers and growth rates for ${territory || 'the US'}`,
        model: 'sonar'
      });

      if (aiInsights) {
        // Parse AI response for structured data
        const parsed = this.parseAIProcedureData(aiInsights, specialty);
        procedures.push(...parsed);
      }

      this.setCache(cacheKey, procedures);
      return procedures;
    } catch (error) {
      console.error('Error fetching procedure volumes:', error);
      return [];
    }
  }

  async getCompetitorAnalysis(product: string, category: string): Promise<CompetitorData[]> {
    const cacheKey = `competitors_${product}_${category}`;
    const cached = this.checkCache(cacheKey);
    if (cached) return cached;

    try {
      const query = `${product} competitors market share ${category} medical device 2024`;
      await callBraveSearch(query);  // Just for logging, we use Perplexity for analysis
      
      const competitors: CompetitorData[] = [];

      // Get detailed competitor analysis
      const analysis = await callPerplexityAPI({
        query: `Analyze the competitive landscape for ${product} in the ${category} market. Include market share percentages, key players, and their differentiators.`,
        model: 'sonar-reasoning'
      });

      if (analysis) {
        const parsed = this.parseCompetitorData(analysis);
        competitors.push(...parsed);
      }

      this.setCache(cacheKey, competitors);
      return competitors;
    } catch (error) {
      console.error('Error fetching competitor analysis:', error);
      return [];
    }
  }

  async getTerritoryMetrics(territory: string): Promise<TerritoryMetrics | null> {
    const cacheKey = `territory_${territory}`;
    const cached = this.checkCache(cacheKey);
    if (cached) return cached;

    try {
      const query = `medical procedure volumes ${territory} healthcare statistics 2024`;
      await callBraveSearch(query);  // Just for logging, we use Perplexity for analysis

      // Get comprehensive territory analysis
      const analysis = await callPerplexityAPI({
        query: `Provide detailed healthcare market metrics for ${territory} including total procedure volumes, top specialties, growth rates, and market potential score (0-100).`,
        model: 'sonar'
      });

      if (analysis) {
        const metrics = this.parseTerritoryMetrics(analysis, territory);
        this.setCache(cacheKey, metrics);
        return metrics;
      }

      return null;
    } catch (error) {
      console.error('Error fetching territory metrics:', error);
      return null;
    }
  }

  async getTrendingInsights(specialty?: string): Promise<MarketInsight[]> {
    try {
      const query = `trending medical procedures innovations ${specialty || 'healthcare'} 2024`;
      const results = await callBraveSearch(query);
      
      const insights: MarketInsight[] = [];

      if (results?.web?.results) {
        for (const result of results.web.results.slice(0, 5)) {
          insights.push({
            id: `trend_${Date.now()}_${Math.random()}`,
            category: 'trending',
            title: result.title,
            metric: 'Trending',
            trend: 'up',
            details: result.description,
            source: result.url || undefined, // Don't pass null/empty strings
            lastUpdated: new Date().toISOString()
          });
        }
      }

      return insights;
    } catch (error) {
      console.error('Error fetching trending insights:', error);
      return [];
    }
  }

  // Helper methods
  private async extractMarketInsight(searchResult: any): Promise<MarketInsight | null> {
    try {
      // Validate required fields
      if (!searchResult?.title || !searchResult?.description) {
        return null;
      }

      // Extract numbers and percentages from description
      const numbers = searchResult.description.match(/\d+\.?\d*%?/g);
      const metric = numbers?.[0] || 'N/A';
      
      return {
        id: `insight_${Date.now()}_${Math.random()}`,
        category: 'market_share',
        title: searchResult.title,
        metric: metric,
        details: searchResult.description,
        source: searchResult.url || undefined, // Don't pass null/empty strings
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      return null;
    }
  }

  private extractProcedureData(content: string, specialty: string): ProcedureData[] {
    // Extract procedure data from scraped content
    const procedures: ProcedureData[] = [];
    
    // Look for tables or structured data
    const lines = content.split('\n');
    for (const line of lines) {
      // Simple extraction logic - can be enhanced
      if (line.includes('procedure') || line.includes('CPT')) {
        const numbers = line.match(/\d+,?\d*/g);
        if (numbers) {
          procedures.push({
            name: line.substring(0, 50),
            specialty: specialty,
            volume: parseInt(numbers[0].replace(/,/g, '')),
            growthRate: 0
          });
        }
      }
    }
    
    return procedures;
  }

  private parseAIProcedureData(aiResponse: string, specialty: string): ProcedureData[] {
    const procedures: ProcedureData[] = [];
    const lines = aiResponse.split('\n');
    
    for (const line of lines) {
      // Look for numbered lists or procedure mentions
      if (/^\d+\./.test(line) || line.toLowerCase().includes('procedure')) {
        const numbers = line.match(/(\d{1,3}(,\d{3})*|\d+)/g);
        const percentages = line.match(/\d+\.?\d*%/g);
        
        if (numbers && numbers.length > 0) {
          procedures.push({
            name: line.replace(/^\d+\.\s*/, '').substring(0, 50),
            specialty: specialty,
            volume: parseInt(numbers[0].replace(/,/g, '')),
            growthRate: percentages ? parseFloat(percentages[0].replace('%', '')) : 0
          });
        }
      }
    }
    
    return procedures;
  }

  private parseCompetitorData(aiResponse: string): CompetitorData[] {
    const competitors: CompetitorData[] = [];
    const lines = aiResponse.split('\n');
    
    let currentCompetitor: Partial<CompetitorData> = {};
    
    for (const line of lines) {
      if (line.includes('Company:') || line.includes('Manufacturer:')) {
        if (currentCompetitor.company) {
          competitors.push(currentCompetitor as CompetitorData);
        }
        currentCompetitor = {
          company: line.split(':')[1]?.trim() || '',
          product: '',
          marketShare: 0,
          trend: 'stable',
          keyDifferentiators: []
        };
      } else if (line.includes('Market Share:') || line.includes('%')) {
        const percentage = line.match(/\d+\.?\d*%/);
        if (percentage && currentCompetitor) {
          currentCompetitor.marketShare = parseFloat(percentage[0].replace('%', ''));
        }
      }
    }
    
    if (currentCompetitor.company) {
      competitors.push(currentCompetitor as CompetitorData);
    }
    
    return competitors;
  }

  private parseTerritoryMetrics(aiResponse: string, territory: string): TerritoryMetrics {
    // Extract metrics from AI response
    const numbers = aiResponse.match(/\d{1,3}(,\d{3})*(\.\d+)?/g) || [];
    const percentages = aiResponse.match(/\d+\.?\d*%/g) || [];
    
    return {
      territory: territory,
      totalProcedures: numbers[0] ? parseInt(numbers[0].replace(/,/g, '')) : 0,
      topSpecialties: [], // Would need more parsing
      growthRate: percentages[0] ? parseFloat(percentages[0].replace('%', '')) : 0,
      marketPotential: Math.floor(Math.random() * 30) + 70 // Placeholder - would calculate based on data
    };
  }

  private checkCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Save insights to database for historical tracking
  async saveInsight(insight: MarketInsight): Promise<void> {
    try {
      await supabase
        .from('market_insights')
        .insert({
          ...insight,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error saving insight:', error);
    }
  }
}

export const marketInsightsService = new MarketInsightsService();