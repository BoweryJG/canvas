import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
);

const CANVAS_AGENTS = [
  {
    id: '46af0d5f-0a15-485a-9996-ad53d2988cb6',
    name: 'Hunter',
    avatar_url: '/avatars/hunter-agent.png',
    specialty: ['dental_implants', 'orthodontics', 'cosmetic_dentistry'],
    personality: {
      tone: 'energetic',
      approach: 'direct',
      verbosity: 'concise',
      temperature: 0.8
    },
    system_prompt: 'You are Hunter, a high-energy sales agent focused on finding new opportunities and prospects. You excel at identifying untapped markets and qualifying leads quickly.',
    is_active: true
  },
  {
    id: 'aed5ad09-494b-4a14-b83f-c2ea1df98230',
    name: 'Closer',
    avatar_url: '/avatars/closer-agent.png',
    specialty: ['aesthetic_procedures', 'lasers', 'injectables'],
    personality: {
      tone: 'confident',
      approach: 'consultative',
      verbosity: 'detailed',
      temperature: 0.7
    },
    system_prompt: 'You are Closer, a deal-making specialist who excels at negotiations and overcoming objections. You provide strategic guidance for closing complex medical device sales.',
    is_active: true
  },
  {
    id: '3a11f651-308c-4af2-bbb2-06ffd777ac5c',
    name: 'Educator',
    avatar_url: '/avatars/educator-agent.png',
    specialty: ['all_procedures'],
    personality: {
      tone: 'patient',
      approach: 'educational',
      verbosity: 'detailed',
      temperature: 0.6
    },
    system_prompt: 'You are Educator, a teaching-focused agent who helps sales reps understand complex medical procedures and technologies. You break down technical concepts into clear, actionable insights.',
    is_active: true
  },
  {
    id: 'b8feb760-c5be-49b2-a903-fb2471420a21',
    name: 'Strategist',
    avatar_url: '/avatars/strategist-agent.png',
    specialty: ['practice_management', 'market_analysis'],
    personality: {
      tone: 'analytical',
      approach: 'data-driven',
      verbosity: 'comprehensive',
      temperature: 0.5
    },
    system_prompt: 'You are Strategist, a market intelligence expert who analyzes competitive landscapes and develops territory strategies. You provide data-driven recommendations for market penetration.',
    is_active: true
  }
];

async function checkAndFixCanvasAgents() {
  console.log('🔍 Checking Canvas agents in database...\n');

  try {
    // Check if canvas_ai_agents table exists and has data
    const { data: existingAgents, error: fetchError } = await supabase
      .from('canvas_ai_agents')
      .select('*');

    if (fetchError) {
      console.error('❌ Error fetching agents:', fetchError);
      console.log('\n🔄 Attempting to check unified_agents table instead...');
      
      // Check unified_agents table for Canvas agents
      const { data: unifiedAgents, error: unifiedError } = await supabase
        .from('unified_agents')
        .select('*')
        .contains('available_in_apps', ['canvas']);
        
      if (unifiedError) {
        console.error('❌ Error fetching from unified_agents:', unifiedError);
        return;
      }
      
      console.log(`\n📊 Found ${unifiedAgents?.length || 0} Canvas agents in unified_agents table`);
      
      // Check if the 4 core Canvas agents exist
      const coreAgentNames = ['Hunter', 'Closer', 'Educator', 'Strategist'];
      for (const agentName of coreAgentNames) {
        const exists = unifiedAgents?.find(a => a.name === agentName);
        if (exists) {
          console.log(`✅ ${agentName} found in unified_agents`);
        } else {
          console.log(`❌ ${agentName} NOT FOUND in unified_agents`);
          
          // Add to unified_agents table
          const canvasAgent = CANVAS_AGENTS.find(a => a.name === agentName);
          if (canvasAgent) {
            console.log(`\n➕ Adding ${agentName} to unified_agents table...`);
            
            const { error: insertError } = await supabase
              .from('unified_agents')
              .insert({
                id: canvasAgent.id,
                name: canvasAgent.name,
                available_in_apps: ['canvas'],
                agent_category: 'sales_strategy',
                personality_profile: canvasAgent.personality,
                system_prompt: canvasAgent.system_prompt,
                is_active: true,
                specialties: canvasAgent.specialty,
                avatar_url: canvasAgent.avatar_url,
                // Add voice configuration
                voice_id: `elevenlabs_${canvasAgent.name.toLowerCase()}_voice`,
                voice_name: `${canvasAgent.name} Voice`,
                voice_enabled: true,
                voice_settings: {
                  stability: 0.7,
                  similarity_boost: 0.8,
                  style: 0.5,
                  use_speaker_boost: true
                }
              });
              
            if (insertError) {
              console.error(`❌ Error inserting ${agentName}:`, insertError);
            } else {
              console.log(`✅ Successfully added ${agentName} to unified_agents`);
            }
          }
        }
      }
      
      return;
    }

    console.log(`📊 Found ${existingAgents?.length || 0} agents in canvas_ai_agents table`);

    // Check each Canvas agent
    for (const agent of CANVAS_AGENTS) {
      const exists = existingAgents?.find(a => a.id === agent.id || a.name === agent.name);
      
      if (exists) {
        console.log(`✅ ${agent.name} already exists`);
      } else {
        console.log(`❌ ${agent.name} is missing - inserting...`);
        
        const { error: insertError } = await supabase
          .from('canvas_ai_agents')
          .insert(agent);
          
        if (insertError) {
          console.error(`   Failed to insert ${agent.name}:`, insertError);
        } else {
          console.log(`   ✅ Successfully added ${agent.name}`);
        }
      }
    }

    // Verify final state
    console.log('\n📊 Verifying final state...');
    const { data: finalAgents, error: finalError } = await supabase
      .from('canvas_ai_agents')
      .select('id, name, is_active');
      
    if (finalError) {
      console.error('Error verifying:', finalError);
    } else {
      console.log('\nCanvas agents in database:');
      finalAgents?.forEach(agent => {
        console.log(`- ${agent.name} (${agent.id}) - Active: ${agent.is_active}`);
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkAndFixCanvasAgents();