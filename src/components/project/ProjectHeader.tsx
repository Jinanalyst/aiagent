"use client"

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Download } from 'lucide-react';

interface ProjectHeaderProps {
  projectName: string;
  onDownload?: () => void;
  onRetry?: () => void;
  onDeploy?: (platform: string) => void;
  isDeploying?: boolean;
  deploymentStatus?: string;
}

export function ProjectHeader({ 
  projectName, 
  onDownload, 
  onRetry, 
  onDeploy, 
  isDeploying, 
  deploymentStatus 
}: ProjectHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {projectName}
        </h1>
        {deploymentStatus && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {deploymentStatus}
          </span>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {onDownload && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDownload}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onRetry && (
              <DropdownMenuItem onClick={onRetry}>
                Retry Generation
              </DropdownMenuItem>
            )}
            {onDeploy && (
              <>
                <DropdownMenuItem 
                  onClick={() => onDeploy('netlify')}
                  disabled={isDeploying}
                >
                  Deploy to Netlify
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDeploy('vercel')}
                  disabled={isDeploying}
                >
                  Deploy to Vercel
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 