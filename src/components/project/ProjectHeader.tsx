"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Upload, Zap, Rocket, Lock, GitBranch, CreditCard, Database, Download, Bolt, RefreshCw } from "lucide-react"
import Link from "next/link"
import { DeploymentModal } from "./DeploymentModal"

interface ProjectHeaderProps {
  projectName: string;
  onDownload: () => void;
  onRetry: () => void;
  onDeploy: (platform: string) => Promise<void>;
  isDeploying: boolean;
  deploymentStatus: string;
}

export function ProjectHeader({ projectName, onDownload, onRetry, onDeploy, isDeploying, deploymentStatus }: ProjectHeaderProps) {
  return (
    <header className="flex items-center justify-between h-16 px-6 border-b bg-white">
      <div className="flex items-center gap-4">
        <Link href="/generate" className="text-gray-500 hover:text-gray-700">
          <ChevronDown className="h-5 w-5 rotate-90" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold">{projectName}</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={onRetry} title="Retry Generation">
            <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Database className="h-4 w-4" />
          <span>AI Generated</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Export
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDownload}>
                <Download className="h-4 w-4 mr-2" />
                <span>Download</span>
            </DropdownMenuItem>
            <DeploymentModal 
              onDeploy={onDeploy}
              isDeploying={isDeploying}
              deploymentStatus={deploymentStatus}
            >
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Rocket className="h-4 w-4 mr-2" />
                  <span>Deploy</span>
              </DropdownMenuItem>
            </DeploymentModal>
            <DropdownMenuItem>
                <Bolt className="h-4 w-4 mr-2" />
                <span>Open in StackBlitz</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <GitBranch className="h-4 w-4 mr-2" />
            Git
          </Button>
          <Button variant="ghost" size="sm">
            <CreditCard className="h-4 w-4 mr-2" />
            Billing
          </Button>
        </div>
      </div>
    </header>
  )
} 