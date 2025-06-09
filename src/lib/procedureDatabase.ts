/**
 * Procedure Database Integration
 * Connects to Supabase dental_procedures and aesthetic_procedures tables
 */

import { supabase } from '../auth/supabase';

export interface DentalProcedure {
  id: string;
  name: string;
  category: string;
  description?: string;
  keywords?: string[];
  specialty?: string;
  average_price?: number;
  related_products?: string[];
}

export interface AestheticProcedure {
  id: string;
  name: string;
  category: string;
  description?: string;
  keywords?: string[];
  specialty?: string;
  average_price?: number;
  related_products?: string[];
}

/**
 * Fetch dental procedures from Supabase
 */
export async function getDentalProcedures(): Promise<DentalProcedure[]> {
  try {
    const { data, error } = await supabase
      .from('dental_procedures')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching dental procedures:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch dental procedures:', error);
    return [];
  }
}

/**
 * Fetch aesthetic procedures from Supabase
 */
export async function getAestheticProcedures(): Promise<AestheticProcedure[]> {
  try {
    const { data, error } = await supabase
      .from('aesthetic_procedures')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching aesthetic procedures:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch aesthetic procedures:', error);
    return [];
  }
}

/**
 * Search for a specific procedure by name
 */
export async function findProcedureByName(
  procedureName: string
): Promise<(DentalProcedure | AestheticProcedure) | null> {
  const searchTerm = procedureName.toLowerCase().trim();
  
  // Search dental procedures
  const { data: dentalData } = await supabase
    .from('dental_procedures')
    .select('*')
    .ilike('name', `%${searchTerm}%`)
    .limit(1)
    .single();
  
  if (dentalData) {
    return dentalData;
  }
  
  // Search aesthetic procedures
  const { data: aestheticData } = await supabase
    .from('aesthetic_procedures')
    .select('*')
    .ilike('name', `%${searchTerm}%`)
    .limit(1)
    .single();
  
  return aestheticData || null;
}

/**
 * Get specialty-specific search terms based on procedure
 */
export function getSpecialtySearchTerms(procedure: DentalProcedure | AestheticProcedure): string[] {
  const terms: string[] = [];
  
  // Add specialty-specific terms
  if (procedure.specialty) {
    terms.push(procedure.specialty);
    
    // Add credential suffixes based on specialty
    if (procedure.specialty.toLowerCase().includes('oral surgeon')) {
      terms.push('DDS', 'DMD', 'oral surgery', 'maxillofacial');
    } else if (procedure.specialty.toLowerCase().includes('periodontist')) {
      terms.push('DDS', 'DMD', 'periodontics', 'gum specialist');
    } else if (procedure.specialty.toLowerCase().includes('prosthodontist')) {
      terms.push('DDS', 'DMD', 'prosthodontics', 'implant specialist');
    } else if (procedure.specialty.toLowerCase().includes('plastic')) {
      terms.push('MD', 'plastic surgery', 'cosmetic surgery');
    } else if (procedure.specialty.toLowerCase().includes('dermatolog')) {
      terms.push('MD', 'dermatology', 'skin specialist');
    }
  }
  
  // Add procedure keywords
  if (procedure.keywords) {
    terms.push(...procedure.keywords);
  }
  
  // Add category-based terms
  if (procedure.category) {
    if (procedure.category.toLowerCase().includes('implant')) {
      terms.push('dental implants', 'implant dentistry', 'tooth replacement');
    } else if (procedure.category.toLowerCase().includes('cosmetic')) {
      terms.push('cosmetic dentistry', 'smile makeover', 'aesthetic dentistry');
    } else if (procedure.category.toLowerCase().includes('injectable')) {
      terms.push('botox', 'filler', 'injectable treatments');
    }
  }
  
  return [...new Set(terms)]; // Remove duplicates
}

/**
 * Get related products for a procedure
 */
export async function getRelatedProducts(
  procedure: DentalProcedure | AestheticProcedure
): Promise<string[]> {
  if (procedure.related_products && procedure.related_products.length > 0) {
    return procedure.related_products;
  }
  
  // Fallback: suggest products based on category
  const categoryProducts: Record<string, string[]> = {
    'implants': ['Nobel Biocare', 'Straumann', 'Zimmer Biomet', 'BioHorizons'],
    'orthodontics': ['Invisalign', 'ClearCorrect', '3M Clarity'],
    'cosmetic': ['Lumineers', 'da Vinci Veneers', 'Zoom Whitening'],
    'injectables': ['Botox', 'Juvederm', 'Restylane', 'Sculptra'],
    'lasers': ['Candela', 'Cynosure', 'Lumenis', 'Cutera']
  };
  
  for (const [category, products] of Object.entries(categoryProducts)) {
    if (procedure.category?.toLowerCase().includes(category) ||
        procedure.name?.toLowerCase().includes(category)) {
      return products;
    }
  }
  
  return [];
}