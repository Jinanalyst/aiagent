"use client"

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, Globe, Github, Zap, Loader2, CheckCircle, XCircle } from "lucide-react";

interface DeploymentModalProps {
  onDeploy: (platform: string) => Promise<void>;
  isDeploying: boolean;
  deploymentStatus: string;
  children: React.ReactNode;
}

const deploymentOptions = [
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Deploy to Vercel (recommended for Next.js)',
    icon: Rocket,
    color: 'bg-black text-white',
    features: ['Automatic builds', 'Global CDN', 'Preview deployments']
  },
  {
    id: 'netlify',
    name: 'Netlify',
    description: 'Deploy to Netlify with form handling',
    icon: Globe,
    color: 'bg-green-600 text-white',
    features: ['Form handling', 'Serverless functions', 'Branch deployments']
  },
  {
    id: 'railway',
    name: 'Railway',
    description: 'Deploy to Railway with database support',
    icon: Zap,
    color: 'bg-blue-600 text-white',
    features: ['Database support', 'Custom domains', 'Environment variables']
  },
  {
    id: 'github',
    name: 'GitHub Pages',
    description: 'Deploy to GitHub Pages (static sites)',
    icon: Github,
    color: 'bg-gray-800 text-white',
    features: ['Free hosting', 'Custom domains', 'Git integration']
  }
];

export function DeploymentModal({ onDeploy, isDeploying, deploymentStatus, children }: DeploymentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [deploymentResult, setDeploymentResult] = useState<{ success: boolean; url?: string; message?: string } | null>(null);

  const handleDeploy = async (platform: string) => {
    setSelectedPlatform(platform);
    setDeploymentResult(null);
    try {
      await onDeploy(platform);
      // Keep modal open to show success status
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedPlatform(null);
    setDeploymentResult(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Deploy Your Project
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isDeploying ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium">Deploying to {selectedPlatform}...</p>
              <p className="text-sm text-gray-500 mt-2">{deploymentStatus}</p>
              <div className="mt-4 text-xs text-gray-400">
                This may take 2-5 minutes for the first deployment
              </div>
            </div>
          ) : deploymentResult?.success ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-green-600">Deployment Successful!</p>
              <p className="text-sm text-gray-600 mt-2">{deploymentResult.message}</p>
              {deploymentResult.url && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">Your app is live at:</p>
                  <a 
                    href={deploymentResult.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 break-all"
                  >
                    {deploymentResult.url}
                  </a>
                </div>
              )}
              <Button onClick={handleClose} className="mt-4">
                Close
              </Button>
            </div>
          ) : (
            <>
              <p className="text-gray-600">
                Choose your preferred deployment platform. Each platform has different features and requirements.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deploymentOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedPlatform === option.id ? 'ring-2 ring-blue-500' : 'hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPlatform(option.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${option.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{option.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                          <div className="mt-3 space-y-1">
                            {option.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2 text-xs text-gray-500">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={() => selectedPlatform && handleDeploy(selectedPlatform)}
                  disabled={!selectedPlatform}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Deploy to {selectedPlatform ? deploymentOptions.find(o => o.id === selectedPlatform)?.name : 'Platform'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 