#!/bin/bash

echo "Canvas Header Quick Fix Script"
echo "=============================="
echo ""
echo "This script will help you fix the current errors."
echo ""

echo "STEP 1: Supabase Tables"
echo "-----------------------"
echo "1. Go to: https://app.supabase.com"
echo "2. Select your project (cbopynuvhcymbumjnvay)"
echo "3. Click on 'SQL Editor' in the left sidebar"
echo "4. Copy and paste the contents of setup-supabase-tables.sql"
echo "5. Click 'Run' to execute the SQL"
echo ""
echo "Press Enter when you've completed this step..."
read

echo ""
echo "STEP 2: Verify Environment Variables in Netlify"
echo "-----------------------------------------------"
echo "1. Go to: https://app.netlify.com"
echo "2. Select your site (canvas-intel-module)"
echo "3. Go to Site Settings > Environment Variables"
echo "4. Verify these are set:"
echo "   - OPENROUTER_API_KEY"
echo "   - BRAVE_API_KEY"
echo "   - FIRECRAWL_API_KEY"
echo ""
echo "Press Enter when verified..."
read

echo ""
echo "STEP 3: Deploy Changes"
echo "----------------------"
echo "Running deployment commands..."
git add .
git commit -m "Fix: Add function timeout configuration and error handling"
git push origin main

echo ""
echo "✅ Changes pushed! Monitor your Netlify deployment."
echo ""
echo "The DNS error should disappear once the Supabase tables are created."
echo "The 499 timeouts should be reduced with the new timeout configuration."
echo ""
echo "If issues persist, check the Netlify function logs for more details."