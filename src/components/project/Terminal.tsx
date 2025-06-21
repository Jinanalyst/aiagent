"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TerminalProps {
  logs: string[];
  onClear?: () => void;
}

export function Terminal({ logs, onClear }: TerminalProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="bg-gray-900 text-white hover:bg-gray-800"
        >
          Show Terminal ({logs.length} logs)
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-green-400 font-mono">
      <div className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700">
        <span className="text-sm font-medium">Terminal</span>
        <div className="flex items-center space-x-2">
          {onClear && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-gray-400 hover:text-white h-6 px-2"
            >
              Clear
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="text-gray-400 hover:text-white h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-sm">
            No logs yet. Terminal output will appear here.
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="text-sm whitespace-pre-wrap">
                {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 