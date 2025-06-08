# Canvas UI Debugging Guide

## Issues to Debug:
1. Tactical sales brief is missing
2. Source indicators (checkmarks/X) aren't showing
3. Confidence score font alignment is broken

## Step-by-Step Debugging Process:

### 1. Initial Setup
1. Open Chrome DevTools (F12)
2. Navigate to https://canvas.repspheres.com
3. Log in if required
4. Open the Console tab

### 2. Load Debug Script
Copy and paste the entire contents of `debug-canvas-ui.js` into the console and press Enter.

### 3. Enable API Monitoring
Run in console:
```javascript
monitorCanvasAPI()
```
This will intercept all API calls to see what data is being returned.

### 4. Fill the Form
Run in console:
```javascript
fillCanvasForm()
```
This will attempt to:
- Select "greg white" as doctor
- Select "yomi" as product
- Check if location is auto-filled

### 5. Generate Intel
Click the "GENERATE INTEL" button manually and watch the console for:
- API response data
- Any JavaScript errors
- Network failures

### 6. Check Results
After results load, run:
```javascript
checkCanvasResults()
```
This will examine:
- Brief elements and their visibility
- Indicator elements (checkmarks/X)
- Score elements and their styling

### 7. Inspect DOM Structure
Run:
```javascript
inspectCanvasDOM()
```
This shows the hierarchical structure of the page to identify where elements should be.

### 8. Debug Styles
Run:
```javascript
debugCanvasStyles()
```
This checks for CSS rules that might be hiding or misaligning elements.

## Common Issues and Solutions:

### Missing Tactical Brief:
1. **Data not in API response**: Check console for API response structure
2. **Element hidden**: Look for `display: none`, `visibility: hidden`, or `opacity: 0`
3. **Wrong selector**: The brief might use different class names than expected
4. **Conditional rendering**: Check if there's a condition preventing render

### Missing Source Indicators:
1. **Font icons not loading**: Check for 404 errors on font files
2. **SVG issues**: Inspect if SVGs are present but have wrong dimensions
3. **CSS pseudo-elements**: Checkmarks might be ::before or ::after elements
4. **Wrong icon library**: Might use different icon set than expected

### Confidence Score Alignment:
1. **Line-height issues**: Check computed line-height value
2. **Vertical-align problems**: For inline elements
3. **Flexbox/Grid issues**: Parent container might have alignment issues
4. **Font loading**: Custom fonts might affect layout

## Manual Checks:

### In Elements Tab:
1. Search for "brief" or "tactical" in the HTML
2. Right-click suspicious elements → "Force state" → check all states
3. Look for elements with 0 height/width

### In Network Tab:
1. Filter by XHR/Fetch
2. Check response payload for the intel generation endpoint
3. Verify all required data fields are present

### In Sources Tab:
1. Search all files for "tactical" or "brief"
2. Set breakpoints where these elements should be rendered
3. Step through the rendering logic

## Screenshot Points:
Take screenshots at these moments:
1. Initial page load
2. After filling form (before submit)
3. During loading state
4. After results appear
5. With DevTools Elements panel open showing hidden elements
6. Console showing API responses

## Report Template:
After debugging, document:
1. Exact API response structure
2. Which elements are in DOM but hidden
3. Which elements are missing entirely
4. Any JavaScript errors
5. CSS rules affecting visibility
6. Network requests that failed