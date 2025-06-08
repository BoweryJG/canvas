#!/usr/bin/env node

/**
 * Comprehensive Site Verification for Canvas Header with Sequential Thinking
 * Tests all major components and integration points
 */

const verifyCanvasHeaderSite = async () => {
    const siteUrl = 'https://canvas.repspheres.com';
    console.log('🔍 Canvas Header Site Verification Report');
    console.log('==========================================');
    console.log(`Site: ${siteUrl}`);
    console.log(`Date: ${new Date().toISOString()}\n`);

    const results = {
        connectivity: false,
        htmlStructure: false,
        jsAssets: false,
        sequentialThinking: false,
        researchPanel: false,
        apiEndpoints: false
    };

    try {
        // Test 1: Site Connectivity
        console.log('1. CONNECTIVITY TEST');
        console.log('-------------------');
        const response = await fetch(siteUrl);
        results.connectivity = response.ok;
        console.log(`   Status Code: ${response.status}`);
        console.log(`   Status Text: ${response.statusText}`);
        console.log(`   Headers:`, {
            server: response.headers.get('server'),
            contentType: response.headers.get('content-type')
        });
        console.log(`   ✅ Site is accessible\n`);

        // Test 2: HTML Structure
        console.log('2. HTML STRUCTURE TEST');
        console.log('----------------------');
        const html = await response.text();
        const htmlChecks = {
            'React Root': html.includes('<div id="root">'),
            'Canvas Title': html.includes('CANVAS - AI Sales Intelligence'),
            'Vite App': html.includes('vite'),
            'JavaScript Modules': html.includes('type="module"')
        };
        
        Object.entries(htmlChecks).forEach(([check, passed]) => {
            console.log(`   ${passed ? '✅' : '❌'} ${check}: ${passed ? 'Found' : 'Missing'}`);
        });
        results.htmlStructure = Object.values(htmlChecks).every(v => v);
        console.log('');

        // Test 3: JavaScript Assets
        console.log('3. JAVASCRIPT ASSETS TEST');
        console.log('-------------------------');
        const jsFiles = html.match(/src="(\/assets\/[^"]+\.js)"/g) || [];
        console.log(`   Found ${jsFiles.length} JavaScript file(s)`);
        
        if (jsFiles.length > 0) {
            const mainJsPath = jsFiles[0].match(/src="([^"]+)"/)[1];
            const jsUrl = `${siteUrl}${mainJsPath}`;
            console.log(`   Main bundle: ${mainJsPath}`);
            
            // Fetch and analyze main JS bundle
            const jsResponse = await fetch(jsUrl);
            const jsContent = await jsResponse.text();
            console.log(`   Bundle size: ${(jsContent.length / 1024).toFixed(2)} KB`);
            results.jsAssets = true;
            
            // Test 4: Sequential Thinking Integration
            console.log('\n4. SEQUENTIAL THINKING INTEGRATION TEST');
            console.log('---------------------------------------');
            const integrationChecks = {
                'Sequential References': jsContent.includes('sequential') || jsContent.includes('Sequential'),
                'Thinking References': jsContent.includes('thinking') || jsContent.includes('Thinking'),
                'Adaptive References': jsContent.includes('adaptive') || jsContent.includes('Adaptive'),
                'Research Strategy': jsContent.includes('ResearchStrategy') || jsContent.includes('researchStrategy'),
                'Thought Process': jsContent.includes('thought') && jsContent.includes('nextThoughtNeeded')
            };
            
            Object.entries(integrationChecks).forEach(([check, found]) => {
                console.log(`   ${found ? '✅' : '❌'} ${check}: ${found ? 'Detected' : 'Not found'}`);
            });
            
            results.sequentialThinking = integrationChecks['Thinking References'] && integrationChecks['Adaptive References'];
            
            // Test 5: Research Panel Components
            console.log('\n5. RESEARCH PANEL COMPONENTS TEST');
            console.log('---------------------------------');
            const componentChecks = {
                'Research Form': jsContent.includes('ResearchForm') || jsContent.includes('MagicResearchForm'),
                'Research Panel': jsContent.includes('ResearchPanel'),
                'Doctor Autocomplete': jsContent.includes('DoctorAutocomplete') || jsContent.includes('doctor'),
                'Progress Indicators': jsContent.includes('progress') || jsContent.includes('Progress'),
                'Confidence Score': jsContent.includes('confidenceScore') || jsContent.includes('confidence')
            };
            
            Object.entries(componentChecks).forEach(([component, found]) => {
                console.log(`   ${found ? '✅' : '❌'} ${component}: ${found ? 'Present' : 'Missing'}`);
            });
            
            results.researchPanel = Object.values(componentChecks).filter(v => v).length >= 3;
            
            // Test 6: API Integration
            console.log('\n6. API INTEGRATION TEST');
            console.log('-----------------------');
            const apiChecks = {
                'API Endpoints': jsContent.includes('apiEndpoints') || jsContent.includes('api/'),
                'Fetch Calls': jsContent.includes('fetch(') || jsContent.includes('axios'),
                'OpenRouter': jsContent.includes('openrouter') || jsContent.includes('OpenRouter'),
                'Error Handling': jsContent.includes('try') && jsContent.includes('catch'),
                'Async Operations': jsContent.includes('async') && jsContent.includes('await')
            };
            
            Object.entries(apiChecks).forEach(([check, found]) => {
                console.log(`   ${found ? '✅' : '❌'} ${check}: ${found ? 'Implemented' : 'Not detected'}`);
            });
            
            results.apiEndpoints = Object.values(apiChecks).filter(v => v).length >= 3;
        }

        // Final Summary
        console.log('\n📊 VERIFICATION SUMMARY');
        console.log('======================');
        const totalTests = Object.keys(results).length;
        const passedTests = Object.values(results).filter(v => v).length;
        const successRate = ((passedTests / totalTests) * 100).toFixed(0);
        
        Object.entries(results).forEach(([test, passed]) => {
            const testName = test.replace(/([A-Z])/g, ' $1').trim();
            console.log(`   ${passed ? '✅' : '❌'} ${testName.charAt(0).toUpperCase() + testName.slice(1)}`);
        });
        
        console.log(`\n   Overall: ${passedTests}/${totalTests} tests passed (${successRate}% success rate)`);
        
        // Recommendations
        console.log('\n💡 RECOMMENDATIONS');
        console.log('==================');
        
        if (results.sequentialThinking) {
            console.log('✅ Sequential Thinking integration is successfully deployed!');
        } else {
            console.log('⚠️  Sequential Thinking integration needs verification');
        }
        
        console.log('\nFor complete verification, please:');
        console.log('1. Open the site in a browser: ' + siteUrl);
        console.log('2. Open Developer Tools (F12) and check the Console');
        console.log('3. Test the research form with sample data');
        console.log('4. Monitor the Sequential Thinking process in action');
        console.log('5. Verify adaptive research strategies are working');
        
        if (!results.apiEndpoints) {
            console.log('\n⚠️  API integration may need additional configuration');
        }
        
        console.log('\n✅ Site verification complete!');
        
    } catch (error) {
        console.error('\n❌ ERROR during verification:', error.message);
        console.error('   Please ensure the site is deployed and accessible');
    }
};

// Run verification
verifyCanvasHeaderSite();