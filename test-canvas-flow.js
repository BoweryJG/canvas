import puppeteer from 'puppeteer';

(async () => {
  console.log('🧪 Testing Canvas Sales Intelligence Flow');
  console.log('=====================================\n');
  
  const browser = await puppeteer.launch({
    headless: false, // Show browser for debugging
    devtools: true   // Open devtools automatically
  });
  
  const page = await browser.newPage();
  
  // Listen to console messages
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Perplexity') || text.includes('intelligence') || text.includes('fallback')) {
      console.log(`📌 Browser Console: ${text}`);
    }
  });
  
  // Listen to network requests
  page.on('request', request => {
    if (request.url().includes('perplexity') || request.url().includes('npi-lookup')) {
      console.log(`📡 Request: ${request.method()} ${request.url()}`);
    }
  });
  
  // Listen to network responses
  page.on('response', response => {
    if (response.url().includes('perplexity') || response.url().includes('npi-lookup')) {
      console.log(`📥 Response: ${response.status()} ${response.url()}`);
      
      // Log error responses
      if (response.status() >= 400) {
        response.text().then(body => {
          console.log(`❌ Error Response Body: ${body.substring(0, 500)}`);
        });
      }
    }
  });
  
  try {
    console.log('1️⃣ Navigating to Canvas app...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    
    // Wait for the app to load
    await new Promise(resolve => setTimeout(resolve, 2000)); // Give page time to load
    
    // Debug: Take a screenshot and log page content
    await page.screenshot({ path: 'canvas-debug-initial.png' });
    console.log('📸 Screenshot saved as canvas-debug-initial.png');
    
    // Try to find any input fields
    const inputs = await page.$$eval('input', els => els.map(el => ({
      placeholder: el.placeholder,
      type: el.type,
      className: el.className,
      id: el.id
    })));
    console.log('🔍 Found input fields:', inputs);
    
    await page.waitForSelector('input[placeholder*="Start typing doctor name"]', { timeout: 10000 });
    console.log('✅ App loaded successfully\n');
    
    console.log('2️⃣ Typing doctor name...');
    await page.click('input[placeholder*="Start typing doctor name"]');
    await page.type('input[placeholder*="Start typing doctor name"]', 'greg white', { delay: 100 });
    
    // Wait for autocomplete results
    console.log('⏳ Waiting for NPI autocomplete results...');
    
    // Wait for the dropdown to appear with results
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Take a screenshot to see the dropdown
    await page.screenshot({ path: 'canvas-debug-autocomplete.png' });
    console.log('📸 Screenshot of autocomplete dropdown');
    
    // Try to find and click the first autocomplete suggestion
    try {
      // Look for the dropdown container
      await page.waitForSelector('div.absolute.w-full.mt-1.rounded-lg.shadow-lg', { timeout: 5000 });
      console.log('✅ Dropdown appeared');
      
      // Find all button elements in the dropdown
      const suggestions = await page.$$eval('div.absolute.w-full.mt-1.rounded-lg.shadow-lg button', els => 
        els.map(el => ({ 
          text: el.textContent,
          innerHTML: el.innerHTML.substring(0, 100)
        }))
      );
      console.log('🔍 Found suggestions:', suggestions);
      
      // Click the first button in the dropdown
      await page.click('div.absolute.w-full.mt-1.rounded-lg.shadow-lg button:first-child');
      console.log('✅ Clicked on first doctor suggestion');
      
    } catch (error) {
      console.error('❌ Could not find dropdown or suggestions:', error.message);
      // Take a screenshot to debug
      await page.screenshot({ path: 'canvas-error-no-dropdown.png' });
      throw error;
    }
    
    // Type product name
    console.log('4️⃣ Entering product name...');
    await page.waitForSelector('input[placeholder*="Product Name"]');
    await page.click('input[placeholder*="Product Name"]');
    await page.type('input[placeholder*="Product Name"]', 'yomi', { delay: 50 });
    
    // Click Generate Intel button
    console.log('5️⃣ Clicking Generate Intel button...');
    await page.waitForSelector('button', { timeout: 5000 });
    const buttons = await page.$$('button');
    for (const button of buttons) {
      const text = await button.evaluate(el => el.textContent);
      if (text && text.includes('GENERATE INTEL')) {
        await button.click();
        break;
      }
    };
    
    console.log('⏳ Waiting for intelligence generation...\n');
    
    // Wait for results and check what appears
    await new Promise(resolve => setTimeout(resolve, 3000)); // Give it time to process
    
    // Check for tactical brief
    const tacticalBriefExists = await page.$eval('.tactical-brief', el => el.textContent)
      .catch(() => null);
    
    if (tacticalBriefExists) {
      console.log('📋 Tactical Brief Found:');
      console.log(tacticalBriefExists.substring(0, 200) + '...\n');
      
      // Check if it's showing the prompt (fallback) or actual content
      if (tacticalBriefExists.includes('sentences):') || tacticalBriefExists.includes('- Immediate approach')) {
        console.log('⚠️  WARNING: Showing prompt text instead of generated content!');
        console.log('This indicates the fallback is being used.\n');
      } else {
        console.log('✅ Showing proper generated content (not fallback)\n');
      }
    }
    
    // Check for Yomi-specific content
    const pageContent = await page.content();
    
    console.log('6️⃣ Checking for Yomi-specific content:');
    if (pageContent.includes('robotic') || pageContent.includes('haptic')) {
      console.log('✅ Found Yomi-specific keywords (robotic/haptic)');
    } else {
      console.log('❌ No Yomi-specific keywords found');
    }
    
    if (pageContent.includes('implant')) {
      console.log('✅ Found implant-related content');
    } else {
      console.log('❌ No implant-related content found');
    }
    
    // Check for error messages
    const errors = await page.$$eval('.error-message', els => els.map(el => el.textContent));
    if (errors.length > 0) {
      console.log('\n❌ Errors found on page:');
      errors.forEach(err => console.log(`  - ${err}`));
    }
    
    // Take a screenshot
    console.log('\n📸 Taking screenshot...');
    await page.screenshot({ path: 'canvas-test-result.png', fullPage: true });
    console.log('Screenshot saved as canvas-test-result.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'canvas-test-error.png', fullPage: true });
  }
  
  console.log('\n🔍 Check the browser DevTools Network tab for API calls');
  console.log('Press Ctrl+C to close the browser and end the test');
  
  // Keep browser open for inspection
  await new Promise(() => {});
})();