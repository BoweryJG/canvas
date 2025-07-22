/**
 * INTELLIGENCE ORCHESTRATOR
 * Coordinates the complete 3-step workflow for hyper-personalized outreach
 * 
 * Step 1: Precision website discovery (5-10 seconds)
 * Step 2: Deep intelligence extraction from the actual website
 * Step 3: Product-doctor fusion intelligence and content generation
 */

import { discoverPracticeWebsite, type WebsiteDiscoveryResult } from './websiteDiscovery';
import { scrapePracticeWebsite, type ScrapedWebsiteData } from './firecrawlWebScraper';
import { generateProductIntelligence, type ProductIntelligence } from './productIntelligence';
import { generateMultiChannelCampaign, type GeneratedContent } from './aiContentGeneration';
import { type DeepIntelligenceResult } from './deepIntelligenceGatherer';
import { findProcedureByName } from './procedureDatabase';

export interface OrchestrationResult {
  success: boolean;
  doctorName: string;
  productName: string;
  timestamp: Date;
  
  // Step 1: Discovery
  discovery?: {
    websiteFound: boolean;
    websiteUrl?: string;
    confidence?: number;
    discoveryMethod?: string;
    timeElapsed: number;
  };
  
  // Step 2: Intelligence
  intelligence?: {
    websiteData?: ScrapedWebsiteData;
    deepInsights?: DeepIntelligenceResult;
    dataPoints: number;
    timeElapsed: number;
  };
  
  // Step 3: Content
  content?: {
    productIntelligence?: ProductIntelligence;
    generatedContent?: GeneratedContent;
    matchScore?: number;
    timeElapsed: number;
  };
  
  // Summary
  totalTimeElapsed: number;
  errors?: string[];
  warnings?: string[];
}

/**
 * Execute the complete intelligence gathering and content generation workflow
 */
