// Site verification script for Canvas Header with Sequential Thinking
// Run this script in the browser console at https://canvas.repspheres.com

async function verifySite() {
    const results = {
        pageLoaded: false,
        researchPanelFound: false,
        sequentialThinkingIntegration: false,
        consoleErrors: [],
        networkErrors: [],
        components: {},
        timestamp: new Date().toISOString()
    };

    // Check if page loaded
    results.pageLoaded = document.readyState === 'complete';

    // Look for research panel
    const researchPanel = document.querySelector('[class*="research"], [id*="research"], [data-testid*="research"]');
    results.researchPanelFound = !!researchPanel;

    // Check for Sequential Thinking integration
    const sequentialThinkingElements = document.querySelectorAll('[class*="sequential"], [class*="thinking"], [class*="adaptive"]');
    results.sequentialThinkingIntegration = sequentialThinkingElements.length > 0;

    // Check for specific components
    results.components = {
        canvas: !!document.querySelector('canvas, [class*="canvas"]'),
        header: !!document.querySelector('header, [class*="header"]'),
        researchPanel: results.researchPanelFound,
        sequentialThinking: results.sequentialThinkingIntegration
    };

    // Capture console errors
    const originalError = console.error;
    console.error = function(...args) {
        results.consoleErrors.push(args.join(' '));
        originalError.apply(console, args);
    };

    // Check for any visible error messages
    const errorElements = document.querySelectorAll('[class*="error"], [role="alert"]');
    if (errorElements.length > 0) {
        results.visibleErrors = Array.from(errorElements).map(el => el.textContent);
    }

    // Log results
    console.log('=== Canvas Header Site Verification Results ===');
    console.log('URL:', window.location.href);
    console.log('Page Loaded:', results.pageLoaded);
    console.log('Research Panel Found:', results.researchPanelFound);
    console.log('Sequential Thinking Integration:', results.sequentialThinkingIntegration);
    console.log('Components Found:', results.components);
    
    if (results.consoleErrors.length > 0) {
        console.log('Console Errors:', results.consoleErrors);
    }
    
    if (results.visibleErrors) {
        console.log('Visible Errors:', results.visibleErrors);
    }

    return results;
}

// Execute verification
verifySite();