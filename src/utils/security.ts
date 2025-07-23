/**
 * Security utilities and middleware for Canvas
 */

// Content Security Policy configuration
export const getCSPHeader = (nonce?: string): string => {
  const directives = [
    "default-src 'self'",
    `script-src 'self' ${nonce ? `'nonce-${nonce}'` : "'unsafe-inline'"} https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.npiregistry.cms.hhs.gov https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://api.stripe.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ];
  
  return directives.join('; ');
};

// Security headers configuration
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

// Generate nonce for inline scripts
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

// Sanitize user input
export const sanitizeInput = (input: string): string => {
  // Remove any potential XSS vectors
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

// Validate API responses
export const validateApiResponse = (response: unknown, schema: Record<string, unknown>): boolean => {
  // Basic schema validation
  if (!response || typeof response !== 'object') {
    return false;
  }
  
  for (const key in schema) {
    if (schema[key].required && !(key in response)) {
      console.error(`Missing required field: ${key}`);
      return false;
    }
    
    if (key in response && schema[key].type) {
      const actualType = Array.isArray(response[key]) ? 'array' : typeof response[key];
      if (actualType !== schema[key].type) {
        console.error(`Invalid type for ${key}: expected ${schema[key].type}, got ${actualType}`);
        return false;
      }
    }
  }
  
  return true;
};

// Secure storage with encryption
export class SecureStorage {
  private static encryptionKey: CryptoKey | null = null;
  
  static async init() {
    // Generate or retrieve encryption key
    const keyMaterial = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
    
    this.encryptionKey = keyMaterial;
  }
  
  static async encrypt(data: string): Promise<string> {
    if (!this.encryptionKey) await this.init();
    
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey!,
      encodedData
    );
    
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  }
  
  static async decrypt(encryptedData: string): Promise<string> {
    if (!this.encryptionKey) await this.init();
    
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey!,
      data
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  }
}

// Rate limit tracking for security
export class SecurityRateLimiter {
  private static attempts = new Map<string, number[]>();
  
  static checkRateLimit(
    identifier: string, 
    maxAttempts: number = 5, 
    windowMs: number = 60000
  ): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(identifier) || [];
    
    // Clean old attempts
    const validAttempts = attempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false;
    }
    
    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);
    
    return true;
  }
  
  static reset(identifier: string) {
    this.attempts.delete(identifier);
  }
}

// CSRF token management
export class CSRFTokenManager {
  private static token: string | null = null;
  
  static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    this.token = btoa(String.fromCharCode(...array));
    
    // Store in session storage
    sessionStorage.setItem('csrf_token', this.token);
    
    return this.token;
  }
  
  static getToken(): string {
    if (!this.token) {
      this.token = sessionStorage.getItem('csrf_token') || this.generateToken();
    }
    return this.token;
  }
  
  static validateToken(token: string): boolean {
    return token === this.getToken();
  }
}

// Secure fetch wrapper
export async function secureFetch(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  // Add CSRF token to requests
  const headers = new Headers(options.headers);
  headers.set('X-CSRF-Token', CSRFTokenManager.getToken());
  
  // Add security headers
  headers.set('X-Requested-With', 'XMLHttpRequest');
  
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin'
  });
  
  // Validate response headers
  const contentType = response.headers.get('content-type');
  if (contentType && !contentType.includes('application/json')) {
    console.warn(`Unexpected content type: ${contentType}`);
  }
  
  return response;
}

// Input validation schemas
export const validationSchemas = {
  npiNumber: {
    pattern: /^\d{10}$/,
    message: 'NPI must be exactly 10 digits'
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email format'
  },
  phone: {
    pattern: /^[\d\s\-.()]+$/,
    message: 'Invalid phone number format'
  },
  url: {
    pattern: /^https?:\/\/.+/,
    message: 'URL must start with http:// or https://'
  }
};

// Validate input against schema
export function validateInput(
  value: string, 
  schema: keyof typeof validationSchemas
): { valid: boolean; message?: string } {
  const validator = validationSchemas[schema];
  
  if (!validator.pattern.test(value)) {
    return { valid: false, message: validator.message };
  }
  
  return { valid: true };
}