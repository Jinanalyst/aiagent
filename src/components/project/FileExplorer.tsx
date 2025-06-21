"use client";

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';

interface FileExplorerProps {
  files: Array<{
    id: string;
    path: string;
    content: string;
    status?: string;
  }>;
  onFileSelect: (file: { path: string; content: string }) => void;
  activeFile?: string | null;
}

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
}

export function FileExplorer({ files, onFileSelect, activeFile }: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['.']));

  // Build file tree structure
  const buildFileTree = (files: Array<{ path: string; content: string }>) => {
    const root: FileNode = { name: '', path: '', type: 'folder', children: [] };
    
    files.forEach(file => {
      // Skip files with undefined or empty paths
      if (!file.path || typeof file.path !== 'string') {
        return;
      }
      
      const parts = file.path.split('/').filter(part => part);
      let current = root;
      
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isFile = i === parts.length - 1;
        const currentPath = parts.slice(0, i + 1).join('/');
        
        if (!current.children) current.children = [];
        
        let existing = current.children.find(child => child.name === part);
        if (!existing) {
          existing = {
            name: part,
            path: currentPath,
            type: isFile ? 'file' : 'folder',
            children: isFile ? undefined : [],
            content: isFile ? file.content : undefined
          };
          current.children.push(existing);
        }
        
        current = existing;
      }
    });
    
    return root.children || [];
  };

  const fileTree = buildFileTree(files);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'html': return '🌐';
      case 'css': return '🎨';
      case 'js': return '📄';
      case 'ts': return '🔷';
      case 'jsx': case 'tsx': return '⚛️';
      case 'json': return '📋';
      case 'md': return '📝';
      case 'png': case 'jpg': case 'jpeg': case 'gif': case 'svg': return '🖼️';
      default: return '📄';
    }
  };

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isActive = activeFile === node.path;
    
    return (
      <div key={node.path}>
        <div
          className={`flex items-center py-1 px-2 cursor-pointer text-sm hover:bg-[#2a2d2e] ${
            isActive ? 'bg-[#37373d] text-white' : 'text-gray-300'
          }`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onClick={() => {
            if (node.type === 'folder') {
              toggleFolder(node.path);
            } else {
              onFileSelect({ path: node.path, content: node.content || '' });
            }
          }}
        >
          {node.type === 'folder' ? (
            <>
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 mr-1 text-gray-400" />
              ) : (
                <ChevronRight className="h-3 w-3 mr-1 text-gray-400" />
              )}
              {isExpanded ? (
                <FolderOpen className="h-4 w-4 mr-2 text-blue-400" />
              ) : (
                <Folder className="h-4 w-4 mr-2 text-blue-400" />
              )}
            </>
          ) : (
            <>
              <span className="w-4 mr-1"></span>
              <span className="mr-2">{getFileIcon(node.name)}</span>
            </>
          )}
          <span className="truncate" title={node.name}>
            {node.name}
          </span>
        </div>
        
        {node.type === 'folder' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="text-sm">
      {fileTree.length > 0 ? (
        fileTree.map(node => renderNode(node))
      ) : (
        <div className="p-4 text-center text-gray-400">
          <File className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No files</p>
        </div>
      )}
    </div>
  );
} 