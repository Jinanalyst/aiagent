"use client"

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ExternalLink, CheckCircle } from "lucide-react";

interface DeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectFiles: Record<string, string>;
  projectName: string;
}

export function DeploymentModal({ isOpen, onClose, projectFiles, projectName }: DeploymentModalProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentUrl, setDeploymentUrl] = useState<string>('');
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');

  const platforms = [
    { value: 'vercel', label: 'Vercel', description: 'Fast and easy deployment' },
    { value: 'netlify', label: 'Netlify', description: 'Static site hosting' },
    { value: 'railway', label: 'Railway', description: 'Full-stack deployment' },
    { value: 'github', label: 'GitHub Pages', description: 'Free static hosting' }
  ];

  const handleDeploy = async () => {
    if (!selectedPlatform) return;

    setIsDeploying(true);
    setDeploymentStatus('deploying');

    try {
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileSystem: projectFiles,
          projectName,
          platform: selectedPlatform
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setDeploymentUrl(data.deploymentUrl);
        setDeploymentStatus('success');
      } else {
        setDeploymentStatus('error');
        console.error('Deployment failed:', data.error);
      }
    } catch {
      setDeploymentStatus('error');
    } finally {
      setIsDeploying(false);
    }
  };

  const resetModal = () => {
    setSelectedPlatform('');
    setDeploymentStatus('idle');
    setDeploymentUrl('');
    setIsDeploying(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deploy Project</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {deploymentStatus === 'idle' && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Choose Platform</label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select deployment platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        <div>
                          <div className="font-medium">{platform.label}</div>
                          <div className="text-xs text-gray-500">{platform.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleDeploy} disabled={!selectedPlatform || isDeploying}>
                  {isDeploying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    'Deploy'
                  )}
                </Button>
              </div>
            </>
          )}
          
          {deploymentStatus === 'deploying' && (
            <div className="text-center py-8">
              <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4" />
              <p className="text-sm text-gray-600">Deploying your project...</p>
            </div>
          )}
          
          {deploymentStatus === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-4" />
              <p className="text-sm text-gray-600 mb-4">Project deployed successfully!</p>
              {deploymentUrl && (
                <Button onClick={() => window.open(deploymentUrl, '_blank')}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Live Site
                </Button>
              )}
            </div>
          )}
          
          {deploymentStatus === 'error' && (
            <div className="text-center py-8">
              <p className="text-sm text-red-600 mb-4">Deployment failed. Please try again.</p>
              <Button onClick={() => setDeploymentStatus('idle')}>
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 