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

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { publicKey } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncUser = () => {
      setLoading(true);
      if (publicKey) {
        const walletAddress = publicKey.toBase58();
        const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
        let currentUser = storedUsers[walletAddress];

        if (!currentUser) {
          // Create a new user if one doesn't exist
          currentUser = {
            walletAddress: walletAddress,
            plan: 'FREE',
            credits: 5,
          };
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
  }, [publicKey]);

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