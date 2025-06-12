import { generateNonce, getCSPHeader, securityHeaders } from '../utils/security';

// Express middleware for security headers
export const applySecurityHeaders = (_req: any, res: any, next: any) => {
  // Generate nonce for this request
  const nonce = generateNonce();
  res.locals.nonce = nonce;
  
  // Set CSP header
  res.setHeader('Content-Security-Policy', getCSPHeader(nonce));
  
  // Set other security headers
  Object.entries(securityHeaders).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  
  next();
};

// React Helmet configuration for client-side
export const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.npiregistry.cms.hhs.gov", "https://*.supabase.co", "wss://*.supabase.co", "https://www.google-analytics.com"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
};

// Netlify _headers file content for production
export const netlifyHeaders = `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.npiregistry.cms.hhs.gov https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests

/service-worker.js
  Cache-Control: no-cache, no-store, must-revalidate
  
/*.js
  Cache-Control: public, max-age=31536000, immutable
  
/*.css
  Cache-Control: public, max-age=31536000, immutable
  
/*.woff2
  Cache-Control: public, max-age=31536000, immutable
  Access-Control-Allow-Origin: *
  
/index.html
  Cache-Control: no-cache, no-store, must-revalidate
  X-Robots-Tag: all`;

// Create security audit report
export function generateSecurityAudit(): string {
  const audit = {
    timestamp: new Date().toISOString(),
    checks: {
      csp: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
      https: window.location.protocol === 'https:',
      secureContext: window.isSecureContext,
      serviceWorker: 'serviceWorker' in navigator,
      localStorage: 'localStorage' in window,
      crypto: 'crypto' in window && 'subtle' in window.crypto
    },
    recommendations: [] as string[]
  };
  
  // Add recommendations based on checks
  if (!audit.checks.https) {
    audit.recommendations.push('Use HTTPS in production');
  }
  
  if (!audit.checks.csp) {
    audit.recommendations.push('Implement Content Security Policy');
  }
  
  if (!audit.checks.serviceWorker) {
    audit.recommendations.push('Service Workers not supported in this browser');
  }
  
  return JSON.stringify(audit, null, 2);
}