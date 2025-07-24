import { supabase } from '../auth/supabase';

// Type definitions for Supabase operations
interface ScanResult {
  doctor: string;
  product: string;
  score: number;
  doctorProfile: Record<string, unknown>;
  productIntel: Record<string, unknown>;
  salesBrief: string;
  insights: Record<string, unknown>;
  scanDuration?: number;
}

interface ScanRecord {
  id: string;
  user_id: string | null;
  doctor_name: string;
  product_name: string;
  score: number;
  doctor_profile: Record<string, unknown>;
  product_intel: Record<string, unknown>;
  sales_brief: string;
  insights: Record<string, unknown>;
  scan_duration: number;
  created_at: string;
}

interface DeepResearchData {
  [key: string]: unknown;
}

interface ActionBreakdown {
  [actionType: string]: number;
}

interface ScanAnalyticsData {
  totalScans: number;
  averageScore: number;
  highValueTargets: number;
  actionBreakdown: ActionBreakdown;
  recentActivity: ScanRecord[];
}

interface OperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Scan operations
export async function saveScan(scanResult: ScanResult, userId: string | null = null): Promise<OperationResult<ScanRecord>> {
  try {
    const { data, error } = await supabase
      .from('canvas_scans')
      .insert([
        {
          user_id: userId,
          doctor_name: scanResult.doctor,
          product_name: scanResult.product,
          score: scanResult.score,
          doctor_profile: scanResult.doctorProfile,
          product_intel: scanResult.productIntel,
          sales_brief: scanResult.salesBrief,
          insights: scanResult.insights,
          scan_duration: scanResult.scanDuration || 3
        }
      ])
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: unknown) {
    console.error('Error saving scan:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function getScanHistory(userId: string | null, limit = 50): Promise<OperationResult<ScanRecord[]>> {
  try {
    let query = supabase
      .from('canvas_scans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (userId === null) {
      query = query.is('user_id', null)
    } else {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw error
    return { success: true, data }
  } catch (error: unknown) {
    console.error('Error getting scan history:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function saveDeepResearch(scanId: string, deepResearchData: DeepResearchData): Promise<OperationResult> {
  try {
    const { data, error } = await supabase
      .from('canvas_deep_research')
      .insert([
        {
          scan_id: scanId,
          ...deepResearchData
        }
      ])
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error: unknown) {
    console.error('Error saving deep research:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function logScanAction(scanId: string, actionType: string, actionData: Record<string, unknown> = {}): Promise<OperationResult> {
  try {
    const { data, error } = await supabase
      .from('canvas_scan_actions')
      .insert([
        {
          scan_id: scanId,
          action_type: actionType,
          action_data: actionData
        }
      ])

    if (error) throw error
    return { success: true, data }
  } catch (error: unknown) {
    console.error('Error logging scan action:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Analytics functions
export async function getScanAnalytics(userId: string): Promise<OperationResult<ScanAnalyticsData>> {
  try {
    const { data: scans, error: scansError } = await supabase
      .from('canvas_scans')
      .select('score, created_at, doctor_name, product_name')
      .eq('user_id', userId)

    if (scansError) throw scansError

    const { data: actions, error: actionsError } = await supabase
      .from('canvas_scan_actions')
      .select(`
        action_type,
        created_at,
        canvas_scans!inner(user_id)
      `)
      .eq('canvas_scans.user_id', userId)

    if (actionsError) throw actionsError

    return {
      success: true,
      data: {
        totalScans: scans.length,
        averageScore: scans.reduce((acc, scan) => acc + scan.score, 0) / scans.length || 0,
        highValueTargets: scans.filter(scan => scan.score >= 80).length,
        actionBreakdown: actions.reduce((acc: ActionBreakdown, action) => {
          acc[action.action_type] = (acc[action.action_type] || 0) + 1
          return acc
        }, {}),
        recentActivity: scans.slice(0, 10)
      }
    }
  } catch (error: unknown) {
    console.error('Error getting analytics:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}