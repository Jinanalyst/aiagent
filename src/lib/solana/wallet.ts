import { Connection, clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

// Solana network configuration
export const SOLANA_NETWORK = WalletAdapterNetwork.Devnet;
export const SOLANA_RPC_URL = clusterApiUrl(SOLANA_NETWORK);

// Create connection to Solana network
export const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// Credit pricing in SOL (adjust as needed)
export const CREDIT_PRICES = {
  free: 0,
  pro: 0.1, // 0.1 SOL for Pro plan
  premium: 0.25, // 0.25 SOL for Premium plan
  credits_10: 0.05, // 0.05 SOL for 10 credits
  credits_50: 0.2, // 0.2 SOL for 50 credits
  credits_100: 0.35, // 0.35 SOL for 100 credits
};

// Credit limits per plan
export const CREDIT_LIMITS = {
  free: 10,
  pro: -1, // Unlimited
  premium: -1, // Unlimited
};

// Credit usage per generation
export const CREDIT_USAGE = {
  html: 1,
  css: 1,
  js: 2,
  react: 3,
};

export interface WalletConfig {
  network: WalletAdapterNetwork;
  rpcUrl: string;
  commitment: 'processed' | 'confirmed' | 'finalized';
}

export const walletConfig: WalletConfig = {
  network: SOLANA_NETWORK,
  rpcUrl: SOLANA_RPC_URL,
  commitment: 'confirmed',
}; 