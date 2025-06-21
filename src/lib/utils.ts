import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Error classification helper
export function classifyError(error: unknown): {
  message: string;
  type: 'auth' | 'network' | 'validation' | 'unknown';
  retryable: boolean;
} {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('unauthorized') || message.includes('invalid api key')) {
      return { message: error.message, type: 'auth', retryable: false };
    }
    
    if (message.includes('network') || message.includes('timeout')) {
      return { message: error.message, type: 'network', retryable: true };
    }
    
    if (message.includes('validation') || message.includes('invalid')) {
      return { message: error.message, type: 'validation', retryable: false };
    }
    
    return { message: error.message, type: 'unknown', retryable: true };
  }
  
  return { message: 'An unknown error occurred', type: 'unknown', retryable: true };
}

// Retry with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