export async function orchestrateIntelligenceWorkflow(
  doctorName: string,
  productName: string,
  location?: string,
  specialty?: string,
  practiceName?: string,
  npi?: string,
  salesRepInfo?: {
    name: string;
    company: string;
  }
): Promise<OrchestrationResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Initialize result
  const result: OrchestrationResult = {
    success: false,
    doctorName,
    productName,
    timestamp: new Date(),
    totalTimeElapsed: 0,
    errors,
    warnings
  };
  
  console.log(`\n🚀 Starting Intelligence Orchestration for Dr. ${doctorName} - ${productName}`);
  console.log(`📍 Location: ${location || 'Unknown'}`);
  console.log(`🏥 Specialty: ${specialty || 'Unknown'}`);
  console.log(`🏢 Practice: ${practiceName || 'Unknown'}`);
  
  // Extract city and state from location
  const locationParts = location ? location.split(',').map(part => part.trim()) : [];
  const city = locationParts[0];
  const state = locationParts[1];
  
  try {
    // ========== STEP 1: PRECISION WEBSITE DISCOVERY ==========
    console.log(`\n📡 STEP 1: Precision Website Discovery`);
    const step1Start = Date.now();
    
    const discoveryResult = await discoverPracticeWebsite(
      doctorName,
      city,
      state,
      specialty,
      practiceName,
      npi
    );
    
    const step1Time = Date.now() - step1Start;
    
    result.discovery = {
      websiteFound: !!discoveryResult,
      websiteUrl: discoveryResult?.websiteUrl,
      confidence: discoveryResult?.confidence,
      discoveryMethod: discoveryResult?.discoveryMethod,
      timeElapsed: step1Time
    };
    
    if (!discoveryResult) {
      errors.push('No practice website found - cannot proceed with intelligence gathering');
      result.totalTimeElapsed = Date.now() - startTime;
      console.log(`❌ Workflow failed: No website found (${result.totalTimeElapsed}ms)`);
      return result;
    }
    
    console.log(`✅ Website discovered in ${step1Time}ms: ${discoveryResult.websiteUrl}`);
    console.log(`   Confidence: ${discoveryResult.confidence}%`);
    console.log(`   Method: ${discoveryResult.discoveryMethod}`);
    
    // ========== STEP 2: DEEP INTELLIGENCE EXTRACTION ==========
    console.log(`\n🔍 STEP 2: Deep Intelligence Extraction`);
    const step2Start = Date.now();
    
    // Scrape the website
    const scrapedData = await scrapePracticeWebsite(discoveryResult.websiteUrl);
    
    if (!scrapedData) {
      warnings.push('Website scraping failed - limited intelligence available');
    }
    
    // Create deep intelligence result
    const deepInsights: DeepIntelligenceResult = {
      confidence: discoveryResult.confidence,
      website: discoveryResult.websiteUrl,
      summary: `Dr. ${doctorName} practices at ${scrapedData?.title || discoveryResult.title}`,
      keyPoints: generateKeyInsights(scrapedData, discoveryResult),
      practiceInfo: {
        name: scrapedData?.title,
        address: scrapedData?.contactInfo?.address,
        phone: scrapedData?.contactInfo?.phone,
        email: scrapedData?.contactInfo?.email,
        services: scrapedData?.practiceInfo?.specialties,
        about: scrapedData?.description
      },
      sources: [{
        url: discoveryResult.websiteUrl,
        type: 'practice_website',
        relevance: discoveryResult.confidence
      }]
    };
    
    const step2Time = Date.now() - step2Start;
    const dataPoints = countDataPoints(scrapedData);
    
    result.intelligence = {
      websiteData: scrapedData || undefined,
      deepInsights,
      dataPoints,
      timeElapsed: step2Time
    };
    
    console.log(`✅ Intelligence extracted in ${step2Time}ms: ${dataPoints} data points`);
    if (scrapedData) {
      console.log(`   Dental Tech: ${Object.keys(scrapedData.dentalTechnology).filter(k => scrapedData.dentalTechnology[k as keyof typeof scrapedData.dentalTechnology]).length} technologies`);
      console.log(`   Specialties: ${scrapedData.practiceInfo?.specialties?.length || 0}`);
      console.log(`   Procedures: ${Object.keys(scrapedData.dentalProcedures).filter(k => scrapedData.dentalProcedures[k as keyof typeof scrapedData.dentalProcedures]).length + Object.keys(scrapedData.aestheticProcedures).filter(k => scrapedData.aestheticProcedures[k as keyof typeof scrapedData.aestheticProcedures]).length} total`);
    }
    
    // ========== STEP 3: PRODUCT-DOCTOR FUSION & CONTENT GENERATION ==========
    console.log(`\n✨ STEP 3: Product Intelligence & Content Generation`);
    const step3Start = Date.now();
    
    // Generate product intelligence
    const productIntelligence = scrapedData 
      ? await generateProductIntelligence(productName, deepInsights, scrapedData)
      : null;
    
    if (!productIntelligence) {
      warnings.push('Product intelligence generation failed');
    }
    
    // Find procedure for additional context
    const procedure = await findProcedureByName(productName);
    
    // Generate hyper-personalized content
    const generatedContent = await generateMultiChannelCampaign(
      doctorName,
      productName,
      {
        enhancedInsights: deepInsights,
        practiceInfo: deepInsights.practiceInfo || {},
        sources: deepInsights.sources
      } as any,
      salesRepInfo?.name || 'Sales Rep',
      salesRepInfo?.company || 'Company',
      procedure || undefined,
      scrapedData || undefined,
      productIntelligence || undefined
    );
    
    const step3Time = Date.now() - step3Start;
    
    result.content = {
      productIntelligence: productIntelligence || undefined,
      generatedContent,
      matchScore: productIntelligence?.matchScore,
      timeElapsed: step3Time
    };
    
    console.log(`✅ Content generated in ${step3Time}ms`);
    if (productIntelligence) {
      console.log(`   Match Score: ${productIntelligence.matchScore}%`);
      console.log(`   ROI Timeline: ${productIntelligence.roiCalculation.timeToROI}`);
      console.log(`   Benefits: ${productIntelligence.personalizedBenefits.length} personalized`);
    }
    
    // ========== WORKFLOW COMPLETE ==========
    result.success = true;
    result.totalTimeElapsed = Date.now() - startTime;
    
    console.log(`\n✅ WORKFLOW COMPLETE in ${result.totalTimeElapsed}ms (${(result.totalTimeElapsed / 1000).toFixed(1)}s)`);
    console.log(`   Step 1 (Discovery): ${result.discovery?.timeElapsed || 0}ms`);
    console.log(`   Step 2 (Intelligence): ${result.intelligence?.timeElapsed || 0}ms`);
    console.log(`   Step 3 (Content): ${result.content?.timeElapsed || 0}ms`);
    
    if (warnings.length > 0) {
      console.log(`\n⚠️  Warnings: ${warnings.join(', ')}`);
    }
    
    return result;
    
  } catch (error) {
    console.error(`\n❌ Orchestration error:`, error);
    errors.push(error instanceof Error ? error.message : 'Unknown error');
    result.totalTimeElapsed = Date.now() - startTime;
    return result;
  }
}

/**
 * Generate key insights from scraped data
 */
