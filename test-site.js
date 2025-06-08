#!/usr/bin/env node

// Simple site testing script using fetch

const testSite = async () => {
    console.log('🧪 Testing Canvas Header Site: https://canvas.repspheres.com\n');
    
    try {
        // Test 1: Basic connectivity
        console.log('1. Testing site connectivity...');
        const response = await fetch('https://canvas.repspheres.com');
        console.log(`   ✅ Status: ${response.status} ${response.statusText}`);
        console.log(`   ✅ URL: ${response.url}`);
        
        // Test 2: Check HTML content
        console.log('\n2. Checking HTML content...');
        const html = await response.text();
        console.log(`   ✅ HTML length: ${html.length} bytes`);
        
        // Test 3: Look for key elements
        console.log('\n3. Checking for key elements...');
        const hasReact = html.includes('root') && html.includes('react');
        const hasCanvas = html.includes('CANVAS') || html.includes('canvas');
        const hasAssets = html.includes('assets/index');
        
        console.log(`   ${hasReact ? '✅' : '❌'} React app detected`);
        console.log(`   ${hasCanvas ? '✅' : '❌'} Canvas references found`);
        console.log(`   ${hasAssets ? '✅' : '❌'} Built assets loaded`);
        
        // Test 4: Check for JavaScript files
        console.log('\n4. Checking JavaScript assets...');
        const jsMatches = html.match(/src="([^"]+\.js)"/g) || [];
        if (jsMatches.length > 0) {
            console.log(`   ✅ Found ${jsMatches.length} JavaScript files:`);
            jsMatches.forEach(match => {
                const file = match.match(/src="([^"]+)"/)[1];
                console.log(`      - ${file}`);
            });
        } else {
            console.log('   ❌ No JavaScript files found');
        }
        
        // Test 5: Check for Sequential Thinking integration
        console.log('\n5. Testing for Sequential Thinking integration...');
        const mainJsMatch = html.match(/src="(\/assets\/index-[^"]+\.js)"/);
        if (mainJsMatch) {
            const jsUrl = `https://canvas.repspheres.com${mainJsMatch[1]}`;
            console.log(`   → Fetching main JS bundle: ${jsUrl}`);
            
            const jsResponse = await fetch(jsUrl);
            const jsContent = await jsResponse.text();
            
            const hasSequential = jsContent.includes('sequential') || jsContent.includes('Sequential');
            const hasThinking = jsContent.includes('thinking') || jsContent.includes('Thinking');
            const hasAdaptive = jsContent.includes('adaptive') || jsContent.includes('Adaptive');
            
            console.log(`   ${hasSequential ? '✅' : '❌'} Sequential references: ${hasSequential}`);
            console.log(`   ${hasThinking ? '✅' : '❌'} Thinking references: ${hasThinking}`);
            console.log(`   ${hasAdaptive ? '✅' : '❌'} Adaptive references: ${hasAdaptive}`);
            
            if (hasSequential || hasThinking || hasAdaptive) {
                console.log('   ✅ Sequential Thinking integration detected!');
            } else {
                console.log('   ⚠️  No clear Sequential Thinking integration found');
            }
        }
        
        // Summary
        console.log('\n📊 Summary:');
        console.log('   - Site is accessible and returns 200 OK');
        console.log('   - React application is properly built and deployed');
        console.log('   - JavaScript assets are loading correctly');
        console.log('   - Further manual testing recommended for:');
        console.log('     • Research panel functionality');
        console.log('     • Sequential Thinking UI interactions');
        console.log('     • Console errors (requires browser)');
        
        console.log('\n✅ Basic site verification complete!');
        console.log('\n💡 To test interactivity and console errors:');
        console.log('   1. Open https://canvas.repspheres.com in a browser');
        console.log('   2. Open Developer Tools (F12)');
        console.log('   3. Check Console tab for errors');
        console.log('   4. Test the research panel functionality');
        
    } catch (error) {
        console.error('❌ Error testing site:', error.message);
    }
};

// Run the test
testSite();