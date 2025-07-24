/**
 * Render Backend API Integration
 * Handles all communication with the persistent backend
 */

const RENDER_BACKEND_URL = 'https://osbackend-zl1h.onrender.com';

export interface ResearchJob {
  jobId: string;
  status: 'started' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedTime?: number;
  pollUrl?: string;
  data?: unknown;
  fromCache?: boolean;
}

interface StageResult {
  status: string;
  result: unknown;
}

export interface JobStatus {
  jobId: string;
  status: string;
  progress: number;
  stages: {
    website: StageResult;
    reviews: StageResult;
    competition: StageResult;
    synthesis: StageResult;
  };
  elapsedTime: number;
  updates: string[];
  data?: unknown;
  confidence?: unknown;
  error?: string;
}

/**
 * Start a new research job on the backend
 */
interface DoctorData {
  displayName?: string;
  npi?: string;
  [key: string]: unknown;
}

export async function startResearchJob(
  doctor: DoctorData,
  product: string,
  userId?: string
): Promise<ResearchJob> {
  try {
    const response = await fetch(`${RENDER_BACKEND_URL}/api/research/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        doctor,
        product,
        userId: userId || 'anonymous'
      })
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to start research job:', error);
    throw error;
  }
}

/**
 * Poll job status
 */
export async function getJobStatus(jobId: string): Promise<JobStatus> {
  try {
    const response = await fetch(`${RENDER_BACKEND_URL}/api/research/${jobId}/status`);
    
    if (!response.ok) {
      throw new Error(`Failed to get job status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to get job status:', error);
    throw error;
  }
}

/**
 * Stream job updates via Server-Sent Events
 */
interface StreamUpdate {
  type: 'progress' | 'final' | 'error';
  [key: string]: unknown;
}

export function streamJobUpdates(
  jobId: string,
  onUpdate: (update: StreamUpdate) => void,
  onComplete: (result: StreamUpdate) => void,
  onError: (error: Error | StreamUpdate) => void
): () => void {
  const eventSource = new EventSource(
    `${RENDER_BACKEND_URL}/api/research/${jobId}/stream`
  );

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    switch (data.type) {
      case 'progress':
        onUpdate(data);
        break;
      case 'final':
        onComplete(data);
        eventSource.close();
        break;
      case 'error':
        onError(data);
        eventSource.close();
        break;
    }
  };

  eventSource.onerror = (error) => {
    onError(error);
    eventSource.close();
  };

  // Return cleanup function
  return () => {
    eventSource.close();
  };
}

/**
 * Poll for completion with exponential backoff
 */
export async function pollUntilComplete(
  jobId: string,
  onProgress?: (status: JobStatus) => void,
  maxWaitTime: number = 120000 // 2 minutes max
): Promise<JobStatus> {
  const startTime = Date.now();
  let delay = 1000; // Start with 1 second
  
  while (Date.now() - startTime < maxWaitTime) {
    const status = await getJobStatus(jobId);
    
    if (onProgress) {
      onProgress(status);
    }
    
    if (status.status === 'completed' || status.status === 'failed') {
      return status;
    }
    
    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Exponential backoff with max 5 seconds
    delay = Math.min(delay * 1.5, 5000);
  }
  
  throw new Error('Research timeout - job took too long');
}

/**
 * High-level research function that handles the full flow
 */
interface ProgressUpdate {
  progress: number;
  stage: string;
  message: string;
}

export async function conductResearch(
  doctor: DoctorData,
  product: string,
  userId?: string,
  onProgress?: (update: ProgressUpdate) => void
): Promise<unknown> {
  // Start the job
  const job = await startResearchJob(doctor, product, userId);
  
  // If cached, return immediately
  if (job.fromCache && job.data) {
    console.log('🎯 Returning cached research data');
    return job.data;
  }
  
  // Otherwise poll for completion
  const result = await pollUntilComplete(
    job.jobId,
    (status) => {
      if (onProgress) {
        onProgress({
          progress: status.progress,
          stage: Object.entries(status.stages)
            .find(([_, stage]) => stage.status === 'active')?.[0] || 'processing',
          message: status.updates[status.updates.length - 1] || 'Processing...'
        });
      }
    }
  );
  
  if (result.status === 'failed') {
    throw new Error(result.error || 'Research failed');
  }
  
  return result.data;
}

/**
 * Batch research for multiple doctors
 */
export async function batchResearch(
  doctors: DoctorData[],
  product: string,
  userId?: string
): Promise<Map<string, unknown>> {
  const results = new Map();
  
  // Start all jobs in parallel
  const jobs = await Promise.all(
    doctors.map(doctor => 
      startResearchJob(doctor, product, userId)
        .then(job => ({ doctor, job }))
        .catch(error => ({ doctor, error }))
    )
  );
  
  // Poll for all completions
  const completions = await Promise.all(
    jobs.map(async (jobResult) => {
      if ('error' in jobResult) {
        return { doctor: jobResult.doctor, error: jobResult.error };
      }
      
      const { doctor, job } = jobResult;
      
      try {
        if (job.fromCache) {
          return { doctor, data: job.data };
        }
        
        const result = await pollUntilComplete(job.jobId);
        return { doctor, data: result.data };
      } catch (error) {
        return { doctor, error };
      }
    })
  );
  
  // Build results map
  completions.forEach(({ doctor, data, error }) => {
    const npi = doctor.npi || 'unknown';
    results.set(npi, { data, error });
  });
  
  return results;
}

/**
 * Health check for backend
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${RENDER_BACKEND_URL}/health`, {
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch {
    return false;
  }
}