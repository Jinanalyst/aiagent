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
    code: string;
    setCode: (code: string) => void;
    logs: string[];
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

export function WorkspacePanel({ files, activeFile, onFileSelect, code, setCode, logs }: WorkspacePanelProps) {
    
    const fileSystemForPreview = files.reduce((acc, file) => {
        acc[file.path] = file.content;
        return acc;
    }, {} as { [key: string]: string });

    const handlePreviewStatusUpdate = (status: string) => {
        // For now, we'll just log this to the console.
        // In the future, we could add it to the agent log.
        console.log(`[Preview]: ${status}`);
    };

    return (
        <div className="h-full flex flex-col bg-white">
           <Tabs defaultValue="code" className="flex-1 flex flex-col">
                <div className="px-4 border-b">
                     <TabsList>
                        <TabsTrigger value="code">Code</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="code" className="flex-1 flex flex-col overflow-y-auto">
                    <ResizablePanelGroup direction="vertical">
                        <ResizablePanel defaultSize={70}>
                           <ResizablePanelGroup direction="horizontal">
                                <ResizablePanel defaultSize={30} minSize={20}>
                                    <FileExplorer files={files} onFileSelect={onFileSelect} activeFile={activeFile} />
                                </ResizablePanel>
                                <ResizableHandle withHandle />
                                <ResizablePanel defaultSize={70}>
                                    <CodeEditor code={code} setCode={setCode} />
                                </ResizablePanel>
                           </ResizablePanelGroup>
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={30}>
                           <Terminal logs={logs} />
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </TabsContent>
                <TabsContent value="preview" className="flex-1 bg-gray-50 p-4">
                   {files.length > 0 ? (
                     <PreviewPanel
                       fileSystem={fileSystemForPreview}
                       onStatusUpdate={handlePreviewStatusUpdate}
                     />
                   ) : (
                     <div className="flex items-center justify-center h-full text-gray-500">
                       No files generated yet to preview.
                     </div>
                   )}
                </TabsContent>
            </Tabs>
        </div>
    );
} 