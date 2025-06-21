"use client";

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeEditor } from './CodeEditor';
import { PreviewPanel } from './PreviewPanel';
import { FileExplorer } from './FileExplorer';
import { Button } from '@/components/ui/button';
import { X, Plus, Search, FolderOpen, Terminal } from 'lucide-react';

interface WorkspacePanelProps {
  files?: Array<{
    id: string;
    path: string;
    content: string;
    status?: string;
  }>;
  activeFile?: {
    path: string;
    content: string;
  } | null;
  onCodeChange?: (code: string) => void;
}

interface OpenTab {
  id: string;
  path: string;
  content: string;
  isDirty: boolean;
}

export function WorkspacePanel({ 
  files = [], 
  activeFile, 
  onCodeChange 
}: WorkspacePanelProps) {
  const [activeTab, setActiveTab] = useState('code');
  const [openTabs, setOpenTabs] = useState<OpenTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [showTerminal, setShowTerminal] = useState(false);

  // Initialize with the active file if it exists
  React.useEffect(() => {
    if (activeFile && openTabs.length === 0) {
      const newTab: OpenTab = {
        id: activeFile.path,
        path: activeFile.path,
        content: activeFile.content,
        isDirty: false
      };
      setOpenTabs([newTab]);
      setActiveTabId(activeFile.path);
    }
  }, [activeFile, openTabs.length]);

  const handleFileSelect = (file: { path: string; content: string }) => {
    const existingTab = openTabs.find(tab => tab.path === file.path);
    
    if (existingTab) {
      setActiveTabId(existingTab.id);
    } else {
      const newTab: OpenTab = {
        id: file.path,
        path: file.path,
        content: file.content,
        isDirty: false
      };
      setOpenTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.id);
    }
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const tabIndex = openTabs.findIndex(tab => tab.id === tabId);
    const newTabs = openTabs.filter(tab => tab.id !== tabId);
    setOpenTabs(newTabs);
    
    if (activeTabId === tabId) {
      if (newTabs.length > 0) {
        const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
        setActiveTabId(newTabs[newActiveIndex].id);
      } else {
        setActiveTabId('');
      }
    }
  };

  const handleCodeChange = (newCode: string) => {
    if (onCodeChange) {
      onCodeChange(newCode);
    }
    
    setOpenTabs(prev => prev.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, content: newCode, isDirty: true }
        : tab
    ));
  };

  const getFileIcon = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'html': return '🌐';
      case 'css': return '🎨';
      case 'js': return '📄';
      case 'ts': return '🔷';
      case 'jsx': case 'tsx': return '⚛️';
      case 'json': return '📋';
      case 'md': return '📝';
      default: return '📄';
    }
  };

  const activeTabContent = openTabs.find(tab => tab.id === activeTabId);

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-white">
      {/* Top Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 bg-[#2d2d30] border-b border-[#3e3e42]">
          <TabsTrigger value="code" className="data-[state=active]:bg-[#1e1e1e] text-white">
            Code
          </TabsTrigger>
          <TabsTrigger value="preview" className="data-[state=active]:bg-[#1e1e1e] text-white">
            Preview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="code" className="flex-1 mt-0 flex">
          {/* Left Sidebar - File Explorer */}
          <div className="w-64 bg-[#252526] border-r border-[#3e3e42] flex flex-col">
            {/* Explorer Header */}
            <div className="p-2 border-b border-[#3e3e42]">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-300 uppercase tracking-wide">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Files
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400 hover:text-white">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="mt-2 relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search"
                  className="w-full pl-7 pr-2 py-1 text-xs bg-[#3c3c3c] border border-[#3e3e42] rounded text-white placeholder-gray-400 focus:outline-none focus:border-[#007acc]"
                />
              </div>
            </div>

            {/* File Tree */}
            <div className="flex-1 overflow-y-auto">
              <FileExplorer 
                files={files} 
                onFileSelect={handleFileSelect}
                activeFile={activeTabContent?.path}
              />
            </div>
          </div>

          {/* Main Editor Area */}
          <div className="flex-1 flex flex-col">
            {/* Tab Bar */}
            {openTabs.length > 0 && (
              <div className="flex bg-[#2d2d30] border-b border-[#3e3e42] overflow-x-auto">
                {openTabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={`flex items-center px-3 py-2 text-sm cursor-pointer border-r border-[#3e3e42] min-w-0 max-w-[200px] group ${
                      activeTabId === tab.id 
                        ? 'bg-[#1e1e1e] text-white border-t-2 border-t-[#007acc]' 
                        : 'bg-[#2d2d30] text-gray-300 hover:bg-[#3e3e42]'
                    }`}
                    onClick={() => setActiveTabId(tab.id)}
                  >
                    <span className="mr-2">{getFileIcon(tab.path)}</span>
                    <span className="truncate flex-1" title={tab.path}>
                      {tab.path.split('/').pop()}
                    </span>
                    {tab.isDirty && (
                      <span className="ml-1 w-2 h-2 bg-white rounded-full"></span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-4 w-4 p-0 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white hover:bg-[#5a5a5a]"
                      onClick={(e) => handleCloseTab(tab.id, e)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Editor Content */}
            <div className="flex-1 relative">
              {activeTabContent ? (
                <CodeEditor
                  code={activeTabContent.content}
                  setCode={handleCodeChange}
                  readOnly={!onCodeChange}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No file selected</p>
                    <p className="text-sm">Select a file from the explorer to start editing</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Panel - Terminal */}
            {showTerminal && (
              <div className="h-48 bg-[#1e1e1e] border-t border-[#3e3e42] flex flex-col">
                <div className="flex items-center justify-between p-2 bg-[#2d2d30] border-b border-[#3e3e42]">
                  <div className="flex items-center gap-2 text-sm">
                    <Terminal className="h-4 w-4" />
                    <span>Terminal</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    onClick={() => setShowTerminal(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex-1 p-2 font-mono text-sm">
                  <div className="text-green-400">$ npm run dev</div>
                  <div className="text-gray-300">✓ Ready in 2s</div>
                  <div className="text-gray-300">- Local: http://localhost:3001</div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="flex-1 mt-0">
          <PreviewPanel files={files} />
        </TabsContent>
      </Tabs>

      {/* Bottom Status Bar */}
      <div className="h-6 bg-[#007acc] flex items-center justify-between px-3 text-xs text-white">
        <div className="flex items-center gap-4">
          <span>⚡ Bolt</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 px-2 py-0 text-xs text-white hover:bg-[#005a9e]"
            onClick={() => setShowTerminal(!showTerminal)}
          >
            <Terminal className="h-3 w-3 mr-1" />
            Terminal
          </Button>
        </div>
        <div className="flex items-center gap-4">
          {activeTabContent && (
            <span>{activeTabContent.path}</span>
          )}
          <span>TypeScript</span>
        </div>
      </div>
    </div>
  );
} 