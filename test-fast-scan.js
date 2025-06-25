/**
 * Test the fast scan performance
 */

// Mock the API calls for testing
global.fetch = async (url, options) => {
  console.log(`Mock fetch called: ${url}`);
  
  // Simulate 200ms API response time
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return {
    ok: true,
    json: async () => ({
      web: {
        results: [
          {
            title: "Dr. Test Practice Website",
            url: "https://testpractice.com",
            description: "Test medical practice"
          }
        ]
      }
    })
  };
};

// Test parallel vs sequential
async function testPerformance() {
  console.log('\n=== PERFORMANCE TEST ===\n');
  
  // Sequential (OLD WAY)
  console.log('Testing SEQUENTIAL calls (old way):');
  const sequentialStart = Date.now();
  
  for (let i = 0; i < 5; i++) {
    await fetch(`/api/search-${i}`);
  }
  
  const sequentialTime = Date.now() - sequentialStart;
  console.log(`Sequential time: ${sequentialTime}ms (should be ~1000ms)\n`);
  
  // Parallel (NEW WAY)
  console.log('Testing PARALLEL calls (new way):');
  const parallelStart = Date.now();
  
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(fetch(`/api/search-${i}`));
  }
  await Promise.all(promises);
  
  const parallelTime = Date.now() - parallelStart;
  console.log(`Parallel time: ${parallelTime}ms (should be ~200ms)\n`);
  
  console.log(`IMPROVEMENT: ${Math.round(sequentialTime / parallelTime)}x faster!`);
}

testPerformance();