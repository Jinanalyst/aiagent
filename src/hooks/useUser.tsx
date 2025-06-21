"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export type Plan = 'FREE' | 'PRO' | 'PREMIUM';

export interface User {
  walletAddress: string;
  plan: Plan;
  credits: number;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  deductCredits: (amount: number) => boolean;
  upgradePlan: (plan: Plan) => void;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children, walletPublicKey }: { children: ReactNode, walletPublicKey: string | null }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncUser = () => {
      setLoading(true);
      if (walletPublicKey) {
        const walletAddress = walletPublicKey;
        const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
        let currentUser = storedUsers[walletAddress];
        let isNewUser = false;

        if (!currentUser) {
          // Create a new user if one doesn't exist
          isNewUser = true;
          currentUser = {
            walletAddress: walletAddress,
            plan: 'FREE',
            credits: 5,
          };
          
          // Check for referral and award tokens
          const referralId = localStorage.getItem('referralId');
          if (referralId) {
            // Find the referrer user
            const referrerWalletAddress = Object.keys(storedUsers).find(addr => 
              addr.slice(-8) === referralId
            );
            
            if (referrerWalletAddress && storedUsers[referrerWalletAddress]) {
              // Award 10 tokens to both new user and referrer
              currentUser.credits += 10;
              storedUsers[referrerWalletAddress].credits += 10;
              
              // Store referral history for future Pro upgrade bonus
              localStorage.setItem(`referral_history_${walletAddress}`, referrerWalletAddress);
              
              // Update referral stats
              const referralStats = JSON.parse(localStorage.getItem(`referrals_${referrerWalletAddress}`) || '{"tokensEarned": 0, "freeReferrals": 0, "proReferrals": 0}');
              referralStats.tokensEarned += 10;
              referralStats.freeReferrals += 1;
              localStorage.setItem(`referrals_${referrerWalletAddress}`, JSON.stringify(referralStats));
              
              console.log(`Referral bonus awarded! New user and referrer each got 10 tokens`);
            }
            
            // Clear the referral ID
            localStorage.removeItem('referralId');
          }
          
          storedUsers[walletAddress] = currentUser;
          localStorage.setItem('users', JSON.stringify(storedUsers));
        }
        
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    syncUser();
  }, [walletPublicKey]);

  const handleSetUser = (updatedUser: User | null) => {
     setUser(updatedUser);
     if (updatedUser) {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
        storedUsers[updatedUser.walletAddress] = updatedUser;
        localStorage.setItem('users', JSON.stringify(storedUsers));
     }
  }

  const deductCredits = (amount: number): boolean => {
    if (user && user.plan === 'FREE' && user.credits >= amount) {
      const newCredits = user.credits - amount;
      const updatedUser = { ...user, credits: newCredits };
      handleSetUser(updatedUser);
      return true;
    }
    if (user && user.plan !== 'FREE') {
        // For paid plans, we assume the backend handles credits.
        // For this client-side mock, we'll just allow it.
        return true;
    }
    return false;
  };

  const upgradePlan = (newPlan: Plan) => {
    if (user) {
        let newCredits = user.credits;
        if (newPlan === 'PRO') {
            newCredits = 100;
            
            // Check if this user was referred and award bonus to referrer
            const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
            const referralHistory = localStorage.getItem(`referral_history_${user.walletAddress}`);
            
            if (referralHistory) {
              const referrerWalletAddress = referralHistory;
              if (storedUsers[referrerWalletAddress]) {
                // Award 50 bonus tokens to referrer
                storedUsers[referrerWalletAddress].credits += 50;
                localStorage.setItem('users', JSON.stringify(storedUsers));
                
                // Update referral stats
                const referralStats = JSON.parse(localStorage.getItem(`referrals_${referrerWalletAddress}`) || '{"tokensEarned": 0, "freeReferrals": 0, "proReferrals": 0}');
                referralStats.tokensEarned += 50;
                referralStats.proReferrals += 1;
                referralStats.freeReferrals = Math.max(0, referralStats.freeReferrals - 1); // Move from free to pro
                localStorage.setItem(`referrals_${referrerWalletAddress}`, JSON.stringify(referralStats));
                
                console.log(`Pro upgrade bonus awarded! Referrer got 50 additional tokens`);
              }
            }
        } else if (newPlan === 'PREMIUM') {
            newCredits = 99999; // Effectively unlimited
        }
        const updatedUser = { ...user, plan: newPlan, credits: newCredits };
        handleSetUser(updatedUser);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser: handleSetUser, loading, deductCredits, upgradePlan }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 