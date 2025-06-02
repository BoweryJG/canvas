// @ts-nocheck
import { type EnhancedScanResult } from './enhancedAI';
import { type ResearchData } from './webResearch';
import { performAIScan } from './ai';
import { conductDoctorResearch } from './webResearch';

export interface BatchDoctorInput {
  id: string;
  doctor: string;
  practice?: string;
  specialty?: string;
  location?: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
}

export interface BatchAnalysisResult {
  input: BatchDoctorInput;
  scanResult?: EnhancedScanResult;
  researchData?: ResearchData;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  processingTime?: number;
  completedAt?: Date;
}

export interface BatchAnalysisProgress {
  total: number;
  completed: number;
  failed: number;
  currentDoctor?: string;
  estimatedTimeRemaining?: number;
  startTime: Date;
}

export interface BatchAnalysisOptions {
  includeWebResearch: boolean;
  maxConcurrent: number;
  delayBetweenRequests: number;
  prioritizeHighValue: boolean;
  skipLowConfidence: boolean;
  confidenceThreshold: number;
}

export class BatchAnalysisEngine {
  private results: Map<string, BatchAnalysisResult> = new Map();
  private progress: BatchAnalysisProgress;
  private abortController?: AbortController;
  private onProgressUpdate?: (progress: BatchAnalysisProgress) => void;
  private onResultUpdate?: (result: BatchAnalysisResult) => void;

  constructor(
    private options: BatchAnalysisOptions = {
      includeWebResearch: true,
      maxConcurrent: 3,
      delayBetweenRequests: 2000,
      prioritizeHighValue: true,
      skipLowConfidence: false,
      confidenceThreshold: 40
    }
  ) {
    this.progress = {
      total: 0,
      completed: 0,
      failed: 0,
      startTime: new Date()
    };
  }

  /**
   * Set progress callback
   */
  onProgress(callback: (progress: BatchAnalysisProgress) => void): void {
    this.onProgressUpdate = callback;
  }

  /**
   * Set result update callback
   */
  onResult(callback: (result: BatchAnalysisResult) => void): void {
    this.onResultUpdate = callback;
  }

  /**
   * Start batch analysis
   */
  async startBatchAnalysis(doctors: BatchDoctorInput[]): Promise<BatchAnalysisResult[]> {
    console.log(`🚀 Starting batch analysis for ${doctors.length} doctors...`);
    
    // Reset state
    this.results.clear();
    this.abortController = new AbortController();
    
    // Initialize progress
    this.progress = {
      total: doctors.length,
      completed: 0,
      failed: 0,
      startTime: new Date()
    };

    // Initialize results
    doctors.forEach(doctor => {
      this.results.set(doctor.id, {
        input: doctor,
        status: 'pending'
      });
    });

    // Prioritize doctors if enabled
    const orderedDoctors = this.options.prioritizeHighValue 
      ? this.prioritizeDoctors(doctors)
      : doctors;

    try {
      // Process doctors in batches
      await this.processDoctorsInBatches(orderedDoctors);
      
      console.log(`✅ Batch analysis completed: ${this.progress.completed} successful, ${this.progress.failed} failed`);
      
    } catch (error) {
      console.error('Batch analysis error:', error);
      throw error;
    }

    return Array.from(this.results.values());
  }

