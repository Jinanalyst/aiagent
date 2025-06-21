"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, User, Users, CreditCard, FlaskConical, Link as LinkIcon, GitBranch, X, HelpCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface WorkspaceSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const navItems = [
    { name: "Workspace", icon: User },
    { name: "People", icon: Users },
    { name: "Plans & Billing", icon: CreditCard },
    { name: "Account", icon: User },
    { name: "Labs", icon: FlaskConical },
    { name: "Integrations", icon: LinkIcon },
]

export function WorkspaceSettingsModal({ open, onOpenChange }: WorkspaceSettingsModalProps) {
  const [activeTab, setActiveTab] = useState("Workspace");
  const [workspaceName, setWorkspaceName] = useState("진진우's Lovable");
  const [workspaceDescription, setWorkspaceDescription] = useState("");

  const handleSave = () => {
    // Here you would typically call an API to save the changes
    console.log("Saving workspace settings:", { workspaceName, workspaceDescription });
    onOpenChange(false); // Close modal on save
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[85vh] p-0 bg-gray-900 text-gray-50 border-gray-800">
        <div className="flex h-full">
            <div className="w-64 flex-shrink-0 border-r border-gray-800 p-4 flex flex-col justify-between">
                <div>
                    <div className="flex items-center space-x-2 mb-6">
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" alt="Workspace" />
                            <AvatarFallback>JL</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold text-white">{workspaceName}</p>
                        </div>
                    </div>
                    <nav className="flex flex-col space-y-1">
                        {navItems.map(item => (
                            <Button key={item.name} variant={activeTab === item.name ? "secondary" : "ghost"} className="justify-start text-white focus:bg-gray-800 focus:text-white hover:bg-gray-800" onClick={() => setActiveTab(item.name)}>
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.name}
                            </Button>
                        ))}
                    </nav>
                </div>
                <div className="border-t border-gray-800 pt-4">
                     <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                        <GitBranch className="mr-2 h-4 w-4" />
                        GitHub
                        <Badge variant="secondary" className="ml-auto bg-gray-700 text-gray-300">Connected</Badge>
                     </Button>
                      <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 122.66 122.88" fill="currentColor"><path d="M61.33,0a61.34,61.34,0,0,0-4.59,122.09,61.33,61.33,0,1,0,4.59-122.09ZM46.61,86.68H33.49V57.83H46.61ZM39.9,51.1a7,7,0,1,1,7-7,7,7,0,0,1-7,7Zm52.7,35.58H79.48V72.3c0-3.42-.06-7.82-4.76-7.82s-5.5,4.5-5.5,7.58v14.62H56.09V57.83H68.82v5.7h.17c1.73-3.27,6-6.69,12.44-6.69,13.31,0,15.76,8.76,15.76,20.14Z"/></svg>
                        Supabase
                        <Badge variant="secondary" className="ml-auto bg-gray-700 text-gray-300">Connected</Badge>
                     </Button>
                </div>
            </div>
            <div className="flex-grow p-6 overflow-y-auto min-h-0">
                <DialogHeader className="flex flex-row justify-between items-start">
                    <div>
                        <DialogTitle className="text-2xl text-white">Workspace Settings</DialogTitle>
                        <div className="flex items-center text-sm text-gray-400">
                            Workspaces allow you to collaborate on projects in real time.
                            <a href="#" className="ml-2 flex items-center text-blue-400 hover:underline">
                                <HelpCircle className="h-4 w-4 mr-1" />
                                Docs
                            </a>
                        </div>
                    </div>
                     <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="absolute top-4 right-4 text-gray-400 hover:bg-gray-800">
                        <X className="h-4 w-4" />
                    </Button>
                </DialogHeader>

                {activeTab === 'Workspace' && (
                    <div className="mt-6 space-y-6">
                        <div>
                            <h3 className="text-lg font-medium text-white">Workspace Avatar</h3>
                            <p className="text-sm text-gray-400">Set an avatar for your workspace.</p>
                            <div className="mt-2 flex items-center space-x-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src="https://github.com/shadcn.png" />
                                    <AvatarFallback>JL</AvatarFallback>
                                </Avatar>
                                <Button variant="outline" className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"><Upload className="h-4 w-4 mr-2"/> Upload</Button>
                            </div>
                        </div>

                         <div>
                            <label htmlFor="workspace-name" className="text-lg font-medium text-white">Workspace Name</label>
                            <p className="text-sm text-gray-400">Your full workspace name, as visible to others.</p>
                            <Input id="workspace-name" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} className="mt-2 bg-gray-800 border-gray-700 text-white"/>
                        </div>

                        <div>
                            <label htmlFor="workspace-description" className="text-lg font-medium text-white">Workspace Description</label>
                            <p className="text-sm text-gray-400">A short description about your workspace or team.</p>
                            <Textarea id="workspace-description" value={workspaceDescription} onChange={(e) => setWorkspaceDescription(e.target.value)} placeholder="Description" className="mt-2 bg-gray-800 border-gray-700 text-white" />
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
                        </DialogFooter>
                    </div>
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 