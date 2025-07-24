// Shared types for agent components
import React from 'react';

export interface SystemAgent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  specialty: string[];
  icon: React.ElementType;
  color: string;
}

export interface AgentContext {
  tab?: string;
  doctorId?: string;
  searchQuery?: string;
  researchData?: Record<string, unknown>;
  npiDoctor?: any; // Using any to avoid circular dependency with NPIDoctor
}

export interface Insight {
  id: string;
  type: string;
  icon: React.ElementType;
  priority: string;
  title: string;
  description: string;
  actions: string[];
  [key: string]: unknown;
}