  /**
   * Stop batch analysis
   */
  stopBatchAnalysis(): void {
    console.log('⏹️ Stopping batch analysis...');
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  /**
   * Get current results
   */
  getResults(): BatchAnalysisResult[] {
    return Array.from(this.results.values());
  }

  /**
   * Get current progress
   */
  getProgress(): BatchAnalysisProgress {
    return { ...this.progress };
  }

  /**
   * Process doctors in controlled batches
   */
  private async processDoctorsInBatches(doctors: BatchDoctorInput[]): Promise<void> {
    const batches = this.createBatches(doctors, this.options.maxConcurrent);
    
    for (let i = 0; i < batches.length; i++) {
      if (this.abortController?.signal.aborted) {
        throw new Error('Batch analysis aborted');
      }

      const batch = batches[i];
      console.log(`📊 Processing batch ${i + 1}/${batches.length} (${batch.length} doctors)`);

      // Process batch concurrently
      const batchPromises = batch.map(doctor => this.processSingleDoctor(doctor));
      await Promise.allSettled(batchPromises);

      // Add delay between batches
      if (i < batches.length - 1 && this.options.delayBetweenRequests > 0) {
        await this.delay(this.options.delayBetweenRequests);
      }
    }
  }

  /**
   * Process a single doctor
   */
  private async processSingleDoctor(doctor: BatchDoctorInput): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Update status
      const result = this.results.get(doctor.id)!;
      result.status = 'processing';
      this.updateProgress(doctor.doctor);

      console.log(`🔍 Processing: ${doctor.doctor}`);

      // Perform AI scan
      const scanResult = await performAIScan(doctor.doctor, doctor.practice || '');
      
      // Check confidence threshold
      if (this.options.skipLowConfidence && scanResult.score < this.options.confidenceThreshold) {
        console.log(`⚠️ Skipping ${doctor.doctor} - low confidence (${scanResult.score}%)`);
        result.status = 'completed';
        result.scanResult = scanResult;
        result.processingTime = Date.now() - startTime;
        result.completedAt = new Date();
        this.progress.completed++;
        this.notifyProgress();
        this.notifyResult(result);
        return;
      }

      result.scanResult = scanResult;

      // Perform web research if enabled
      if (this.options.includeWebResearch) {
        console.log(`🌐 Researching: ${doctor.doctor}`);
        
        try {
          const researchData = await conductDoctorResearch(
            doctor.doctor,
            doctor.practice || `${doctor.doctor} Medical Practice`
          );
          result.researchData = researchData;
        } catch (researchError) {
          console.warn(`Research failed for ${doctor.doctor}:`, researchError);
          // Continue without research data
        }
      }

      // Mark as completed
      result.status = 'completed';
      result.processingTime = Date.now() - startTime;
      result.completedAt = new Date();
      this.progress.completed++;

      console.log(`✅ Completed: ${doctor.doctor} (${result.processingTime}ms)`);

    } catch (error) {
      console.error(`❌ Failed: ${doctor.doctor}`, error);
      
      const result = this.results.get(doctor.id)!;
      result.status = 'failed';
      result.error = error instanceof Error ? error.message : 'Unknown error';
      result.processingTime = Date.now() - startTime;
      result.completedAt = new Date();
      this.progress.failed++;
    }

