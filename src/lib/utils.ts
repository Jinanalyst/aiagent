import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Retry utility with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      
      console.log(`Attempt ${attempt + 1} failed, retrying in ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Error classification utility
export function classifyError(error: any): {
  type: 'network' | 'rate_limit' | 'timeout' | 'auth' | 'server' | 'unknown';
  retryable: boolean;
  message: string;
} {
  const message = error?.message || String(error);
  const status = error?.status || error?.statusCode;
  
  if (message.includes('timeout') || message.includes('ETIMEDOUT')) {
    return { type: 'timeout', retryable: true, message: 'Request timed out' };
  }
  
  if (message.includes('rate limit') || status === 429) {
    return { type: 'rate_limit', retryable: true, message: 'Rate limit exceeded' };
  }
  
  if (message.includes('unauthorized') || status === 401) {
    return { type: 'auth', retryable: false, message: 'Authentication failed' };
  }
  
  if (status >= 500) {
    return { type: 'server', retryable: true, message: 'Server error' };
  }
  
  if (message.includes('network') || message.includes('fetch')) {
    return { type: 'network', retryable: true, message: 'Network error' };
  }
  
  return { type: 'unknown', retryable: false, message: message };
}
