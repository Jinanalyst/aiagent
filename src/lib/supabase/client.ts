import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Database schema types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          wallet_address: string;
          email: string | null;
          credits: number;
          plan: 'free' | 'pro' | 'premium';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet_address: string;
          email?: string | null;
          credits?: number;
          plan?: 'free' | 'pro' | 'premium';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          wallet_address?: string;
          email?: string | null;
          credits?: number;
          plan?: 'free' | 'pro' | 'premium';
          created_at?: string;
          updated_at?: string;
        };
      };
      credit_transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'purchase' | 'usage' | 'refund';
          amount: number;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'purchase' | 'usage' | 'refund';
          amount: number;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'purchase' | 'usage' | 'refund';
          amount?: number;
          description?: string;
          created_at?: string;
        };
      };
      ai_generations: {
        Row: {
          id: string;
          user_id: string;
          prompt: string;
          output: string;
          type: 'html' | 'css' | 'js' | 'react';
          credits_used: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt: string;
          output: string;
          type: 'html' | 'css' | 'js' | 'react';
          credits_used: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          prompt?: string;
          output?: string;
          type?: 'html' | 'css' | 'js' | 'react';
          credits_used?: number;
          created_at?: string;
        };
      };
    };
  };
} 