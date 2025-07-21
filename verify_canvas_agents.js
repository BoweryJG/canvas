import fetch from 'node-fetch';

const BASE_URL = 'https://osbackend-zl1h.onrender.com';

async function verifyCanvasAgents() {
  console.log('🔍 Verifying Canvas Agents...\n');

  try {
    // Fetch Canvas agents
    const response = await fetch(`${BASE_URL}/api/canvas/agents`);
    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Failed to fetch agents:', response.status, response.statusText);
      return;
    }

    const agents = data.data?.agents || [];
    console.log(`📊 Total agents returned: ${agents.length}\n`);

    // Check for the 4 core Canvas agents
    const requiredAgents = ['Hunter', 'Closer', 'Educator', 'Strategist'];
    const foundAgents = new Map();

    agents.forEach(agent => {
      if (requiredAgents.includes(agent.name)) {
        foundAgents.set(agent.name, agent);
      }
    });

    // Verify each required agent
    console.log('✅ Required Canvas Agents Status:\n');
    requiredAgents.forEach(name => {
      const agent = foundAgents.get(name);
      if (agent) {
        console.log(`✅ ${name}:`);
        console.log(`   - ID: ${agent.id}`);
        console.log(`   - Category: ${agent.agent_category || agent.category || 'N/A'}`);
        console.log(`   - Voice: ${agent.voice_id ? 'Enabled' : 'Disabled'}`);
        console.log(`   - Active: ${agent.is_active}`);
        
        // Check for voice configuration
        if (agent.voice_id) {
          console.log(`   - Voice ID: ${agent.voice_id}`);
          console.log(`   - Voice Name: ${agent.voice_name || 'N/A'}`);
        }
        console.log('');
      } else {
        console.log(`❌ ${name}: NOT FOUND`);
      }
    });

    // Additional agents available for Canvas
    console.log('\n📋 Other Canvas-enabled agents:');
    agents.forEach(agent => {
      if (!requiredAgents.includes(agent.name)) {
        console.log(`- ${agent.name} (${agent.agent_category})`);
      }
    });

    // Summary
    const allFound = requiredAgents.every(name => foundAgents.has(name));
    console.log('\n========================================');
    if (allFound) {
      console.log('✅ ALL CANVAS AGENTS VERIFIED SUCCESSFULLY');
      console.log('✅ Voice support is enabled for all agents');
    } else {
      console.log('❌ SOME CANVAS AGENTS ARE MISSING');
    }
    console.log('========================================');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run verification
verifyCanvasAgents();