"use client"

import { useState, useEffect } from "react";
import JSZip from "jszip";
import { saveAs } from 'file-saver';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ProjectHeader } from "@/components/project/ProjectHeader";
import { ChatPanel } from "@/components/project/ChatPanel";
import { WorkspacePanel } from "@/components/project/WorkspacePanel";
import { useUser } from "@/hooks/useUser";
import { UpgradeModal } from "../user/UpgradeModal";
import { retryWithBackoff, classifyError } from "@/lib/utils";
import { GeneratedFile, Project } from "@/types";
import { Message } from "ai/react";
import { useProjects } from "@/hooks/useProjects";

interface GeneratorWorkspaceProps {
    prompt?: string;
    model?: string;
    initialProject?: Project;
}

interface FilePlan {
    path: string;
    description: string;
    dependencies?: string[];
}

interface ProjectPlan {
    project_name: string;
    files: FilePlan[];
}

export function GeneratorWorkspace({ prompt: initialPrompt, model, initialProject }: GeneratorWorkspaceProps) {
    const { user, deductCredits } = useUser();
    const { addProject } = useProjects();
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [projectName, setProjectName] = useState("New AI Project");
    const [files, setFiles] = useState<GeneratedFile[]>([]);
    const [activeFile, setActiveFile] = useState<GeneratedFile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const [generationStatus, setGenerationStatus] = useState<string>('Ready');
    const [lastFailedAttempt, setLastFailedAttempt] = useState<{ prompt: string; plan: any } | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [isDeploying, setIsDeploying] = useState(false);
    const [deploymentStatus, setDeploymentStatus] = useState('');
    const [logs, setLogs] =useState<string[]>([]);
    const [activeCode, setActiveCode] = useState<string>('');


    useEffect(() => {
        if(initialProject) {
            setProjectName(initialProject.name);
            setFiles(initialProject.files);
            setMessages([{id: 'project-loaded', role: 'assistant', content: `Loaded project: ${initialProject.name}`}]);
        } else if (initialPrompt) {
            setProjectName(`Project for "${initialPrompt.substring(0, 40)}..."`);
        }
    }, [initialProject, initialPrompt]);

    useEffect(() => {
        if (projectName) {
            document.title = projectName;
        }
    }, [projectName]);

    useEffect(() => {
        if (activeFile) {
            setActiveCode(activeFile.content);
        } else {
            const firstFile = files.find(f => f.content);
            if(firstFile) {
                setActiveFile(firstFile);
                setActiveCode(firstFile.content)
            } else {
                 setActiveCode('// Select a file to view its code');
            }
        }
    }, [activeFile, files]);

    const addLog = (message: string, type: 'INFO' | 'ERROR' | 'SUCCESS' | 'PLAN' = 'INFO') => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prevLogs => [...prevLogs, `[${timestamp}] [${type}] ${message}`]);
    };

    const getErrorFromResponse = async (response: Response) => {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            return {
                message: errorData.error || 'API Error',
                status: response.status,
                type: errorData.type,
                retryable: errorData.retryable,
                requiresAuth: errorData.requiresAuth,
            };
        } else {
            const textError = await response.text();
            const titleMatch = textError.match(/<title>(.*?)<\/title>/i);
            const bodyMatch = textError.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            let detailedMessage = textError.substring(0, 200); // Fallback
            if (titleMatch) {
                detailedMessage = titleMatch[1];
            } else if (bodyMatch) {
                detailedMessage = bodyMatch[1].replace(/<[^>]+>/g, '').trim().substring(0, 200);
            }

            return {
                message: `Server returned a non-JSON response: ${detailedMessage}...`,
                status: response.status,
                type: 'server_error',
                retryable: response.status >= 500,
                requiresAuth: false,
            };
        }
    };

    const createPlan = async (prompt: string) => {
        setIsLoading(true);
        addLog(`Starting new project generation for prompt: "${prompt}"`, 'INFO');
        
        try {
            addLog('Requesting project plan from AI architect...', 'INFO');
            const response = await retryWithBackoff(async () => {
                const res = await fetch("/api/agent/create-project", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt }),
                });

                if (!res.ok) {
                    const errorInfo = await getErrorFromResponse(res);
                    const error = new Error(errorInfo.message);
                    (error as any).status = errorInfo.status;
                    (error as any).type = errorInfo.type;
                    (error as any).retryable = errorInfo.retryable;
                    throw error;
                }

                return res;
            }, 3, 1000);

            const result = await response.json();
            
            if (!result.plan) {
                throw new Error('No project plan received');
            }
            
            const plan: ProjectPlan = result.plan;
            setProjectName(plan.project_name || "AI Project");
            addLog(`Received plan for "${plan.project_name}".`, 'SUCCESS');

            const initialFiles: GeneratedFile[] = plan.files.map(file => ({
                path: file.path,
                content: `// Status: Queued\n// Task: ${file.description}`,
                status: 'pending',
            }));
            setFiles(initialFiles);
            
            const planMessages: Message[] = [
                { id: 'plan-start', role: 'assistant', content: "Ok, I've created a plan. Here's what I'll do:" },
                ...plan.files.map((file: FilePlan, index) => ({
                    id: `plan-file-${index}`,
                    role: 'assistant' as const,
                    content: `Create ${file.path}: ${file.description}`
                }))
            ];
            setMessages(prev => [...prev, ...planMessages]);
            
            plan.files.forEach(file => {
                addLog(`File planned: ${file.path} - ${file.description}`, 'PLAN');
            });

            await executePlan(plan);
            
        } catch (error) {
            console.error("Failed to generate plan:", error);
            
            const errorInfo = classifyError(error);
            let errorMessage = "Sorry, I couldn't create a plan for that.";
            
            if (errorInfo.type === 'auth') {
                errorMessage = "OpenAI API key is invalid or missing. Please check your configuration in .env.local file.";
            } else if (errorInfo.retryable) {
                errorMessage = `Temporary error: ${errorInfo.message}. Please try again.`;
            } else {
                errorMessage = `Error: ${errorInfo.message}`;
            }
            
            setMessages(prev => [
                ...prev, 
                { id: 'error-plan', role: 'assistant', content: errorMessage },
                { id: 'error-tip', role: 'assistant', content: "💡 Tip: You can test your OpenAI API configuration by visiting /api/test-openai" }
            ]);
            addLog(errorMessage, 'ERROR');
        } finally {
            setIsLoading(false);
        }
    };

    const executePlan = async (plan: ProjectPlan) => {
        setMessages(prev => [...prev, { id: 'build-start', role: 'assistant', content: "Alright, starting the build..."}]);

        for (const file of plan.files) {
            setFiles(prev => prev.map(f => f.path === file.path ? { ...f, status: 'generating' } : f));
            addLog(`Generating ${file.path}...`, 'INFO');
            setMessages(prev => [...prev, { id: `generating-${file.path}`, role: 'assistant', content: `Generating ${file.path}...`}]);
            
            try {
                const dependencyContents: { [key: string]: string } = {};
                if (file.dependencies) {
                    file.dependencies.forEach((depPath: string) => {
                        const depFile = files.find(f => f.path === depPath);
                        if (depFile) {
                            dependencyContents[depPath] = depFile.content;
                        }
                    });
                }

                const response = await fetch("/api/agent/generate-file", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        fileDescription: file.description,
                        filePath: file.path,
                        dependencies: dependencyContents,
                        projectPrompt: initialPrompt,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Failed to generate ${file.path}`);
                }
                const result = await response.json();
                
                setFiles(prev => 
                    prev.map(f => f.path === file.path ? { ...f, content: result.fileContent, status: 'completed' } : f)
                );
                
                addLog(`Successfully generated ${file.path}`, 'SUCCESS');

            } catch (error) {
                console.error(`Error generating file ${file.path}:`, error);
                addLog(`Error generating file ${file.path}: ${(error as Error).message}`, 'ERROR');
                setFiles(prev => prev.map(f => f.path === file.path ? { ...f, status: 'error' } : f));
                setMessages(prev => [...prev, { id: `error-${file.path}`, role: 'assistant', content: `Sorry, I had trouble creating ${file.path}. I'll continue with the next file.`}]);
            }
        }
        setMessages(prev => [...prev, { id: 'build-complete', role: 'assistant', content: "Build complete! You can view the files and preview the application."}]);
        setIsLoading(false);

        // Save the project to localStorage
        try {
            const savedProject = addProject({ name: projectName, files });
            addLog(`Project "${savedProject.name}" saved successfully with ID: ${savedProject.id}`, 'SUCCESS');
        } catch (error) {
            addLog(`Error saving project: ${(error as Error).message}`, 'ERROR');
            console.error("Error saving project:", error);
        }
    };

    const handleSend = async (chatInput: string) => {
        if (!chatInput.trim()) return;

        setMessages(prev => [...prev, { id: `user-${Date.now()}`, role: 'user', content: chatInput }]);
        addLog(`User prompt: "${chatInput}"`, 'INFO');
        
        setTimeout(() => {
            setMessages(prev => [...prev, { id: `ai-response-${Date.now()}`, role: 'assistant', content: "Thanks for the feedback! I'm currently focused on the initial build. Follow-up instructions will be enabled in a future version."}]);
        }, 1000);
    };

    const handleDownload = () => {
        addLog('Preparing project for download...', 'INFO');
        const zip = new JSZip();
        files.forEach(file => {
            zip.file(file.path, file.content);
        });
        zip.generateAsync({ type: "blob" })
            .then(function (content) {
                saveAs(content, `${projectName.replace(/ /g, '_')}.zip`);
                addLog('Project downloaded successfully.', 'SUCCESS');
            });
    };

    const handleGenerate = async (prompt: string) => {
        if (!user) {
            setUpgradeModalOpen(true);
            return;
        }

        const cost = 10; 
        const canAfford = deductCredits(cost);
        if (!canAfford) {
            setUpgradeModalOpen(true);
            return;
        }
        
        setProjectName(`Project for "${prompt.substring(0, 40)}..."`);
        setMessages([{ id: 'user-prompt', role: 'user', content: prompt, createdAt: new Date() }]);
        createPlan(prompt);
    };
    
    const handleRetry = async () => {
        addLog('Retrying last failed operation...', 'INFO');
        if(initialPrompt) createPlan(initialPrompt);
    };

    const handleDeploy = async (platform: string) => {
        setIsDeploying(true);
        setDeploymentStatus(`Deploying to ${platform}...`);
        addLog(`Deployment started for ${platform}`, 'INFO');

        const filesToDeploy = files.reduce((acc, file) => {
            acc[file.path] = file.content;
            return acc;
        }, {} as { [key: string]: string });

        const response = await fetch('/api/deploy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                platform,
                files: filesToDeploy,
                projectName,
            }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            setDeploymentStatus(`Deployment failed: ${errorData.error}`);
            addLog(`Deployment failed: ${errorData.error}`, 'ERROR');
            setIsDeploying(false);
            return;
        }

        const result = await response.json();
        setDeploymentStatus(result.message);
        addLog(result.message, 'SUCCESS');
        setIsDeploying(false);
    };
    
    const setCodeForActiveFile = (newCode: string) => {
        setActiveCode(newCode);
        if (activeFile) {
            setFiles(files.map(file => 
                file.path === activeFile.path ? { ...file, content: newCode } : file
            ));
        }
    };

    useEffect(() => {
        if (initialPrompt && !initialProject) {
            handleGenerate(initialPrompt);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialPrompt, initialProject]);


    return (
        <div className="flex flex-col h-screen bg-white text-black">
             <ProjectHeader 
                projectName={projectName}
                onDownload={handleDownload}
                onRetry={handleRetry}
                onDeploy={handleDeploy}
                isDeploying={isDeploying}
                deploymentStatus={deploymentStatus}
            />
            <ResizablePanelGroup direction="horizontal" className="flex-1">
                <ResizablePanel defaultSize={40} minSize={20}>
                    <ChatPanel
                        messages={messages}
                        onSend={handleSend}
                        isLoading={isLoading}
                        logs={logs}
                    />
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={60} minSize={30}>
                    <WorkspacePanel 
                        files={files}
                        activeFile={activeFile}
                        onFileSelect={setActiveFile}
                        code={activeCode}
                        setCode={setCodeForActiveFile}
                        logs={logs}
                    />
                </ResizablePanel>
            </ResizablePanelGroup>
            {isUpgradeModalOpen && (
                <UpgradeModal
                    isOpen={isUpgradeModalOpen}
                    onClose={() => setUpgradeModalOpen(false)}
                />
            )}
        </div>
    );
} 