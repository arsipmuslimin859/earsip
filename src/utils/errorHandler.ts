import { notifications } from '@mantine/notifications';
import { logSecurityEvent } from './security';

/**
 * Secure error handling utilities
 */

export interface SecureError {
  message: string;
  code?: string;
  isPublic: boolean; // Whether this error can be shown to users
  originalError?: Error;
}

/**
 * Create a secure error object
 */
export function createSecureError(
  message: string,
  code?: string,
  isPublic: boolean = false,
  originalError?: Error
): SecureError {
  return {
    message,
    code,
    isPublic,
    originalError
  };
}

/**
 * Handle errors securely - don't expose internal details to users
 */
export function handleSecureError(error: any, context?: string): void {
  let secureError: SecureError;

  // Log the full error for debugging (server-side only in production)
  console.error('Secure Error Handler:', {
    error,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  });

  // Determine error type and create appropriate response
  if (error?.code === 'PGRST116') {
    // Supabase auth error
    secureError = createSecureError(
      'Sesi login telah berakhir. Silakan login kembali.',
      'AUTH_EXPIRED',
      true
    );
  } else if (error?.message?.includes('JWT')) {
    // JWT related error
    secureError = createSecureError(
      'Token autentikasi tidak valid. Silakan login kembali.',
      'INVALID_TOKEN',
      true
    );
  } else if (error?.message?.includes('permission') || error?.message?.includes('unauthorized')) {
    // Permission error
    secureError = createSecureError(
      'Anda tidak memiliki izin untuk melakukan tindakan ini.',
      'PERMISSION_DENIED',
      true
    );
  } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
    // Network error
    secureError = createSecureError(
      'Terjadi kesalahan koneksi. Periksa koneksi internet Anda.',
      'NETWORK_ERROR',
      true
    );
  } else if (error?.message?.includes('storage') || error?.message?.includes('bucket')) {
    // Storage related error
    secureError = createSecureError(
      'Terjadi kesalahan pada sistem penyimpanan file.',
      'STORAGE_ERROR',
      true
    );
  } else {
    // Generic error - don't expose details
    secureError = createSecureError(
      'Terjadi kesalahan sistem. Silakan coba lagi atau hubungi administrator.',
      'SYSTEM_ERROR',
      true
    );

    // Log security event for unknown errors
    logSecurityEvent('UNKNOWN_ERROR', {
      context,
      errorMessage: error?.message,
      errorCode: error?.code
    });
  }

  // Show user-friendly notification
  if (secureError.isPublic) {
    notifications.show({
      title: 'Error',
      message: secureError.message,
      color: 'red',
      autoClose: 5000
    });
  }
}

/**
 * Global error boundary handler
 */
export function handleGlobalError(error: Error, errorInfo?: any): void {
  // Log security event
  logSecurityEvent('GLOBAL_ERROR', {
    error: error.message,
    stack: error.stack,
    errorInfo
  });

  // Show generic error to user
  notifications.show({
    title: 'Error Sistem',
    message: 'Terjadi kesalahan yang tidak terduga. Halaman akan dimuat ulang.',
    color: 'red',
    autoClose: false
  });

  // Reload page after a delay to prevent infinite loops
  setTimeout(() => {
    window.location.reload();
  }, 3000);
}

/**
 * Validate API response for security
 */
export function validateApiResponse(response: any): boolean {
  // Basic validation - ensure response is not malicious
  if (typeof response === 'string') {
    // Check for script injection attempts
    if (response.includes('<script') || response.includes('javascript:')) {
      logSecurityEvent('MALICIOUS_RESPONSE_DETECTED', { response });
      return false;
    }
  }

  return true;
}

/**
 * Sanitize error messages before logging
 */
export function sanitizeErrorForLogging(error: any): any {
  if (!error) return error;

  const sanitized = { ...error };

  // Remove sensitive information
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.apiKey;
  delete sanitized.secret;

  // Sanitize stack traces in production
  if (process.env.NODE_ENV === 'production' && sanitized.stack) {
    sanitized.stack = '[STACK TRACE REMOVED IN PRODUCTION]';
  }

  return sanitized;
}

/**
 * Rate limit error notifications
 */
let lastErrorTime = 0;
const ERROR_THROTTLE_MS = 1000; // 1 second

export function throttledErrorHandler(error: any, context?: string): void {
  const now = Date.now();

  if (now - lastErrorTime > ERROR_THROTTLE_MS) {
    handleSecureError(error, context);
    lastErrorTime = now;
  }
}