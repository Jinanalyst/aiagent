"use client"

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { WorkspacePanel } from '@/components/project/WorkspacePanel';
import { ChatPanel } from '@/components/project/ChatPanel';
import { useUser } from '@/hooks/useUser';
import { useProjects } from '@/hooks/useProjects';
import { UpgradeModal } from '@/components/user/UpgradeModal';
import { ProfileSidebar } from "@/components/ui/profile-sidebar";

interface FilePlan {
    path: string;
    content: string;
}

interface ProjectPlan {
    name: string;
    files: FilePlan[];
}

interface GeneratorWorkspaceProps {
    prompt?: string;
    initialProject?: {
        name: string;
        files: FilePlan[];
    };
}

export function GeneratorWorkspace({ prompt: initialPrompt, initialProject }: GeneratorWorkspaceProps) {
    const { user, deductCredits } = useUser();
    const { addProject } = useProjects();
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const effectRan = useRef(false);

    const createPlan = useCallback(async (prompt: string) => {
        if (!user) return;

        setIsGenerating(true);
        
        try {
            // Simulate AI planning
            const plan: ProjectPlan = {
                name: `Project for "${prompt.substring(0, 40)}..."`,
                files: [
                    {
                        path: 'index.html',
                        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${prompt}</title>
</head>
<body>
    <h1>Generated from: ${prompt}</h1>
</body>
</html>`
                    }
                ]
            };

            // Add project to the projects list
            addProject({
                id: `project-${Date.now()}`,
                name: plan.name,
                description: prompt,
                type: 'website',
                files: plan.files.map(file => ({
                    id: `file-${Date.now()}-${Math.random()}`,
                    name: file.path,
                    content: file.content,
                    type: file.path.endsWith('.html') ? 'html' as const : 'js' as const,
                    status: 'completed' as const,
                    createdAt: new Date(),
                    updatedAt: new Date()
                })),
                createdAt: new Date(),
                updatedAt: new Date()
            });

        } catch (error: unknown) {
            console.error('Generation failed:', error);
        } finally {
            setIsGenerating(false);
        }
    }, [user, addProject]);

    const handleGenerate = useCallback(async () => {
        if (!user) {
            setUpgradeModalOpen(true);
            return;
        }

        // Check if user has enough credits
        const creditsNeeded = 1;
        if (!deductCredits(creditsNeeded)) {
            setUpgradeModalOpen(true);
            return;
        }
        
        if (initialPrompt) {
            createPlan(initialPrompt);
        }
    }, [user, deductCredits, initialPrompt, createPlan]);
    
    useEffect(() => {
        if (effectRan.current === false) {
            if (initialPrompt && !initialProject) {
                handleGenerate();
            }
        }
        
        return () => {
            effectRan.current = true;
        }
    }, [initialPrompt, initialProject, handleGenerate]);

    if (isGenerating) {
        return (
            <div className="flex h-screen bg-gray-50">
                <div className="flex-1 flex items-center justify-center">
                    <Card className="w-96">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Generating Your Project</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-sm text-gray-600">Creating your project...</div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full transition-all duration-300 w-3/4" />
                            </div>
                            <div className="text-xs text-gray-500">75% complete</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <>
            <ProfileSidebar />
            <div className="flex h-screen bg-gray-50">
                <div className="flex-1 flex">
                    <div className="flex-1 border-r border-gray-200 min-h-0">
                        <WorkspacePanel />
                    </div>
                    <div className="w-96 min-h-0">
                        <ChatPanel />
                    </div>
                </div>
            </div>
            <UpgradeModal 
                isOpen={upgradeModalOpen} 
                onClose={() => setUpgradeModalOpen(false)} 
            />
        </>
    );
} 