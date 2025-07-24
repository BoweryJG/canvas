// Unified Agent types for consistency across components

// Import types from doctorDetection
import type { NPIDoctorInfo, DoctorMention } from '../lib/doctorDetection';

// Re-export the imported types
export type { NPIDoctorInfo, DoctorMention };

export interface AgentPersonality {
  approach?: string;
  tone?: string;
  expertise?: string[];
  traits?: string[];
  communicationStyle?: string;
  communication_style?: string; // Support both camelCase and snake_case
  specializations?: string[];
  // Allow for additional properties
  [key: string]: unknown;
}

export interface Agent {
  id: string;
  name: string;
  avatar_url?: string;
  specialty: string[];
  personality: AgentPersonality;
}

export interface MessageMetadata {
  doctors?: NPIDoctorInfo[];
  doctorMentions?: DoctorMention[];
  sources?: string[];
  confidence?: number;
  reasoning?: string;
  suggestions?: string[];
  [key: string]: unknown;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  metadata?: MessageMetadata;
}

export interface Conversation {
  id: string;
  title: string;
  agent_id: string;
  messages: Message[];
  created_at: string;
  canvas_ai_agents?: Agent;
  context?: {
    doctors?: NPIDoctorInfo[];
  };
}

export interface Procedure {
  id: string;
  name: string;
  category: string;
  type: 'dental' | 'aesthetic';
}

export interface Insight {
  title: string;
  message: string;
  action: 'research_doctor' | 'lookup_doctor' | 'show_procedure_data' | 'competitive_analysis';
  data?: {
    doctorName?: string;
    procedure?: string;
    link?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}