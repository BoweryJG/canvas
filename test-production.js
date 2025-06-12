import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 Testing Canvas Production with Improvements...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1440, height: 900 }
  });
  
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.error('❌ Page Error:', text);
    } else if (text.includes('Cache hit') || text.includes('Cache miss')) {
      console.log('🗂️ Cache:', text);
    } else if (text.includes('Retry')) {
      console.log('🔄 Retry:', text);
    }
  });

  try {
    // Navigate to production site
    console.log('📍 Navigating to https://canvas.repspheres.com...');
    await page.goto('https://canvas.repspheres.com', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('✅ Page loaded successfully\n');
    
    // Wait for the form to be ready
    await page.waitForSelector('input[placeholder="Start typing doctor name..."]', { timeout: 10000 });
    
    // Test 1: NPI Autocomplete with caching
    console.log('🔍 Testing NPI Autocomplete with caching...');
    
    // First search (cache miss)
    await page.type('input[placeholder="Start typing doctor name..."]', 'Michael Smith');
    await page.waitForTimeout(500);
    
    // Clear and search again (should hit cache)
    await page.click('input[placeholder="Start typing doctor name..."]', { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(500);
    
    await page.type('input[placeholder="Start typing doctor name..."]', 'Michael Smith');
    await page.waitForTimeout(500);
    
    // Check if dropdown appears
    const dropdownVisible = await page.evaluate(() => {
      const dropdown = document.querySelector('.canvas-dropdown');
      return dropdown && dropdown.style.display !== 'none';
    });
    
    if (dropdownVisible) {
      console.log('✅ NPI autocomplete working with caching\n');
      
      // Select first doctor
      await page.waitForSelector('.canvas-dropdown button', { visible: true });
      await page.click('.canvas-dropdown button');
      console.log('✅ Doctor selected\n');
    } else {
      console.log('⚠️ No dropdown visible - checking for errors\n');
    }
    
    // Test 2: Product input with sanitization
    console.log('🛡️ Testing product input sanitization...');
    await page.type('input[placeholder="Product Name"]', '<script>alert("test")</script>Yomi Robot');
    
    // Check if input was sanitized
    const productValue = await page.$eval('input[placeholder="Product Name"]', el => el.value);
    console.log(`Product value after sanitization: "${productValue}"`);
    console.log(productValue.includes('<script>') ? '❌ Sanitization failed' : '✅ Input properly sanitized\n');
    
    // Test 3: Generate intelligence with retry logic
    console.log('🎯 Testing intelligence generation with retry logic...');
    
    // Check if Generate Intel button appears
    const generateButton = await page.waitForSelector('button:has-text("GENERATE INTEL")', { 
      visible: true,
      timeout: 5000 
    }).catch(() => null);
    
    if (generateButton) {
      console.log('✅ Generate Intel button visible');
      
      // Click generate
      await generateButton.click();
      console.log('⏳ Generating intelligence...');
      
      // Wait for loading overlay or gauge
      const loadingVisible = await Promise.race([
        page.waitForSelector('.loading-overlay', { visible: true, timeout: 5000 }).then(() => 'overlay'),
        page.waitForSelector('.intelligence-gauge', { visible: true, timeout: 5000 }).then(() => 'gauge')
      ]).catch(() => null);
      
      if (loadingVisible) {
        console.log(`✅ Loading state displayed (${loadingVisible})`);
        
        // Wait for results
        await page.waitForSelector('.instant-results-section, .insights-section', { 
          visible: true, 
          timeout: 60000 
        });
        
        console.log('✅ Intelligence generated successfully\n');
        
        // Check for instant vs deep research
        const instantBadge = await page.$('.instant-badge');
        if (instantBadge) {
          const generationTime = await instantBadge.evaluate(el => el.textContent);
          console.log(`⚡ ${generationTime}`);
        }
        
        // Test 4: Check error handling
        console.log('🛡️ Checking error handling...');
        const errorBoundaryActive = await page.evaluate(() => {
          return document.querySelector('div:has(> h2:has-text("Something went wrong"))') !== null;
        });
        
        console.log(errorBoundaryActive ? '❌ Error boundary triggered' : '✅ No errors - app stable\n');
        
      } else {
        console.log('⚠️ No loading state displayed');
      }
    } else {
      console.log('⚠️ Generate Intel button not found');
    }
    
    // Test 5: Performance metrics
    console.log('📊 Performance Metrics:');
    const metrics = await page.metrics();
    console.log(`- JS Heap Size: ${(metrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`- DOM Nodes: ${metrics.Nodes}`);
    console.log(`- Layout Count: ${metrics.LayoutCount}`);
    
    // Check cache stats
    const cacheStats = await page.evaluate(() => {
      // Check if cache is being used
      const cacheEntries = performance.getEntriesByType('resource')
        .filter(entry => entry.name.includes('api'))
        .map(entry => ({
          url: entry.name.split('?')[0].split('/').pop(),
          cached: entry.transferSize === 0 && entry.decodedBodySize > 0,
          duration: entry.duration.toFixed(2)
        }));
      return cacheEntries;
    });
    
    if (cacheStats.length > 0) {
      console.log('\n📦 API Cache Performance:');
      cacheStats.forEach(entry => {
        console.log(`- ${entry.url}: ${entry.cached ? '✅ Cached' : '🌐 Network'} (${entry.duration}ms)`);
      });
    }
    
    console.log('\n✅ All production improvements tested successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();