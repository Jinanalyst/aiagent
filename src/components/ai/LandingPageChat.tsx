"use client";

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, ArrowUp } from 'lucide-react';
import { WalletConnect } from '../wallet/WalletConnect';
import Link from 'next/link';

// Mock icons for Workspace and Supabase
const WorkspaceIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.5 4.5L8 2L12.5 4.5V11.5L8 14L3.5 11.5V4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 7.5L3.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 7.5L12.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 7.5V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SupabaseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.235 2.189L1.353 9.02a2.818 2.818 0 00-.334 4.026l7.03 8.789a2.818 2.818 0 004.298-.03l9.28-11.23a2.818 2.818 0 00-2.48-4.385H12.235z" fill="currentColor"></path>
    </svg>
);

export function LandingPageChat() {
  const [prompt, setPrompt] = useState('');
  const [showWalletConnect, setShowWalletConnect] = useState(false);

  return (
    <div className="relative w-full max-w-2xl">
      <div className="bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-xl shadow-lg border border-black/10 dark:border-white/10">
        <Textarea
          placeholder="Ask Lovable to create a blog a..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full bg-transparent border-none rounded-xl p-4 min-h-[56px] resize-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
        />
        <div className="flex items-center justify-between p-2">
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10">
                    <Plus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" className="text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10">
                    <WorkspaceIcon />
                    <span className="ml-2">Workspace</span>
                </Button>
                <Button variant="ghost" className="text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10">
                    <SupabaseIcon />
                    <span className="ml-2">Supabase</span>
                </Button>
            </div>
          <Button size="icon" disabled={!prompt.trim()} className="bg-primary hover:bg-primary/90 rounded-full">
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="h-14">
        {showWalletConnect ? (
          <WalletConnect />
        ) : (
          <Button
            size="lg"
            className="bg-white text-black border-2 border-gray-200 hover:bg-gray-100 hover:text-black"
            onClick={() => setShowWalletConnect(true)}
          >
            Start Building for Free
          </Button>
        )}
      </div>
    </div>
  );
} 