"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, User, Users, CreditCard, FlaskConical, Link as LinkIcon, GitBranch, HelpCircle, LogOut } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useWallet } from "@solana/wallet-adapter-react";
import { Project } from "@/types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const navItems = [
    { name: "Workspace", icon: User },
    { name: "People", icon: Users },
    { name: "Plans & Billing", icon: CreditCard },
    { name: "Account", icon: User },
    { name: "Labs", icon: FlaskConical },
    { name: "Integrations", icon: LinkIcon },
];

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { projects, updateProject, activeProjectId } = useProjects();
  const { disconnect } = useWallet();

  const [activeTab, setActiveTab] = useState("Workspace");
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  
  const activeProject = projects.find(p => p.id === activeProjectId);

  useEffect(() => {
    if (activeProject) {
      setWorkspaceName(activeProject.name);
      setWorkspaceDescription(activeProject.description || "");
    }
  }, [activeProjectId, projects, activeProject]);

  useEffect(() => {
    if (activeTab === "Plans & Billing") {
      router.push('/pricing');
    }
  }, [activeTab, router]);

  const handleSave = () => {
    if (activeProjectId) {
      updateProject(activeProjectId, { name: workspaceName, description: workspaceDescription });
      alert("Workspace settings saved!");
    }
  };

  const handleLabFeatureChange = (feature: 'githubBranchSwitching' | 'newMobileLayout', value: boolean) => {
    if (activeProjectId && activeProject) {
      const updatedLabs = { ...activeProject.labs, [feature]: value };
      updateProject(activeProjectId, { labs: updatedLabs });
    }
  };
  
  const handleDisconnect = (integration: 'github' | 'supabase') => {
      if(activeProjectId && activeProject) {
          const currentIntegrations = { ...activeProject.integrations };
          delete currentIntegrations[integration];
          updateProject(activeProjectId, { integrations: currentIntegrations });
      }
  }

  const handleLogout = () => {
    disconnect();
    router.push('/');
  };
  
  const renderContent = () => {
    switch(activeTab) {
      case "Workspace":
        return (
          <div>
            <header className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold">Workspace Settings</h1>
                <p className="text-gray-500 mt-1">Workspaces allow you to collaborate on projects in real time.</p>
              </div>
              <a href="#" className="flex items-center text-blue-500 hover:underline">
                  <HelpCircle className="h-5 w-5 mr-1" />
                  Docs
              </a>
            </header>
            <section className="space-y-10">
              <div>
                <h2 className="text-xl font-semibold">Workspace Avatar</h2>
                <p className="text-gray-500 mt-1">Set an avatar for your workspace.</p>
                <div className="mt-4 flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>JL</AvatarFallback>
                  </Avatar>
                  <Button variant="outline"><Upload className="h-4 w-4 mr-2"/> Upload</Button>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Workspace Name</h2>
                <p className="text-gray-500 mt-1">Your full workspace name, as visible to others.</p>
                <Input id="workspace-name" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} className="mt-2 max-w-md"/>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Workspace Description</h2>
                <p className="text-gray-500 mt-1">A short description about your workspace or team.</p>
                <Textarea id="workspace-description" value={workspaceDescription} onChange={(e) => setWorkspaceDescription(e.target.value)} placeholder="Description" className="mt-2 max-w-md"/>
              </div>
            </section>
            <footer className="mt-10 pt-6 border-t">
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
            </footer>
          </div>
        );
      case "People":
        return <div><h1 className="text-3xl font-bold">People</h1><p className="text-gray-500 mt-1">Manage who has access to this workspace.</p></div>;
      case "Plans & Billing":
        return <div><h1 className="text-3xl font-bold">Redirecting to Billing...</h1></div>;
      case "Account":
        return (
            <div>
                <h1 className="text-3xl font-bold">Account</h1>
                <p className="text-gray-500 mt-1">Manage your account settings.</p>
                <div className="mt-8">
                    <Button variant="destructive" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /> Disconnect Wallet</Button>
                </div>
            </div>
        );
      case "Labs":
        return (
          <div>
            <header className="flex justify-between items-center mb-4 pb-4 border-b">
                <div>
                    <h1 className="text-2xl font-semibold">Labs</h1>
                    <p className="text-gray-500 mt-1">
                        These are experimental features, that might be modified or removed.
                    </p>
                </div>
                <a href="#" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                    <HelpCircle className="h-4 w-4 mr-1.5" />
                    Docs
                </a>
            </header>
            <div className="divide-y divide-gray-200">
                <div className="py-6 flex items-center justify-between">
                    <div>
                        <Label htmlFor="github-branch-switching" className="text-lg font-medium text-gray-900">GitHub Branch Switching</Label>
                        <p className="text-sm text-gray-500 mt-1">Select the branch to make edits to in your GitHub repository.</p>
                    </div>
                    <Switch
                        id="github-branch-switching"
                        checked={activeProject?.labs?.githubBranchSwitching || false}
                        onCheckedChange={(value) => handleLabFeatureChange('githubBranchSwitching', value)}
                    />
                </div>
                <div className="py-6 flex items-center justify-between">
                    <div>
                        <Label htmlFor="new-mobile-layout" className="text-lg font-medium text-gray-900">New Mobile Layout</Label>
                        <p className="text-sm text-gray-500 mt-1">
                            Enable a new & improved mobile layout. Have feedback? Let us know on <a href="#" className="text-blue-500 hover:underline">Slack</a>.
                        </p>
                    </div>
                    <Switch
                        id="new-mobile-layout"
                        checked={activeProject?.labs?.newMobileLayout || false}
                        onCheckedChange={(value) => handleLabFeatureChange('newMobileLayout', value)}
                    />
                </div>
            </div>
          </div>
        );
      case "Integrations":
        return (
            <div>
              <h1 className="text-3xl font-bold">Integrations</h1>
              <p className="text-gray-500 mt-1">Connect your workspace to third-party services.</p>
              <div className="mt-8 space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                          <GitBranch className="h-6 w-6 mr-4" />
                          <div>
                              <h3 className="font-semibold">GitHub</h3>
                              <p className="text-sm text-gray-500">Sync your code with GitHub repositories.</p>
                          </div>
                      </div>
                      <a href="https://github.com/settings/applications" target="_blank" rel="noopener noreferrer">
                        <Button>Connect</Button>
                      </a>
                  </div>
                   <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                          <svg className="h-6 w-6 mr-4" viewBox="0 0 122.66 122.88" fill="currentColor"><path d="M61.33,0a61.34,61.34,0,0,0-4.59,122.09,61.33,61.33,0,1,0,4.59-122.09ZM46.61,86.68H33.49V57.83H46.61ZM39.9,51.1a7,7,0,1,1,7-7,7,7,0,0,1-7,7Zm52.7,35.58H79.48V72.3c0-3.42-.06-7.82-4.76-7.82s-5.5,4.5-5.5,7.58v14.62H56.09V57.83H68.82v5.7h.17c1.73-3.27,6-6.69,12.44-6.69,13.31,0,15.76,8.76,15.76,20.14Z"/></svg>
                          <div>
                              <h3 className="font-semibold">Supabase</h3>
                              <p className="text-sm text-gray-500">Connect your Supabase project.</p>
                          </div>
                      </div>
                      <a href="https://supabase.com/docs/guides/api/finding-your-api-keys" target="_blank" rel="noopener noreferrer">
                        <Button>Connect</Button>
                      </a>
                  </div>
              </div>
            </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navigation />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 p-6 bg-white border-r">
          <div className="flex items-center space-x-3 mb-8">
            <Avatar className="h-10 w-10">
              <AvatarImage src="https://github.com/shadcn.png" alt="Workspace" />
              <AvatarFallback>JL</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{activeProject?.name}</p>
            </div>
          </div>
          <nav className="flex flex-col space-y-2">
            {navItems.map(item => (
              <Button 
                key={item.name} 
                variant={activeTab === item.name ? "secondary" : "ghost"} 
                className="justify-start text-base"
                onClick={() => setActiveTab(item.name)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-10 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}