    this.notifyProgress();
    this.notifyResult(this.results.get(doctor.id)!);
  }

  /**
   * Prioritize doctors based on various factors
   */
  private prioritizeDoctors(doctors: BatchDoctorInput[]): BatchDoctorInput[] {
    return [...doctors].sort((a, b) => {
      // Prioritize by specialty (high-value specialties first)
      const highValueSpecialties = ['cardiology', 'oncology', 'neurology', 'orthopedic', 'radiology'];
      const aHighValue = highValueSpecialties.some(spec => 
        (a.specialty || '').toLowerCase().includes(spec)
      );
      const bHighValue = highValueSpecialties.some(spec => 
        (b.specialty || '').toLowerCase().includes(spec)
      );
      
      if (aHighValue && !bHighValue) return -1;
      if (!aHighValue && bHighValue) return 1;

      // Prioritize by contact information completeness
      const aContactScore = (a.email ? 1 : 0) + (a.phone ? 1 : 0) + (a.website ? 1 : 0);
      const bContactScore = (b.email ? 1 : 0) + (b.phone ? 1 : 0) + (b.website ? 1 : 0);
      
      if (aContactScore !== bContactScore) {
        return bContactScore - aContactScore;
      }

      // Alphabetical by default
      return a.doctor.localeCompare(b.doctor);
    });
  }

  /**
   * Create batches from doctor list
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Update progress tracking
   */
  private updateProgress(currentDoctor?: string): void {
    this.progress.currentDoctor = currentDoctor;
    
    // Calculate estimated time remaining
    const elapsed = Date.now() - this.progress.startTime.getTime();
    const completed = this.progress.completed + this.progress.failed;
    
    if (completed > 0) {
      const avgTimePerDoctor = elapsed / completed;
      const remaining = this.progress.total - completed;
      this.progress.estimatedTimeRemaining = Math.round(avgTimePerDoctor * remaining);
    }
  }

  /**
   * Notify progress update
   */
  private notifyProgress(): void {
    if (this.onProgressUpdate) {
      this.onProgressUpdate({ ...this.progress });
    }
  }

  /**
   * Notify result update
   */
  private notifyResult(result: BatchAnalysisResult): void {
    if (this.onResultUpdate) {
      this.onResultUpdate({ ...result });
    }
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Export analysis results to CSV
 */
export function exportBatchResultsToCSV(results: BatchAnalysisResult[]): string {
  const headers = [
    'Doctor Name',
    'Practice',
    'Specialty',
    'Location',
    'Email',
    'Phone',
    'Website',
    'Status',
    'Fit Score',
    'Research Quality',
    'Recommendations',
    'Processing Time (ms)',
    'Completed At',
    'Error'
  ];

  const rows = results.map(result => [
    result.input.doctor,
    result.input.practice || '',
    result.input.specialty || '',
    result.input.location || '',
    result.input.email || '',
    result.input.phone || '',
    result.input.website || '',
    result.status,
    result.scanResult?.score || '',
    result.scanResult?.researchQuality || '',
    result.scanResult?.recommendations?.slice(0, 2).join('; ') || '',
    result.processingTime || '',
    result.completedAt?.toISOString() || '',
    result.error || ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return csvContent;
}

/**
 * Import doctors from CSV content
 */
export function importDoctorsFromCSV(csvContent: string): BatchDoctorInput[] {
  const lines = csvContent.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must contain at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
  const doctors: BatchDoctorInput[] = [];

  for (let i = 1; i < lines.length; i++) {
    try {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      
      const doctor: BatchDoctorInput = {
        id: `batch_${Date.now()}_${i}`,
        doctor: '',
        practice: '',
        specialty: '',
        location: '',
        email: '',
        phone: '',
        website: '',
        notes: ''
      };

      headers.forEach((header, index) => {
        const value = values[index] || '';
        
        switch (header) {
          case 'doctor':
          case 'doctor name':
          case 'name':
            doctor.doctor = value;
            break;
          case 'practice':
          case 'practice name':
          case 'clinic':
            doctor.practice = value;
            break;
          case 'specialty':
          case 'specialization':
            doctor.specialty = value;
            break;
          case 'location':
          case 'city':
          case 'address':
            doctor.location = value;
            break;
          case 'email':
          case 'email address':
            doctor.email = value;
            break;
          case 'phone':
          case 'phone number':
          case 'telephone':
            doctor.phone = value;
            break;
          case 'website':
          case 'url':
          case 'web':
            doctor.website = value;
            break;
          case 'notes':
          case 'comments':
            doctor.notes = value;
            break;
        }
      });

      if (doctor.doctor) {
        doctors.push(doctor);
      }
    } catch (error) {
      console.warn(`Failed to parse CSV line ${i + 1}:`, error);
    }
  }

  return doctors;
}

/**
 * Generate batch analysis summary
 */
export function generateBatchSummary(results: BatchAnalysisResult[]): {
  totalAnalyzed: number;
  successful: number;
  failed: number;
  averageScore: number;
  highPriorityLeads: number;
  mediumPriorityLeads: number;
  lowPriorityLeads: number;
  averageProcessingTime: number;
  topSpecialties: { specialty: string; count: number; avgScore: number }[];
  recommendations: string[];
} {
  const successful = results.filter(r => r.status === 'completed' && r.scanResult);
  const failed = results.filter(r => r.status === 'failed');
  
  const scores = successful.map(r => r.scanResult!.score);
  const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  
  const processingTimes = results.filter(r => r.processingTime).map(r => r.processingTime!);
  const averageProcessingTime = processingTimes.length > 0 
    ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length 
    : 0;

  // Lead prioritization
  const highPriorityLeads = successful.filter(r => r.scanResult!.score >= 80).length;
  const mediumPriorityLeads = successful.filter(r => r.scanResult!.score >= 60 && r.scanResult!.score < 80).length;
  const lowPriorityLeads = successful.filter(r => r.scanResult!.score < 60).length;

  // Specialty analysis
  const specialtyMap = new Map<string, { count: number; totalScore: number }>();
  successful.forEach(result => {
    const specialty = result.input.specialty || 'Unknown';
    const current = specialtyMap.get(specialty) || { count: 0, totalScore: 0 };
    current.count++;
    current.totalScore += result.scanResult!.score;
    specialtyMap.set(specialty, current);
  });

  const topSpecialties = Array.from(specialtyMap.entries())
    .map(([specialty, data]) => ({
      specialty,
      count: data.count,
      avgScore: data.totalScore / data.count
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5);

  // Generate recommendations
  const recommendations: string[] = [];
  
  if (highPriorityLeads > 0) {
    recommendations.push(`Focus on ${highPriorityLeads} high-priority leads (80%+ fit score) for immediate outreach`);
  }
  
  if (averageScore >= 70) {
    recommendations.push('Overall lead quality is excellent - proceed with comprehensive outreach campaign');
  } else if (averageScore >= 50) {
    recommendations.push('Moderate lead quality - consider refining targeting criteria for better results');
  } else {
    recommendations.push('Low average scores suggest need for better lead qualification or targeting strategy');
  }

  if (topSpecialties.length > 0 && topSpecialties[0].avgScore > averageScore + 10) {
    recommendations.push(`Consider focusing on ${topSpecialties[0].specialty} specialty (${topSpecialties[0].avgScore.toFixed(1)}% avg score)`);
  }

  if (failed.length > successful.length * 0.2) {
    recommendations.push('High failure rate detected - review data quality and API connectivity');
  }

  return {
    totalAnalyzed: results.length,
    successful: successful.length,
    failed: failed.length,
    averageScore: Math.round(averageScore * 10) / 10,
    highPriorityLeads,
    mediumPriorityLeads,
    lowPriorityLeads,
    averageProcessingTime: Math.round(averageProcessingTime),
    topSpecialties,
    recommendations
  };
}