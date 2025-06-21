"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { FileExplorer } from "./FileExplorer";
import { Terminal } from "./Terminal";
import { Bot } from "lucide-react";
import { CodeEditor } from "./CodeEditor";
import { LiveProvider, LivePreview, LiveError } from 'react-live';
import React from "react";
import { PreviewPanel } from "./PreviewPanel";
import { GeneratedFile } from "@/types";

interface LogEntry {
    timestamp: string;
    message: string;
    type: 'INFO' | 'ERROR' | 'SUCCESS' | 'PLAN';
}

interface WorkspacePanelProps {
    files: GeneratedFile[];
    activeFile: GeneratedFile | null;
    onFileSelect: (file: GeneratedFile) => void;
    onCodeChange: (newCode: string) => void;
    activeCode: string;
}

// Mock code to display in the editor
const mockGeneratedCode = `
import React from 'react';

const HeroSection = () => {
  return (
    <div className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl font-bold mb-4">Build Your Next Idea</h1>
        <p className="text-xl mb-8">The ultimate toolkit for developers.</p>
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded">
          Get Started
        </button>
      </div>
    </div>
  );
};

export default HeroSection;
`.trim();

export function WorkspacePanel({ files, activeFile, onFileSelect, onCodeChange, activeCode }: WorkspacePanelProps) {
    const [tab, setTab] = React.useState('code');
    
    const fileSystemForPreview = files.reduce((acc, file) => {
        if (file.status === 'completed') {
            acc[file.path] = file.content;
        }
        return acc;
    }, {} as { [key: string]: string });

    const handlePreviewStatusUpdate = (status: string) => {
        console.log(`[Preview]: ${status}`);
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-850">
            <div className="flex-shrink-0 border-b dark:border-gray-700">
                <div className="flex items-center h-12 px-4">
                    <button 
                        onClick={() => setTab('code')}
                        className={`px-3 py-1 text-sm rounded-md ${tab === 'code' ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        Code
                    </button>
                    <button 
                        onClick={() => setTab('preview')}
                        className={`ml-2 px-3 py-1 text-sm rounded-md ${tab === 'preview' ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        Preview
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                {tab === 'code' && (
                    <ResizablePanelGroup direction="horizontal" className="h-full">
                        <ResizablePanel defaultSize={20} minSize={15}>
                            <FileExplorer 
                                files={files.map(f => f.path)} 
                                onFileSelect={(path) => {
                                    const file = files.find(f => f.path === path);
                                    if(file) onFileSelect(file);
                                }} 
                                activeFile={activeFile ? activeFile.path : null} 
                            />
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={80}>
                           <CodeEditor code={activeCode} setCode={onCodeChange} />
                        </ResizablePanel>
                    </ResizablePanelGroup>
                )}
                {tab === 'preview' && (
                     files.length > 0 && Object.keys(fileSystemForPreview).length > 0 ? (
                        <PreviewPanel
                          fileSystem={fileSystemForPreview}
                          onStatusUpdate={handlePreviewStatusUpdate}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          No completed files available to preview.
                        </div>
                      )
                )}
            </div>
        </div>
    );
} 