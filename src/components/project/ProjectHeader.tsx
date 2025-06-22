"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Download, ArrowLeft, RotateCcw, ExternalLink, Rocket, Users, Eye, Code2, Globe } from 'lucide-react';
import { DeploymentModal } from "./DeploymentModal";

interface ProjectHeaderProps {
  projectName?: string;
  isPreviewMode?: boolean;
  onTogglePreview?: () => void;
  onRefresh?: () => void;
  onOpenInNewTab?: () => void;
  previewUrl?: string;
  projectFiles?: Record<string, string>;
  onDownload?: () => void;
  onRetry?: () => void;
  onDeploy?: (platform: string) => void;
  isDeploying?: boolean;
  deploymentStatus?: string;
}

export function ProjectHeader({ 
  projectName = "Untitled Project",
  isPreviewMode = false,
  onTogglePreview,
  onRefresh,
  onOpenInNewTab,
  previewUrl,
  projectFiles = {},
  onDownload,
  onRetry,
  onDeploy,
  isDeploying,
  deploymentStatus
}: ProjectHeaderProps) {
  const router = useRouter();
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  const handleOpenInNewTab = () => {
    if (onOpenInNewTab) {
      onOpenInNewTab();
    } else if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Left side - Navigation */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="h-8 w-8 p-0"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <div className="h-6 w-px bg-border mx-2" />

            {/* Code/Preview Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={!isPreviewMode ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onTogglePreview && onTogglePreview()}
                className="h-7 px-3 text-xs"
              >
                <Code2 className="h-3 w-3 mr-1" />
                Code
              </Button>
              <Button
                variant={isPreviewMode ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onTogglePreview && onTogglePreview()}
                className="h-7 px-3 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Button>
            </div>
          </div>

          {/* Center - Project Name */}
          <div className="flex-1 flex justify-center">
            <h1 className="text-sm font-medium text-muted-foreground truncate max-w-xs">
              {projectName}
            </h1>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenInNewTab}
              className="h-8 px-3 text-xs"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs"
            >
              <Users className="h-3 w-3 mr-1" />
              Invite
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => setIsDeployModalOpen(true)}
              className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700"
            >
              <Rocket className="h-3 w-3 mr-1" />
              Publish
            </Button>
          </div>
        </div>
      </header>

      <DeploymentModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        projectName={projectName}
        projectFiles={projectFiles}
      />
    </>
  );
} 