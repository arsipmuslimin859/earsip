/**
 * Security utilities for input validation and sanitization
 */

// HTML entity encoding for XSS prevention
const htmlEntities: Record<string, string> = {
  '&': '&',
  '<': '<',
  '>': '>',
  '"': '"',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';

  return input.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate URL format and security
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }

    // Prevent localhost and private IP access in production
    if (process.env.NODE_ENV === 'production') {
      const hostname = parsedUrl.hostname.toLowerCase();

      // Block localhost and private IPs
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        (hostname.startsWith('172.') && parseInt(hostname.split('.')[1]) >= 16 && parseInt(hostname.split('.')[1]) <= 31)
      ) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Validate file name for security
 */
export function isValidFileName(fileName: string): boolean {
  if (!fileName || fileName.length > 255) return false;

  // Prevent path traversal attacks
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return false;
  }

  // Prevent hidden files
  if (fileName.startsWith('.')) return false;

  // Only allow alphanumeric, dots, hyphens, underscores, and spaces
  const validNameRegex = /^[a-zA-Z0-9._\-\s]+$/;
  return validNameRegex.test(fileName);
}

/**
 * Validate file type against allowed types
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  // Check MIME type
  const mimeTypeAllowed = allowedTypes.some(type => {
    if (type.startsWith('.')) {
      // Extension-based check
      return fileName.endsWith(type);
    } else {
      // MIME type check
      return fileType === type || fileType.startsWith(type.split('/')[0] + '/');
    }
  });

  return mimeTypeAllowed;
}

/**
 * Rate limiting helper (client-side)
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);

    if (validAttempts.length >= maxAttempts) {
      return false;
    }

    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Generate secure random string
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
  score: number;
} {
  const errors: string[] = [];
  let score = 0;

  if (password.length < 8) {
    errors.push('Password minimal 8 karakter');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password harus mengandung huruf kecil');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password harus mengandung huruf besar');
  } else {
    score += 1;
  }

  if (!/\d/.test(password)) {
    errors.push('Password harus mengandung angka');
  } else {
    score += 1;
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password harus mengandung karakter khusus');
  } else {
    score += 1;
  }

  return {
    isValid: errors.length === 0,
    errors,
    score: Math.min(score, 5)
  };
}

/**
 * Sanitize HTML content (basic)
 */
export function sanitizeHtml(html: string): string {
  if (typeof html !== 'string') return '';

  // Remove script tags and their content
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  html = html.replace(/<script[^>]*>.*?<\/script>/gis, '');

  // Remove event handlers
  html = html.replace(/on\w+="[^"]*"/gi, '');
  html = html.replace(/on\w+='[^']*'/gi, '');

  // Remove javascript: URLs
  html = html.replace(/javascript:[^"']*/gi, '');

  return html;
}

/**
 * Check if user has permission for action
 */
export function hasPermission(userRole: string, requiredPermission: string): boolean {
  const rolePermissions: Record<string, string[]> = {
    'admin': ['read', 'write', 'delete', 'manage_users', 'manage_settings'],
    'user': ['read', 'write', 'delete'],
    'viewer': ['read']
  };

  const permissions = rolePermissions[userRole] || [];
  return permissions.includes(requiredPermission);
}

/**
 * Log security events
 */
export function logSecurityEvent(event: string, details: any): void {
  const securityLog = {
    timestamp: new Date().toISOString(),
    event,
    details,
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  console.warn('Security Event:', securityLog);

  // In production, send to security monitoring service
  // Example: sendToSecurityService(securityLog);
}

/**
 * Detect potential XSS attempts
 */
export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /expression\s*\(/i,
    /vbscript:/i,
    /data:text\/html/i
  ];

  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Secure local storage wrapper
 */
export class SecureStorage {
  private static instance: SecureStorage;
  private keyPrefix = 'secure_';

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  setItem(key: string, value: any): void {
    try {
      const encrypted = btoa(JSON.stringify(value));
      localStorage.setItem(this.keyPrefix + key, encrypted);
    } catch (error) {
      console.error('Failed to store secure item:', error);
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const encrypted = localStorage.getItem(this.keyPrefix + key);
      if (!encrypted) return null;

      return JSON.parse(atob(encrypted));
    } catch (error) {
      console.error('Failed to retrieve secure item:', error);
      this.removeItem(key); // Remove corrupted data
      return null;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(this.keyPrefix + key);
  }

  clear(): void {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.keyPrefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const secureStorage = SecureStorage.getInstance();