import { supabase } from '../auth/supabase';

export interface CreditCheckResult {
  hasCredits: boolean;
  creditsRemaining: number;
  error?: string;
}

export async function checkUserCredits(userId: string): Promise<CreditCheckResult> {
  console.log('Skipping credit database checks - using default credits');
  return { hasCredits: true, creditsRemaining: 100 };
}

export async function deductCredit(userId: string): Promise<boolean> {
  console.log('Skipping credit deduction - using default credits');
  return true;
}

export async function getUserCredits(userId: string): Promise<number> {
  console.log('Skipping credit query - returning default credits');
  return 100;
}

export async function addCredits(userId: string, credits: number): Promise<boolean> {
  console.log('Skipping credit addition - using default credits');
  return true;
}