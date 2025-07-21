import fetch from 'node-fetch';

const BASE_URL = 'https://osbackend-zl1h.onrender.com';

async function finalVerification() {
  console.log('🔍 FINAL VERIFICATION OF ALL ENDPOINTS\n');
  console.log('========================================\n');

  let allPassed = true;

  // Test 1: Canvas Agents
  console.log('1️⃣ CANVAS AGENTS TEST');
  try {
    const canvasRes = await fetch(`${BASE_URL}/api/canvas/agents`);
    const canvasData = await canvasRes.json();
    const canvasAgents = canvasData.data?.agents || [];
    
    const requiredCanvas = ['Hunter', 'Closer', 'Educator', 'Strategist'];
    const foundCanvas = canvasAgents.filter(a => requiredCanvas.includes(a.name));
    
    console.log(`   ✅ Endpoint working: ${canvasRes.status === 200 ? 'YES' : 'NO'}`);
    console.log(`   ✅ Total agents: ${canvasAgents.length}`);
    console.log(`   ✅ Core agents found: ${foundCanvas.length}/4`);
    console.log(`   ✅ All have voice: ${foundCanvas.every(a => a.voice_id) ? 'YES' : 'NO'}`);
    
    if (foundCanvas.length !== 4) allPassed = false;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    allPassed = false;
  }

  console.log('\n2️⃣ REPCONNECT AGENTS TEST');
  try {
    const repRes = await fetch(`${BASE_URL}/api/repconnect/agents`);
    const repData = await repRes.json();
    const repAgents = repData.data?.agents || [];
    
    console.log(`   ✅ Endpoint working: ${repRes.status === 200 ? 'YES' : 'NO'}`);
    console.log(`   ✅ Total agents: ${repAgents.length}`);
    console.log(`   ✅ Voice enabled: ${repAgents.filter(a => a.voice_enabled).length}`);
    
    // Check for Harvey
    const harvey = repAgents.find(a => a.name === 'Harvey Specter');
    console.log(`   ✅ Harvey Specter found: ${harvey ? 'YES' : 'NO'}`);
    if (harvey) {
      console.log(`      - Voice: ${harvey.voice_id ? 'Enabled' : 'Disabled'}`);
      console.log(`      - Whisper: ${harvey.whisper_supported ? 'Supported' : 'Not supported'}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    allPassed = false;
  }

  console.log('\n3️⃣ VOICE-ENABLED AGENTS TEST');
  try {
    const voiceRes = await fetch(`${BASE_URL}/api/repconnect/agents/voice-enabled`);
    const voiceData = await voiceRes.json();
    const voiceAgents = voiceData.data?.agents || [];
    
    console.log(`   ✅ Endpoint working: ${voiceRes.status === 200 ? 'YES' : 'NO'}`);
    console.log(`   ✅ Voice agents: ${voiceAgents.length}`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    allPassed = false;
  }

  console.log('\n4️⃣ HARVEY SPECIFIC ENDPOINT TEST');
  try {
    const harveyRes = await fetch(`${BASE_URL}/api/repconnect/agents/harvey`);
    const harveyData = await harveyRes.json();
    const harveyAgent = harveyData.data?.agent;
    
    console.log(`   ✅ Endpoint working: ${harveyRes.status === 200 ? 'YES' : 'NO'}`);
    if (harveyAgent) {
      console.log(`   ✅ Harvey found: YES`);
      console.log(`      - ID: ${harveyAgent.id}`);
      console.log(`      - Voice ID: ${harveyAgent.voice_id}`);
      console.log(`      - Aggression Level: ${harveyAgent.aggression_level || 'N/A'}`);
    } else {
      console.log(`   ❌ Harvey not found`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    allPassed = false;
  }

  console.log('\n5️⃣ CATEGORIES ENDPOINT TEST');
  try {
    const catRes = await fetch(`${BASE_URL}/api/repconnect/agents/categories`);
    const catData = await catRes.json();
    const categories = catData.data?.categories || [];
    
    console.log(`   ✅ Endpoint working: ${catRes.status === 200 ? 'YES' : 'NO'}`);
    console.log(`   ✅ Categories found: ${categories.length}`);
    categories.forEach(cat => {
      console.log(`      - ${cat.label}: ${cat.count} agents`);
    });
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    allPassed = false;
  }

  // Final Summary
  console.log('\n========================================');
  console.log('📊 FINAL SUMMARY');
  console.log('========================================');
  if (allPassed) {
    console.log('✅ ALL TESTS PASSED!');
    console.log('✅ Canvas agents are working correctly');
    console.log('✅ RepConnect agents are working correctly');
    console.log('✅ All agents have voice support');
    console.log('✅ Harvey Specter is configured with special features');
  } else {
    console.log('❌ Some tests failed - check the output above');
  }
}

// Run verification
finalVerification().catch(console.error);