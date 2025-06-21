import React, { ReactElement } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { File, Folder } from "lucide-react";

interface FileExplorerProps {
    files: string[];
    onFileSelect: (path: string) => void;
    activeFile: string | null;
}

interface FileNode {
    [key: string]: FileNode | null;
}

const buildFileTree = (paths: string[]): FileNode => {
    const tree: FileNode = {};
    if (!Array.isArray(paths)) {
        console.error("FileExplorer received non-array files prop:", paths);
        return tree;
    }
    paths.filter(path => typeof path === 'string' && path).forEach(path => {
        // Ensure path starts with a slash for consistent splitting
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        const parts = cleanPath.split('/');
        let currentNode = tree;
        parts.forEach((part, index) => {
            if (index === parts.length - 1) {
                currentNode[part] = null; // Mark as file
            } else {
                if (!currentNode[part]) {
                    currentNode[part] = {}; // Create directory
                }
                currentNode = currentNode[part] as FileNode;
            }
        });
    });
    return tree;
}

const renderTree = (node: FileNode, onFileSelect: (path: string) => void, activeFile: string | null, currentPath: string = ''): ReactElement[] => {
    return Object.entries(node).map(([name, children]) => {
        const path = currentPath ? `${currentPath}/${name}` : name;
        if (children) { // It's a directory
            return (
                <AccordionItem value={path} key={path}>
                    <AccordionTrigger className="py-1 text-sm">
                         <div className="flex items-center space-x-2">
                            <Folder className="h-4 w-4" />
                            <span>{name}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-4">
                        <Accordion type="multiple" className="w-full">
                           {renderTree(children, onFileSelect, activeFile, path)}
                        </Accordion>
                    </AccordionContent>
                </AccordionItem>
            );
        } else { // It's a file
            return (
                 <div key={path} 
                    className={`flex items-center space-x-2 py-1 cursor-pointer rounded-md px-2 ${activeFile === `/${path}` ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                    onClick={() => onFileSelect(`/${path}`)}>
                    <File className="h-4 w-4" />
                    <span>{name}</span>
                </div>
            );
        }
    });
}


export function FileExplorer({ files, onFileSelect, activeFile }: FileExplorerProps) {
  const fileTree = buildFileTree(files);
  return (
    <div className="p-2 text-sm h-full overflow-y-auto">
        <Accordion type="multiple" defaultValue={['src', 'src/app']} className="w-full">
           {renderTree(fileTree, onFileSelect, activeFile)}
        </Accordion>
    </div>
  )
} 