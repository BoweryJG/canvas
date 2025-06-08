// Framework-Specific Debugging for Canvas UI
// This checks for React/Vue/Angular specific issues

(function debugFramework() {
    console.log('=== Framework-Specific Debug ===');
    
    // 1. Detect Framework
    const detectFramework = () => {
        if (window.React || document.querySelector('[data-reactroot]')) {
            return 'React';
        } else if (window.Vue || document.querySelector('[data-server-rendered]')) {
            return 'Vue';
        } else if (window.ng || document.querySelector('[ng-version]')) {
            return 'Angular';
        } else {
            return 'Unknown/Vanilla';
        }
    };
    
    const framework = detectFramework();
    console.log('Detected framework:', framework);
    
    // 2. React-specific debugging
    if (framework === 'React') {
        console.log('\n--- React Debug ---');
        
        // Find React root
        const reactRoot = document.querySelector('#root, #app, [data-reactroot]');
        if (reactRoot && reactRoot._reactRootContainer) {
            console.log('React root found:', reactRoot);
            
            // Try to access React DevTools
            if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
                console.log('React DevTools available');
                const renderers = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers;
                console.log('React renderers:', renderers);
            }
        }
        
        // Check for React error boundaries
        const checkErrorBoundaries = () => {
            const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"]');
            errorElements.forEach(el => {
                if (el.textContent.includes('error') || el.textContent.includes('Error')) {
                    console.error('Possible React error found:', el.textContent);
                }
            });
        };
        checkErrorBoundaries();
    }
    
    // 3. Vue-specific debugging
    if (framework === 'Vue') {
        console.log('\n--- Vue Debug ---');
        
        // Find Vue instances
        const findVueInstances = () => {
            const vueElements = [];
            document.querySelectorAll('*').forEach(el => {
                if (el.__vue__) {
                    vueElements.push({
                        element: el,
                        data: el.__vue__.$data,
                        computed: el.__vue__.$options.computed
                    });
                }
            });
            return vueElements;
        };
        
        const vueInstances = findVueInstances();
        console.log('Found Vue instances:', vueInstances.length);
        
        // Look for Vue components with our data
        vueInstances.forEach((instance, i) => {
            if (JSON.stringify(instance.data).includes('brief') || 
                JSON.stringify(instance.data).includes('tactical')) {
                console.log(`Vue instance ${i} contains relevant data:`, instance.data);
            }
        });
    }
    
    // 4. Check for conditional rendering
    window.checkConditionalRendering = function() {
        console.log('\n--- Conditional Rendering Check ---');
        
        // Look for v-if, v-show (Vue) or common React patterns
        const conditionalElements = document.querySelectorAll('[v-if], [v-show], [ng-if], [*ngIf]');
        console.log('Elements with conditional directives:', conditionalElements.length);
        
        // Check for hidden elements that might contain our data
        const allElements = document.querySelectorAll('*');
        const hiddenWithContent = [];
        
        allElements.forEach(el => {
            const styles = window.getComputedStyle(el);
            const isHidden = styles.display === 'none' || 
                           styles.visibility === 'hidden' || 
                           parseFloat(styles.opacity) === 0;
            
            if (isHidden && el.textContent && 
                (el.textContent.includes('brief') || 
                 el.textContent.includes('tactical') ||
                 el.textContent.includes('confidence'))) {
                hiddenWithContent.push({
                    element: el,
                    reason: {
                        display: styles.display,
                        visibility: styles.visibility,
                        opacity: styles.opacity
                    },
                    textPreview: el.textContent.substring(0, 100)
                });
            }
        });
        
        console.log('Hidden elements with relevant content:', hiddenWithContent);
        return hiddenWithContent;
    };
    
    // 5. Check component state
    window.checkComponentState = function() {
        console.log('\n--- Component State Check ---');
        
        // For React
        if (framework === 'React') {
            // Try to find components using React DevTools hook
            if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
                try {
                    const fiberRoot = document.querySelector('#root')._reactRootContainer._internalRoot;
                    console.log('React Fiber Root:', fiberRoot);
                    
                    // Traverse fiber tree to find components with state
                    const findComponentsWithState = (fiber, components = []) => {
                        if (fiber.memoizedState && typeof fiber.type === 'function') {
                            components.push({
                                name: fiber.type.name || 'Anonymous',
                                state: fiber.memoizedState,
                                props: fiber.memoizedProps
                            });
                        }
                        if (fiber.child) findComponentsWithState(fiber.child, components);
                        if (fiber.sibling) findComponentsWithState(fiber.sibling, components);
                        return components;
                    };
                    
                    const components = findComponentsWithState(fiberRoot.current);
                    console.log('Components with state:', components);
                } catch (e) {
                    console.log('Could not traverse React fiber tree:', e);
                }
            }
        }
        
        // Check localStorage/sessionStorage for state
        console.log('\n--- Storage Check ---');
        console.log('LocalStorage keys:', Object.keys(localStorage));
        console.log('SessionStorage keys:', Object.keys(sessionStorage));
        
        // Check for state related to our issue
        Object.keys(localStorage).forEach(key => {
            const value = localStorage.getItem(key);
            if (value && (value.includes('brief') || value.includes('tactical'))) {
                console.log(`LocalStorage[${key}]:`, value);
            }
        });
    };
    
    // 6. Animation/Transition Issues
    window.checkAnimations = function() {
        console.log('\n--- Animation/Transition Check ---');
        
        const animatedElements = document.querySelectorAll('*');
        const elementsWithTransitions = [];
        
        animatedElements.forEach(el => {
            const styles = window.getComputedStyle(el);
            if (styles.transition !== 'none' || 
                styles.animation !== 'none' || 
                styles.transform !== 'none') {
                
                if (el.className && 
                    (el.className.includes('brief') || 
                     el.className.includes('indicator') || 
                     el.className.includes('score'))) {
                    elementsWithTransitions.push({
                        element: el,
                        transition: styles.transition,
                        animation: styles.animation,
                        transform: styles.transform,
                        opacity: styles.opacity
                    });
                }
            }
        });
        
        console.log('Elements with animations/transitions:', elementsWithTransitions);
        
        // Force complete animations
        elementsWithTransitions.forEach(item => {
            item.element.style.transition = 'none';
            item.element.style.animation = 'none';
            console.log('Disabled animations for:', item.element);
        });
    };
    
    // 7. Check AJAX/Fetch State
    window.checkAsyncState = function() {
        console.log('\n--- Async State Check ---');
        
        // Check if any elements have loading classes
        const loadingElements = document.querySelectorAll('[class*="loading"], [class*="pending"], [class*="spinner"]');
        console.log('Loading elements found:', loadingElements.length);
        
        loadingElements.forEach(el => {
            console.log('Loading element:', {
                className: el.className,
                display: window.getComputedStyle(el).display
            });
        });
        
        // Check for skeleton screens
        const skeletons = document.querySelectorAll('[class*="skeleton"], [class*="placeholder"]');
        console.log('Skeleton/placeholder elements:', skeletons.length);
    };
    
    console.log('\n=== Additional Debug Functions ===');
    console.log('1. checkConditionalRendering() - Find hidden elements with content');
    console.log('2. checkComponentState() - Inspect component state and storage');
    console.log('3. checkAnimations() - Find and disable animations');
    console.log('4. checkAsyncState() - Check for loading states');
    
})();