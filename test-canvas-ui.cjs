const puppeteer = require('puppeteer');
const path = require('path');

async function testCanvasUI() {
  console.log('🚀 Starting Canvas UI Test...');
  
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Listen for console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.error('❌ Console error:', text);
    } else if (type === 'warning') {
      console.warn('⚠️ Console warning:', text);
    } else if (text.includes('error') || text.includes('Error') || text.includes('failed')) {
      console.log('🔍 Console message with error:', text);
    } else if (text.includes('API') || text.includes('fetch') || text.includes('research')) {
      console.log('🔍 API/Research log:', text);
    }
  });
  
  // Listen for page errors
  page.on('pageerror', error => {
    console.error('❌ Page error:', error.message);
  });
  
  try {
    console.log('📍 Navigating to Canvas...');
    await page.goto('https://canvas.repspheres.com', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for the page to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('📸 Taking initial screenshot...');
    await page.screenshot({ path: 'canvas-initial.png', fullPage: true });
    
    // Wait for doctor input to be available
    await page.waitForSelector('input[placeholder="Doctor Name"]', { timeout: 10000 });
    
    console.log('✍️ Filling in the form...');
    
    // Type in doctor name
    await page.type('input[placeholder="Doctor Name"]', 'greg white');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for autocomplete
    
    // Click first autocomplete result - look for the dropdown item
    try {
      // Wait for dropdown to appear
      await page.waitForSelector('.canvas-dropdown button', { timeout: 5000 });
      
      // Get all dropdown items
      const dropdownItems = await page.$$('.canvas-dropdown button');
      console.log(`📋 Found ${dropdownItems.length} doctor suggestions`);
      
      if (dropdownItems.length > 0) {
        // Click the first suggestion
        await dropdownItems[0].click();
        console.log('✅ Selected first doctor from dropdown');
        
        // Wait a bit for the selection to register
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (e) {
      console.log('⚠️ No autocomplete dropdown found:', e.message);
    }
    
    // Type in product name
    await page.waitForSelector('input[placeholder="Product Name"]');
    await page.type('input[placeholder="Product Name"]', 'yomi');
    
    console.log('📸 Taking pre-generate screenshot...');
    await page.screenshot({ path: 'canvas-filled-form.png', fullPage: true });
    
    // Click generate button
    console.log('🎯 Looking for Generate Intel button...');
    
    // Check button state
    const buttonText = await page.$eval('.scan-btn', el => el.textContent);
    console.log('Button text:', buttonText);
    
    const isDisabled = await page.$eval('.scan-btn', el => el.disabled);
    console.log('Button disabled:', isDisabled);
    
    if (isDisabled) {
      console.log('⚠️ Button is disabled, taking screenshot of current state');
      await page.screenshot({ path: 'canvas-button-disabled.png', fullPage: true });
    } else {
      await page.click('.scan-btn');
    }
    
    // Wait for results
    console.log('⏳ Waiting for results...');
    await new Promise(resolve => setTimeout(resolve, 15000)); // Give it more time to process
    
    // Check if still analyzing and wait for completion
    let attempts = 0;
    const maxAttempts = 6; // Total 60 seconds max wait
    
    while (attempts < maxAttempts) {
      const isStillAnalyzing = await page.$('.intelligence-progress');
      const hasResults = await page.$('.sales-brief');
      
      if (hasResults) {
        console.log('✅ Results found!');
        break;
      }
      
      if (isStillAnalyzing) {
        console.log(`⏳ Still analyzing... (attempt ${attempts + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        attempts++;
      } else {
        console.log('❓ Progress indicator gone but no results found');
        break;
      }
    }
    
    // Check final state
    const finalButton = await page.$eval('.scan-btn', el => el.textContent).catch(() => null);
    console.log('Final button state:', finalButton);
    
    // Take screenshot of results
    console.log('📸 Taking results screenshot...');
    await page.screenshot({ path: 'canvas-results.png', fullPage: true });
    
    // Check console for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('❌ Console error:', msg.text());
      }
    });
    
    // Check for specific elements
    console.log('🔍 Checking for UI elements...');
    
    const elements = {
      '.sales-brief': 'Sales Brief Section',
      '.insights-section': 'Insights Section',
      '.research-panel': 'Research Panel',
      '.coverage-grid': 'Coverage Grid',
      '.source-item': 'Source Items'
    };
    
    for (const [selector, name] of Object.entries(elements)) {
      const element = await page.$(selector);
      if (element) {
        console.log(`✅ Found: ${name}`);
        const box = await element.boundingBox();
        if (!box || box.height === 0) {
          console.log(`⚠️ Warning: ${name} has no height (might be hidden)`);
        }
      } else {
        console.log(`❌ Missing: ${name}`);
      }
    }
    
    // Get page content for debugging
    const pageContent = await page.content();
    require('fs').writeFileSync('canvas-page-content.html', pageContent);
    console.log('💾 Saved page content to canvas-page-content.html');
    
    // Check for any error messages
    const errorMessages = await page.$$eval('.error-message', elements => 
      elements.map(el => el.textContent)
    );
    
    if (errorMessages.length > 0) {
      console.log('❌ Error messages found:', errorMessages);
    }
    
    console.log('✅ Test completed! Check the screenshots.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'canvas-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testCanvasUI();