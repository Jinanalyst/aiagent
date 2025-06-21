"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export type Plan = 'FREE' | 'PRO' | 'PREMIUM';

export interface User {
  walletAddress: string;
  plan: Plan;
  credits: number;
  subscriptionExpiry?: string;
  lastCreditReset?: string;
  renewalReminded?: boolean;
}

export interface SubscriptionStatus {
  isExpired: boolean;
  daysUntilExpiry: number;
  needsRenewal: boolean;
  showRenewalReminder: boolean;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  subscriptionStatus: SubscriptionStatus | null;
  deductCredits: (amount: number) => boolean;
  upgradePlan: (plan: Plan) => void;
  setUser: (user: User | null) => void;
  renewSubscription: (plan: Plan) => void;
  dismissRenewalReminder: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Helper function to get subscription status
const getSubscriptionStatus = (user: User | null): SubscriptionStatus | null => {
  if (!user || user.plan === 'FREE') return null;
  
  const now = new Date();
  const expiry = user.subscriptionExpiry ? new Date(user.subscriptionExpiry) : null;
  
  if (!expiry) return null;
  
  const timeDiff = expiry.getTime() - now.getTime();
  const daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  return {
    isExpired: daysUntilExpiry < 0,
    daysUntilExpiry: Math.max(0, daysUntilExpiry),
    needsRenewal: daysUntilExpiry <= 7, // Show renewal notice 7 days before expiry
    showRenewalReminder: daysUntilExpiry <= 7 && !user.renewalReminded
  };
};

// Helper function to reset credits based on plan
const getCreditAllocation = (plan: Plan): number => {
  switch (plan) {
    case 'FREE': return 5;
    case 'PRO': return 100;
    case 'PREMIUM': return 99999; // Effectively unlimited
    default: return 5;
  }
};

// Helper function to check if credits need reset
const shouldResetCredits = (user: User): boolean => {
  if (user.plan === 'FREE') return false; // Free plan doesn't reset
  
  const now = new Date();
  const lastReset = user.lastCreditReset ? new Date(user.lastCreditReset) : null;
  
  if (!lastReset) return true; // First time, needs reset
  
  // Check if a month has passed since last reset
  const monthsSinceReset = (now.getFullYear() - lastReset.getFullYear()) * 12 + 
                          (now.getMonth() - lastReset.getMonth());
  
  return monthsSinceReset >= 1;
};

export const UserProvider = ({ children, walletPublicKey }: { children: ReactNode, walletPublicKey: string | null }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

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
            subscriptionExpiry: undefined,
            lastCreditReset: undefined,
            renewalReminded: false
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
        } else {
          // Check if subscription has expired and downgrade if necessary
          const status = getSubscriptionStatus(currentUser);
          if (status?.isExpired && currentUser.plan !== 'FREE') {
            console.log('Subscription expired, downgrading to FREE plan');
            currentUser.plan = 'FREE';
            currentUser.credits = 5;
                         currentUser.subscriptionExpiry = undefined;
             currentUser.lastCreditReset = undefined;
            currentUser.renewalReminded = false;
            
            storedUsers[walletAddress] = currentUser;
            localStorage.setItem('users', JSON.stringify(storedUsers));
          }
          
          // Check if credits need to be reset for active subscriptions
          if (currentUser.plan !== 'FREE' && !status?.isExpired && shouldResetCredits(currentUser)) {
            console.log('Resetting monthly credits');
            currentUser.credits = getCreditAllocation(currentUser.plan);
            currentUser.lastCreditReset = new Date().toISOString();
            currentUser.renewalReminded = false; // Reset reminder flag on credit reset
            
            storedUsers[walletAddress] = currentUser;
            localStorage.setItem('users', JSON.stringify(storedUsers));
          }
        }
        
        setUser(currentUser);
        setSubscriptionStatus(getSubscriptionStatus(currentUser));
      } else {
        setUser(null);
        setSubscriptionStatus(null);
      }
      setLoading(false);
    };

    syncUser();
  }, [walletPublicKey]);

  // Update subscription status when user changes
  useEffect(() => {
    setSubscriptionStatus(getSubscriptionStatus(user));
  }, [user]);

  const handleSetUser = (updatedUser: User | null) => {
     setUser(updatedUser);
     if (updatedUser) {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
        storedUsers[updatedUser.walletAddress] = updatedUser;
        localStorage.setItem('users', JSON.stringify(storedUsers));
     }
  }

  const deductCredits = (amount: number): boolean => {
    if (!user) return false;
    
    // Check if subscription is expired for paid plans
    const status = getSubscriptionStatus(user);
    if (status?.isExpired && user.plan !== 'FREE') {
      console.log('Cannot use credits - subscription expired');
      return false;
    }
    
    if (user.plan === 'FREE' && user.credits >= amount) {
      const newCredits = user.credits - amount;
      const updatedUser = { ...user, credits: newCredits };
      handleSetUser(updatedUser);
      return true;
    }
    
    if (user.plan !== 'FREE' && !status?.isExpired) {
      // For paid plans with active subscriptions
      if (user.plan === 'PREMIUM') {
        // Premium has unlimited credits
        return true;
      } else if (user.plan === 'PRO' && user.credits >= amount) {
        const newCredits = user.credits - amount;
        const updatedUser = { ...user, credits: newCredits };
        handleSetUser(updatedUser);
        return true;
      }
    }
    
    return false;
  };

  const upgradePlan = (newPlan: Plan) => {
    if (user) {
        const now = new Date();
        let subscriptionExpiry: string | undefined = undefined;
        let lastCreditReset: string | undefined = undefined;
        
        // Set subscription expiry for paid plans (30 days from now)
        if (newPlan !== 'FREE') {
          const expiryDate = new Date(now);
          expiryDate.setDate(expiryDate.getDate() + 30);
          subscriptionExpiry = expiryDate.toISOString();
          lastCreditReset = now.toISOString();
        }
        
        let newCredits = getCreditAllocation(newPlan);
        
        // Handle referral bonuses for Pro upgrades
        if (newPlan === 'PRO') {
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
                referralStats.freeReferrals = Math.max(0, referralStats.freeReferrals - 1);
                localStorage.setItem(`referrals_${referrerWalletAddress}`, JSON.stringify(referralStats));
                
                console.log(`Pro upgrade bonus awarded! Referrer got 50 additional tokens`);
              }
            }
        }
        
        const updatedUser = { 
          ...user, 
          plan: newPlan, 
          credits: newCredits,
          subscriptionExpiry,
          lastCreditReset,
          renewalReminded: false
        };
        handleSetUser(updatedUser);
    }
  };

  const renewSubscription = (plan: Plan) => {
    if (user && plan !== 'FREE') {
      const now = new Date();
      const expiryDate = new Date(now);
      expiryDate.setDate(expiryDate.getDate() + 30);
      
      const updatedUser = {
        ...user,
        plan,
        credits: getCreditAllocation(plan),
        subscriptionExpiry: expiryDate.toISOString(),
        lastCreditReset: now.toISOString(),
        renewalReminded: false
      };
      
      handleSetUser(updatedUser);
      console.log(`Subscription renewed for 30 days`);
    }
  };

  const dismissRenewalReminder = () => {
    if (user) {
      const updatedUser = {
        ...user,
        renewalReminded: true
      };
      handleSetUser(updatedUser);
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser: handleSetUser, 
      loading, 
      subscriptionStatus,
      deductCredits, 
      upgradePlan,
      renewSubscription,
      dismissRenewalReminder
    }}>
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