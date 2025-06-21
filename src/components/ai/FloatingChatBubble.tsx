"use client";

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowUp } from 'lucide-react';
import { LandingPageChat } from './LandingPageChat';

export function FloatingChatBubble() {
  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="lg"
            className="rounded-full h-16 w-16 bg-gray-800/80 dark:bg-white/80 text-white dark:text-black hover:bg-gray-700 dark:hover:bg-gray-200 backdrop-blur-md shadow-lg"
          >
            Ask Lovable...
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0 border-none shadow-2xl mr-4" side="top" align="end">
          <LandingPageChat />
        </PopoverContent>
      </Popover>
    </div>
  );
} 