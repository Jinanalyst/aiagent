export interface User {
  id: string;
  walletAddress: string;
  email?: string;
  credits: number;
  plan: 'free' | 'pro' | 'premium';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'purchase' | 'usage' | 'refund';
  amount: number;
  description: string;
  createdAt: Date;
}

export interface AIGeneration {
  id: string;
  userId: string;
  prompt: string;
  output: string;
  type: 'html' | 'css' | 'js' | 'react';
  creditsUsed: number;
  createdAt: Date;
}

export interface GenerationRequest {
  prompt: string;
  type: 'html' | 'css' | 'js' | 'react';
  userId: string;
}

export interface GenerationResponse {
  success: boolean;
  output?: string;
  error?: string;
  creditsRemaining: number;
}

export interface WalletConnection {
  publicKey: string;
  connected: boolean;
  connecting: boolean;
}

export interface PricingPlan {
  id: string;
  name: 'free' | 'pro' | 'premium';
  price: number;
  credits: number;
  features: string[];
  popular?: boolean;
}

export type GeneratedFile = {
  path: string;
  content: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
};

export type Project = {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  files: GeneratedFile[];
  integrations?: {
    github?: {
      username: string;
      repo: string;
    },
    supabase?: {
      projectUrl: string;
      anonKey: string;
    }
  },
  labs?: {
    githubBranchSwitching?: boolean;
    newMobileLayout?: boolean;
  }
}; 