function generateKeyInsights(
  scrapedData: ScrapedWebsiteData | null, 
  discoveryResult: WebsiteDiscoveryResult
): string[] {
  const insights: string[] = [];
  
  // Discovery insights
  insights.push(`✅ Official website verified (${discoveryResult.discoveryMethod})`);
  insights.push(`🎯 ${discoveryResult.verificationSignals.length} verification signals confirmed`);
  
  if (!scrapedData) {
    insights.push(`🔗 ${discoveryResult.websiteUrl}`);
    insights.push('📞 Visit website for detailed information');
    return insights;
  }
  
  // Practice insights
  if (scrapedData.practiceInfo?.teamSize) {
    insights.push(`👥 ${scrapedData.practiceInfo.teamSize}-member team`);
  }
  
  if (scrapedData.practiceInfo?.specialties?.length) {
    insights.push(`🦷 ${scrapedData.practiceInfo.specialties.length} specialties offered`);
  }
  
  // Medical Tech insights
  const dentalTechCount = Object.values(scrapedData.dentalTechnology).filter(v => v).length;
  if (dentalTechCount > 0) {
    insights.push(`💻 ${dentalTechCount} dental technologies in use`);
  }
  
  const aestheticDeviceCount = Object.values(scrapedData.aestheticDevices).filter(v => v).length;
  if (aestheticDeviceCount > 0) {
    insights.push(`✨ ${aestheticDeviceCount} aesthetic devices available`);
  }
  
  // Missing opportunities
  if (scrapedData.missingProcedures?.length) {
    insights.push(`🎯 ${scrapedData.missingProcedures.length} improvement opportunities identified`);
  }
  
  return insights;
}

/**
 * Count total data points extracted
 */
function countDataPoints(scrapedData: ScrapedWebsiteData | null): number {
  if (!scrapedData) return 0;
  
  let count = 0;
  
  // Basic info
  if (scrapedData.title) count++;
  if (scrapedData.description) count++;
  
  // Medical procedures
  count += Object.values(scrapedData.dentalProcedures).filter(v => v).length;
  count += Object.values(scrapedData.aestheticProcedures).filter(v => v).length;
  
  // Medical technology
  count += Object.values(scrapedData.dentalTechnology).filter(v => v).length;
  count += Object.values(scrapedData.aestheticDevices).filter(v => v).length;
  count += Object.values(scrapedData.implantSystems).filter(v => v).length;
  count += Object.values(scrapedData.injectableBrands).filter(v => v).length;
  
  // Contact info
  count += Object.values(scrapedData.contactInfo).filter(v => v).length;
  
  // Practice info
  count += Object.values(scrapedData.practiceInfo).filter(v => v).length;
  
  // Competitive intelligence
  count += (scrapedData.missingProcedures?.length || 0);
  count += (scrapedData.competitiveAdvantages?.length || 0);
  
  return count;
}

/**
 * Quick validation to check if orchestration can proceed
 */
export function validateOrchestrationInputs(
  doctorName: string,
  productName: string
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!doctorName || doctorName.trim().length < 2) {
    errors.push('Doctor name is required');
  }
  
  if (!productName || productName.trim().length < 2) {
    errors.push('Product name is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Format orchestration result for display
 */
export function formatOrchestrationSummary(result: OrchestrationResult): string {
  if (!result.success) {
    return `❌ Intelligence gathering failed for Dr. ${result.doctorName}\n` +
           `Errors: ${result.errors?.join(', ') || 'Unknown error'}\n` +
           `Time elapsed: ${(result.totalTimeElapsed / 1000).toFixed(1)}s`;
  }
  
  const sections: string[] = [];
  
  // Header
  sections.push(`✅ Intelligence Report for Dr. ${result.doctorName}`);
  sections.push(`Product: ${result.productName}`);
  sections.push(`Generated: ${result.timestamp.toLocaleString()}`);
  sections.push('');
  
  // Discovery
  if (result.discovery?.websiteFound) {
    sections.push(`🌐 Website: ${result.discovery.websiteUrl}`);
    sections.push(`   Confidence: ${result.discovery.confidence}%`);
    sections.push(`   Discovery: ${result.discovery.discoveryMethod}`);
  }
  
  // Intelligence
  if (result.intelligence?.dataPoints) {
    sections.push('');
    sections.push(`📊 Intelligence: ${result.intelligence.dataPoints} data points`);
    if (result.intelligence.websiteData) {
      const data = result.intelligence.websiteData;
      sections.push(`   Dental Tech: ${Object.keys(data.dentalTechnology).filter(k => data.dentalTechnology[k as keyof typeof data.dentalTechnology]).length} devices`);
      sections.push(`   Specialties: ${data.practiceInfo?.specialties?.slice(0, 3).join(', ') || 'Not detected'}`);
      sections.push(`   Team Size: ${data.practiceInfo?.teamSize || 'Unknown'}`);
    }
  }
  
  // Product Match
  if (result.content?.matchScore) {
    sections.push('');
    sections.push(`🎯 Product Match: ${result.content.matchScore}%`);
    if (result.content.productIntelligence) {
      const intel = result.content.productIntelligence;
      sections.push(`   ROI Timeline: ${intel.roiCalculation.timeToROI}`);
      sections.push(`   Patient Volume: +${intel.roiCalculation.patientVolumeIncrease}`);
    }
  }
  
  // Timing
  sections.push('');
  sections.push(`⏱️  Total Time: ${(result.totalTimeElapsed / 1000).toFixed(1)}s`);
  
  // Warnings
  if (result.warnings?.length) {
    sections.push('');
    sections.push(`⚠️  Warnings: ${result.warnings.join(', ')}`);
  }
  
  return sections.join('\n');
}