"use client";

import { useState } from 'react';
import { CheckCircle, File, Folder } from 'lucide-react';
import { Button } from '../ui/button';

interface FileSystem {
    [path: string]: string;
}

interface PreviewPanelProps {
    fileSystem: FileSystem;
    onStatusUpdate: (status: string) => void;
}

export function PreviewPanel({ fileSystem, onStatusUpdate }: PreviewPanelProps) {
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    const files = Object.entries(fileSystem);

    const renderFileTree = () => {
        const folders: { [key: string]: string[] } = {};
        const rootFiles: string[] = [];

        files.forEach(([path]) => {
            const parts = path.split('/');
            if (parts.length > 1) {
                const folder = parts[0];
                if (!folders[folder]) folders[folder] = [];
                folders[folder].push(path);
            } else {
                rootFiles.push(path);
            }
        });

        return (
            <div className="space-y-2">
                {rootFiles.map(file => (
                    <div
                        key={file}
                        className={`flex items-center gap-2 p-2 cursor-pointer rounded ${
                            selectedFile === file ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => setSelectedFile(file)}
                    >
                        <File className="h-4 w-4" />
                        <span className="text-sm">{file}</span>
                    </div>
                ))}
                {Object.entries(folders).map(([folder, folderFiles]) => (
                    <div key={folder} className="space-y-1">
                        <div className="flex items-center gap-2 p-2 font-medium">
                            <Folder className="h-4 w-4" />
                            <span className="text-sm">{folder}/</span>
                        </div>
                        <div className="ml-6 space-y-1">
                            {folderFiles.map(file => (
                                <div
                                    key={file}
                                    className={`flex items-center gap-2 p-2 cursor-pointer rounded ${
                                        selectedFile === file ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                                    onClick={() => setSelectedFile(file)}
                                >
                                    <File className="h-4 w-4" />
                                    <span className="text-sm">{file.split('/').pop()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="h-full w-full flex bg-gray-50 dark:bg-gray-900">
            {/* File Tree */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
                <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Project Files</span>
                </div>
                {files.length > 0 ? renderFileTree() : (
                    <p className="text-sm text-gray-500">No files generated yet</p>
                )}
            </div>

            {/* File Content */}
            <div className="flex-1 p-4 overflow-y-auto">
                {selectedFile ? (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium">{selectedFile}</h3>
                            <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => navigator.clipboard.writeText(fileSystem[selectedFile])}
                            >
                                Copy Code
                            </Button>
                        </div>
                        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
                            <code>{fileSystem[selectedFile]}</code>
                        </pre>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Select a file to view its content</p>
                    </div>
                )}
            </div>
        </div>
    );
} 