"use client";

import React, { useState, useEffect } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { FileExplorer } from "./FileExplorer";
import { CodeEditor } from "./CodeEditor";
import { GeneratedFile } from "@/types";
import { File, Folder, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PreviewPanel } from "./PreviewPanel";

interface WorkspacePanelProps {
    files: GeneratedFile[];
    activeFile: GeneratedFile | null;
    onFileSelect: (file: GeneratedFile) => void;
    onCodeChange: (newCode: string) => void;
    activeCode: string;
}

const getFileIcon = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'js':
        case 'jsx':
            return '📄';
        case 'ts':
        case 'tsx':
            return '🔷';
        case 'css':
            return '🎨';
        case 'html':
            return '🌐';
        case 'json':
            return '📋';
        case 'md':
            return '📝';
        default:
            return '📄';
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'pending':
            return <Clock className="h-3 w-3 text-yellow-500" />;
        case 'generating':
            return <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />;
        case 'completed':
            return <CheckCircle className="h-3 w-3 text-green-500" />;
        case 'error':
            return <AlertCircle className="h-3 w-3 text-red-500" />;
        default:
            return <Clock className="h-3 w-3 text-gray-400" />;
    }
};

const getStatusText = (status: string) => {
    switch (status) {
        case 'pending':
            return 'Queued';
        case 'generating':
            return 'Generating...';
        case 'completed':
            return 'Complete';
        case 'error':
            return 'Error';
        default:
            return 'Unknown';
    }
};

export function WorkspacePanel({ files, activeFile, onFileSelect, onCodeChange, activeCode }: WorkspacePanelProps) {
    const [tab, setTab] = useState('code');
    
    // Group files by directory
    const fileTree = React.useMemo(() => {
        const tree: { [key: string]: GeneratedFile[] } = {};
        const rootFiles: GeneratedFile[] = [];
        
        files.forEach(file => {
            const parts = file.path.split('/');
            if (parts.length > 1) {
                const dir = parts[0];
                if (!tree[dir]) tree[dir] = [];
                tree[dir].push(file);
            } else {
                rootFiles.push(file);
            }
        });
        
        return { tree, rootFiles };
    }, [files]);

    // Create file system for preview
    const fileSystemForPreview = React.useMemo(() => {
        return files.reduce((acc, file) => {
            if (file.status === 'completed') {
                acc[file.path] = file.content;
            }
            return acc;
        }, {} as { [key: string]: string });
    }, [files]);

    const handlePreviewStatusUpdate = (status: string) => {
        console.log(`[Preview]: ${status}`);
    };

    const renderFileTree = () => {
        const { tree, rootFiles } = fileTree;
        
        return (
            <div className="p-3 space-y-1">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Files</h3>
                    <span className="text-xs text-gray-500">{files.length} files</span>
                </div>
                
                {/* Root files */}
                {rootFiles.map(file => (
                    <div
                        key={file.path}
                        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                            activeFile?.path === file.path 
                                ? 'bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-700' 
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => onFileSelect(file)}
                    >
                        <span className="text-sm">{getFileIcon(file.path)}</span>
                        <span className="text-sm flex-1 truncate">{file.path}</span>
                        <div className="flex items-center gap-1">
                            {getStatusIcon(file.status)}
                            <span className="text-xs text-gray-500">{getStatusText(file.status)}</span>
                        </div>
                    </div>
                ))}
                
                {/* Directory files */}
                {Object.entries(tree).map(([dir, dirFiles]) => (
                    <div key={dir} className="space-y-1">
                        <div className="flex items-center gap-2 p-2 font-medium text-gray-700 dark:text-gray-300">
                            <Folder className="h-4 w-4" />
                            <span className="text-sm">{dir}/</span>
                            <span className="text-xs text-gray-500 ml-auto">{dirFiles.length}</span>
                        </div>
                        <div className="ml-4 space-y-1">
                            {dirFiles.map(file => (
                                <div
                                    key={file.path}
                                    className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                                        activeFile?.path === file.path 
                                            ? 'bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-700' 
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                    onClick={() => onFileSelect(file)}
                                >
                                    <span className="text-sm">{getFileIcon(file.path)}</span>
                                    <span className="text-sm flex-1 truncate">{file.path.split('/').pop()}</span>
                                    <div className="flex items-center gap-1">
                                        {getStatusIcon(file.status)}
                                        <span className="text-xs text-gray-500">{getStatusText(file.status)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                
                {files.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <File className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No files generated yet</p>
                        <p className="text-xs">Start a conversation to generate files</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
            {/* Tab Header */}
            <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center h-12 px-4">
                    <button 
                        onClick={() => setTab('code')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            tab === 'code' 
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                        Code
                    </button>
                    <button 
                        onClick={() => setTab('preview')}
                        className={`ml-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                            tab === 'preview' 
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                        Preview
                    </button>
                    
                    {/* File generation progress */}
                    <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
                        {files.filter(f => f.status === 'generating').length > 0 && (
                            <>
                                <Loader2 className="h-3 w-3 animate-spin" />
                                <span>Generating files...</span>
                            </>
                        )}
                        {files.filter(f => f.status === 'completed').length > 0 && (
                            <span>{files.filter(f => f.status === 'completed').length}/{files.length} complete</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0">
                {tab === 'code' && (
                    <ResizablePanelGroup direction="horizontal" className="h-full">
                        {/* File Explorer */}
                        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
                            <div className="h-full overflow-y-auto border-r border-gray-200 dark:border-gray-700">
                                {renderFileTree()}
                            </div>
                        </ResizablePanel>
                        
                        <ResizableHandle withHandle />
                        
                        {/* Code Editor */}
                        <ResizablePanel defaultSize={70}>
                            <div className="h-full flex flex-col">
                                {activeFile ? (
                                    <>
                                        {/* File Header */}
                                        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                            <div className="flex items-center gap-2">
                                                <span>{getFileIcon(activeFile.path)}</span>
                                                <span className="text-sm font-medium">{activeFile.path}</span>
                                                {getStatusIcon(activeFile.status)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">{getStatusText(activeFile.status)}</span>
                                                {activeFile.status === 'completed' && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => navigator.clipboard.writeText(activeFile.content)}
                                                    >
                                                        Copy
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Editor */}
                                        <div className="flex-1">
                                            <CodeEditor code={activeCode} setCode={onCodeChange} />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        <div className="text-center">
                                            <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                            <p className="text-lg font-medium mb-2">No file selected</p>
                                            <p className="text-sm">Choose a file from the explorer to view its code</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                )}
                
                {tab === 'preview' && (
                    <div className="h-full">
                        {Object.keys(fileSystemForPreview).length > 0 ? (
                            <PreviewPanel
                                fileSystem={fileSystemForPreview}
                                onStatusUpdate={handlePreviewStatusUpdate}
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium mb-2">No files to preview</p>
                                    <p className="text-sm">Generate some files to see the website preview</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
} 