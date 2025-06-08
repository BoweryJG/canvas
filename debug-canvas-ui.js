// Canvas UI Debugging Script
// This script helps identify issues with the Canvas UI at https://canvas.repspheres.com

// Run this in the browser console after logging in to Canvas

(function debugCanvasUI() {
    console.log('=== Canvas UI Debug Started ===');
    
    // 1. Check if form elements exist
    console.log('\n--- Form Elements Check ---');
    const doctorSelect = document.querySelector('select[name="doctor"], #doctor, [data-field="doctor"]');
    const productSelect = document.querySelector('select[name="product"], #product, [data-field="product"]');
    const locationField = document.querySelector('input[name="location"], #location, [data-field="location"]');
    const generateButton = document.querySelector('button:contains("GENERATE INTEL"), [type="submit"]');
    
    console.log('Doctor select found:', !!doctorSelect);
    console.log('Product select found:', !!productSelect);
    console.log('Location field found:', !!locationField);
    console.log('Generate button found:', !!generateButton);
    
    // 2. Function to fill form
    window.fillCanvasForm = function() {
        console.log('\n--- Filling Form ---');
        
        // Fill doctor field
        if (doctorSelect) {
            // Look for "greg white" option
            const gregOption = Array.from(doctorSelect.options).find(opt => 
                opt.text.toLowerCase().includes('greg white') || 
                opt.value.toLowerCase().includes('greg white')
            );
            if (gregOption) {
                doctorSelect.value = gregOption.value;
                doctorSelect.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('Doctor set to:', gregOption.text);
            } else {
                console.error('Could not find "greg white" in doctor options');
            }
        }
        
        // Fill product field
        if (productSelect) {
            // Look for "yomi" option
            const yomiOption = Array.from(productSelect.options).find(opt => 
                opt.text.toLowerCase().includes('yomi') || 
                opt.value.toLowerCase().includes('yomi')
            );
            if (yomiOption) {
                productSelect.value = yomiOption.value;
                productSelect.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('Product set to:', yomiOption.text);
            } else {
                console.error('Could not find "yomi" in product options');
            }
        }
        
        console.log('Location field value:', locationField?.value);
    };
    
    // 3. Function to check results after generation
    window.checkCanvasResults = function() {
        console.log('\n--- Results Check ---');
        
        // Check for tactical sales brief
        const briefElements = document.querySelectorAll('[class*="brief"], [class*="tactical"], [data-field*="brief"]');
        console.log('Found brief elements:', briefElements.length);
        briefElements.forEach((el, i) => {
            console.log(`Brief element ${i}:`, {
                className: el.className,
                textContent: el.textContent.substring(0, 100),
                display: window.getComputedStyle(el).display,
                visibility: window.getComputedStyle(el).visibility,
                opacity: window.getComputedStyle(el).opacity
            });
        });
        
        // Check for source indicators (checkmarks/X)
        const indicators = document.querySelectorAll('[class*="check"], [class*="indicator"], svg, .fa-check, .fa-times');
        console.log('Found indicator elements:', indicators.length);
        indicators.forEach((el, i) => {
            console.log(`Indicator ${i}:`, {
                tagName: el.tagName,
                className: el.className,
                display: window.getComputedStyle(el).display
            });
        });
        
        // Check for confidence score
        const scoreElements = document.querySelectorAll('[class*="confidence"], [class*="score"], [data-field*="score"]');
        console.log('Found score elements:', scoreElements.length);
        scoreElements.forEach((el, i) => {
            const styles = window.getComputedStyle(el);
            console.log(`Score element ${i}:`, {
                className: el.className,
                textContent: el.textContent,
                fontSize: styles.fontSize,
                fontFamily: styles.fontFamily,
                lineHeight: styles.lineHeight,
                textAlign: styles.textAlign,
                verticalAlign: styles.verticalAlign
            });
        });
        
        // Check for any hidden containers
        const containers = document.querySelectorAll('.container, .results, [class*="results"]');
        containers.forEach((el, i) => {
            const styles = window.getComputedStyle(el);
            if (styles.display === 'none' || styles.visibility === 'hidden' || styles.opacity === '0') {
                console.warn(`Hidden container found:`, {
                    className: el.className,
                    display: styles.display,
                    visibility: styles.visibility,
                    opacity: styles.opacity
                });
            }
        });
    };
    
    // 4. Network monitoring for API responses
    window.monitorCanvasAPI = function() {
        console.log('\n--- Setting up API monitoring ---');
        
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            return originalFetch.apply(this, args).then(response => {
                const url = args[0];
                if (url.includes('intel') || url.includes('generate')) {
                    response.clone().json().then(data => {
                        console.log('API Response:', {
                            url: url,
                            status: response.status,
                            data: data
                        });
                        
                        // Check if tactical brief is in response
                        if (data.tactical_brief || data.tacticalBrief) {
                            console.log('✓ Tactical brief found in API response');
                        } else {
                            console.warn('✗ Tactical brief NOT found in API response');
                        }
                    }).catch(err => {
                        console.error('Error parsing API response:', err);
                    });
                }
                return response;
            });
        };
        
        console.log('API monitoring enabled. Make a request to see the response.');
    };
    
    // 5. DOM inspection helper
    window.inspectCanvasDOM = function() {
        console.log('\n--- DOM Structure ---');
        
        // Find main content area
        const mainContent = document.querySelector('main, .main-content, [role="main"]');
        if (mainContent) {
            console.log('Main content structure:');
            logDOMTree(mainContent, 0, 3); // Log 3 levels deep
        }
        
        function logDOMTree(element, depth, maxDepth) {
            if (depth > maxDepth) return;
            
            const indent = '  '.repeat(depth);
            const info = {
                tag: element.tagName,
                id: element.id || '',
                classes: element.className || '',
                textPreview: element.textContent?.substring(0, 50)?.trim() || ''
            };
            
            console.log(`${indent}${info.tag}${info.id ? '#' + info.id : ''}${info.classes ? '.' + info.classes.split(' ').join('.') : ''} "${info.textPreview}"`);
            
            Array.from(element.children).forEach(child => {
                logDOMTree(child, depth + 1, maxDepth);
            });
        }
    };
    
    // 6. Style debugging
    window.debugCanvasStyles = function() {
        console.log('\n--- Style Issues ---');
        
        // Check for CSS errors
        const styleSheets = Array.from(document.styleSheets);
        styleSheets.forEach((sheet, i) => {
            try {
                const rules = Array.from(sheet.cssRules || sheet.rules);
                // Look for rules that might affect our elements
                rules.forEach(rule => {
                    if (rule.selectorText && 
                        (rule.selectorText.includes('brief') || 
                         rule.selectorText.includes('indicator') || 
                         rule.selectorText.includes('score'))) {
                        console.log('Relevant CSS rule:', rule.selectorText, rule.style.cssText);
                    }
                });
            } catch (e) {
                console.warn(`Cannot access stylesheet ${i}:`, e.message);
            }
        });
    };
    
    console.log('\n=== Debug Functions Available ===');
    console.log('1. fillCanvasForm() - Fill the form with test data');
    console.log('2. checkCanvasResults() - Check for missing UI elements');
    console.log('3. monitorCanvasAPI() - Monitor API responses');
    console.log('4. inspectCanvasDOM() - Inspect DOM structure');
    console.log('5. debugCanvasStyles() - Check for CSS issues');
    console.log('\nRun monitorCanvasAPI() first, then proceed with form filling');
    
})();