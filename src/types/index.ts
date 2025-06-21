export type Plan = 'FREE' | 'PRO' | 'PREMIUM';

export interface User {
  id: string;
  walletAddress: string;
  email?: string;
  credits: number;
  plan: Plan;
  subscriptionExpiry?: string;
  lastCreditReset?: string;
  renewalReminded?: boolean;
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
  description: string;
  type: 'website' | 'component' | 'app';
  files: ProjectFile[];
  createdAt: Date;
  updatedAt: Date;
  teamId?: string;
};

export interface Team {
  id: string;
  name: string;
  plan: Plan;
  members: TeamMember[];
  credits: number;
  subscriptionExpiry?: string;
  lastCreditReset?: string;
  renewalReminded?: boolean;
  inviteCode: string;
  createdAt: Date;
}

export interface TeamMember {
  walletAddress: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface ProjectFile {
  id: string;
  name: string;
  content: string;
  type: 'html' | 'css' | 'js' | 'ts' | 'jsx' | 'tsx' | 'json' | 'md';
  status: 'pending' | 'generating' | 'completed' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionStatus {
  isExpired: boolean;
  daysUntilExpiry: number;
  needsRenewal: boolean;
  showRenewalReminder: boolean;
}

// New types for file change management
export interface FileChange {
  id: string;
  filePath: string;
  originalContent: string;
  modifiedContent: string;
  changeType: 'created' | 'modified' | 'deleted';
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: Date;
  description?: string;
}

export interface FileDiff {
  additions: number;
  deletions: number;
  chunks: DiffChunk[];
}

export interface DiffChunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

export interface DiffLine {
  type: 'add' | 'remove' | 'normal';
  content: string;
  lineNumber?: number;
}

export interface ChangeSession {
  id: string;
  changes: FileChange[];
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
} 