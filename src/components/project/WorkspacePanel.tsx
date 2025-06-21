"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeEditor } from './CodeEditor';
import { PreviewPanel } from './PreviewPanel';

interface WorkspacePanelProps {
  files?: Array<{
    path: string;
    content: string;
    status?: string;
  }>;
  activeFile?: {
    path: string;
    content: string;
  } | null;
  onFileSelect?: (file: { path: string; content: string }) => void;
  activeCode?: string;
  onCodeChange?: (code: string) => void;
}

export function WorkspacePanel({ 
  files = [], 
  activeFile, 
  onFileSelect, 
  activeCode = '', 
  onCodeChange 
}: WorkspacePanelProps) {
  const [activeTab, setActiveTab] = useState('code');

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="code" className="flex-1 mt-0">
          <CodeEditor
            value={activeCode}
            onChange={onCodeChange}
            language="typescript"
            fileName={activeFile?.path || 'untitled.ts'}
          />
        </TabsContent>
        
        <TabsContent value="preview" className="flex-1 mt-0">
          <PreviewPanel files={files} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 