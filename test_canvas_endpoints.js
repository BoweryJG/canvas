import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'https://osbackend-zl1h.onrender.com';
const TEST_TOKEN = process.env.TEST_AUTH_TOKEN || ''; // You'll need to set this

// Color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

// Test function with better error handling
async function testEndpoint(name, method, url, options = {}) {
  console.log(`\n${colors.blue}🧪 Testing ${name}...${colors.reset}`);
  console.log(`${method} ${url}`);
  
  try {
    const response = await fetch(url, {
      method,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`${colors.green}✅ Success${colors.reset}`);
      console.log('Response:', JSON.stringify(data, null, 2));
      return { success: true, data, status: response.status };
    } else {
      console.log(`${colors.red}❌ Failed${colors.reset}`);
      console.log('Error:', JSON.stringify(data, null, 2));
      return { success: false, error: data, status: response.status };
    }
  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    return { success: false, error: error.message };
  }
}

async function runCanvasEndpointTests() {
  console.log('🚀 Starting Canvas endpoint tests...');
  console.log(`Backend URL: ${BASE_URL}`);
  console.log('Note: Some endpoints require authentication. Set TEST_AUTH_TOKEN in .env file.');
  
  const testResults = {
    passed: 0,
    failed: 0,
    endpoints: []
  };

  // Test 1: List agents (public endpoint temporarily)
  const listAgentsResult = await testEndpoint(
    'Canvas GET /api/canvas/agents',
    'GET',
    `${BASE_URL}/api/canvas/agents`
  );
  
  testResults.endpoints.push({ 
    name: 'List agents', 
    success: listAgentsResult.success,
    status: listAgentsResult.status 
  });

  if (listAgentsResult.success) {
    testResults.passed++;
    const agents = listAgentsResult.data.data?.agents || [];
    console.log(`\n📊 Canvas Agent Summary:`);
    console.log(`Total agents: ${agents.length}`);
    
    // Check Canvas-specific agents
    const canvasAgents = ['Hunter', 'Closer', 'Educator', 'Strategist'];
    canvasAgents.forEach(agentName => {
      const agent = agents.find(a => a.name === agentName);
      if (agent) {
        console.log(`✅ ${agentName} found - ID: ${agent.id}`);
      } else {
        console.log(`❌ ${agentName} NOT FOUND`);
      }
    });
  } else {
    testResults.failed++;
  }

  // Test with authentication if token is available
  if (TEST_TOKEN) {
    console.log(`\n${colors.yellow}Running authenticated tests...${colors.reset}`);
    
    // Test 2: Get specific agent details
    if (listAgentsResult.success && listAgentsResult.data.agents?.length > 0) {
      const firstAgent = listAgentsResult.data.agents[0];
      const agentDetailsResult = await testEndpoint(
        'Canvas GET /api/canvas/agents/:id',
        'GET',
        `${BASE_URL}/api/canvas/agents/${firstAgent.id}`,
        {
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`
          }
        }
      );
      
      testResults.endpoints.push({ 
        name: 'Get agent details', 
        success: agentDetailsResult.success,
        status: agentDetailsResult.status 
      });
      
      if (agentDetailsResult.success) {
        testResults.passed++;
      } else {
        testResults.failed++;
      }
    }

    // Test 3: Create conversation
    const createConversationResult = await testEndpoint(
      'Canvas POST /api/canvas/conversations',
      'POST',
      `${BASE_URL}/api/canvas/conversations`,
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        },
        body: JSON.stringify({
          agentId: 'hunter',
          title: 'Test Canvas Conversation'
        })
      }
    );
    
    testResults.endpoints.push({ 
      name: 'Create conversation', 
      success: createConversationResult.success,
      status: createConversationResult.status 
    });
    
    if (createConversationResult.success) {
      testResults.passed++;
      
      // Test 4: List conversations
      const listConversationsResult = await testEndpoint(
        'Canvas GET /api/canvas/conversations',
        'GET',
        `${BASE_URL}/api/canvas/conversations`,
        {
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`
          }
        }
      );
      
      testResults.endpoints.push({ 
        name: 'List conversations', 
        success: listConversationsResult.success,
        status: listConversationsResult.status 
      });
      
      if (listConversationsResult.success) {
        testResults.passed++;
      } else {
        testResults.failed++;
      }
    } else {
      testResults.failed++;
    }

    // Test 5: Agent suggestions
    const suggestAgentsResult = await testEndpoint(
      'Canvas POST /api/canvas/agents/suggest',
      'POST',
      `${BASE_URL}/api/canvas/agents/suggest`,
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        },
        body: JSON.stringify({
          need: 'detailed_analysis',
          specialty: 'dental'
        })
      }
    );
    
    testResults.endpoints.push({ 
      name: 'Suggest agents', 
      success: suggestAgentsResult.success,
      status: suggestAgentsResult.status 
    });
    
    if (suggestAgentsResult.success) {
      testResults.passed++;
    } else {
      testResults.failed++;
    }

    // Test 6: Featured procedures
    const featuredProceduresResult = await testEndpoint(
      'Canvas GET /api/canvas/procedures/featured',
      'GET',
      `${BASE_URL}/api/canvas/procedures/featured`,
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      }
    );
    
    testResults.endpoints.push({ 
      name: 'Get featured procedures', 
      success: featuredProceduresResult.success,
      status: featuredProceduresResult.status 
    });
    
    if (featuredProceduresResult.success) {
      testResults.passed++;
    } else {
      testResults.failed++;
    }

    // Test 7: Search procedures
    const searchProceduresResult = await testEndpoint(
      'Canvas GET /api/canvas/procedures/search',
      'GET',
      `${BASE_URL}/api/canvas/procedures/search?q=implant&type=dental`,
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      }
    );
    
    testResults.endpoints.push({ 
      name: 'Search procedures', 
      success: searchProceduresResult.success,
      status: searchProceduresResult.status 
    });
    
    if (searchProceduresResult.success) {
      testResults.passed++;
    } else {
      testResults.failed++;
    }

    // Test 8: External agents (if configured)
    const externalAgentsResult = await testEndpoint(
      'Canvas GET /api/canvas/agents/external',
      'GET',
      `${BASE_URL}/api/canvas/agents/external?category=sales`,
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      }
    );
    
    testResults.endpoints.push({ 
      name: 'Get external agents', 
      success: externalAgentsResult.success,
      status: externalAgentsResult.status 
    });
    
    if (externalAgentsResult.success || externalAgentsResult.status === 503) {
      testResults.passed++; // 503 is acceptable if external service not configured
    } else {
      testResults.failed++;
    }

    // Test 9: Combined agents
    const combinedAgentsResult = await testEndpoint(
      'Canvas GET /api/canvas/agents/combined',
      'GET',
      `${BASE_URL}/api/canvas/agents/combined`,
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      }
    );
    
    testResults.endpoints.push({ 
      name: 'Get combined agents', 
      success: combinedAgentsResult.success,
      status: combinedAgentsResult.status 
    });
    
    if (combinedAgentsResult.success) {
      testResults.passed++;
      console.log(`\n📊 Combined Agents Summary:`);
      const sources = combinedAgentsResult.data.sources;
      if (sources) {
        console.log(`Canvas agents: ${sources.canvas || 0}`);
        console.log(`External agents: ${sources.agentbackend || 0}`);
      }
    } else {
      testResults.failed++;
    }

    // Test 10: Sales recommendations
    const salesRecommendResult = await testEndpoint(
      'Canvas POST /api/canvas/agents/sales/recommend',
      'POST',
      `${BASE_URL}/api/canvas/agents/sales/recommend`,
      {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        },
        body: JSON.stringify({
          customer_type: 'dental_practice',
          sales_stage: 'closing',
          product_category: 'dental_implants',
          urgency: 'high'
        })
      }
    );
    
    testResults.endpoints.push({ 
      name: 'Get sales recommendations', 
      success: salesRecommendResult.success,
      status: salesRecommendResult.status 
    });
    
    if (salesRecommendResult.success) {
      testResults.passed++;
    } else {
      testResults.failed++;
    }
    
  } else {
    console.log(`\n${colors.yellow}⚠️  Skipping authenticated tests - no TEST_AUTH_TOKEN provided${colors.reset}`);
  }

  // Summary
  console.log(`\n${colors.blue}========================================${colors.reset}`);
  console.log(`${colors.blue}📊 Canvas Endpoint Test Summary${colors.reset}`);
  console.log(`${colors.blue}========================================${colors.reset}`);
  console.log(`Total tests run: ${testResults.endpoints.length}`);
  console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);
  
  console.log(`\n${colors.blue}Endpoint Results:${colors.reset}`);
  testResults.endpoints.forEach(endpoint => {
    const icon = endpoint.success ? '✅' : '❌';
    const color = endpoint.success ? colors.green : colors.red;
    console.log(`${icon} ${color}${endpoint.name}${colors.reset} (${endpoint.status || 'N/A'})`);
  });

  // Recommendations
  console.log(`\n${colors.yellow}💡 Recommendations:${colors.reset}`);
  if (!TEST_TOKEN) {
    console.log('1. Set TEST_AUTH_TOKEN in .env to test authenticated endpoints');
  }
  if (testResults.failed > 0) {
    console.log('2. Check backend logs for detailed error information');
    console.log('3. Ensure all required services (Supabase) are properly configured');
  }
  console.log('4. Verify that the Canvas agents are properly set up in the unified_agents table');

  console.log(`\n✅ Canvas endpoint test suite completed!`);
}

// Run the tests
runCanvasEndpointTests().catch(console.error);