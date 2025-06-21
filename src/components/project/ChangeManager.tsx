"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  CircleX, 
  ChevronDown, 
  ChevronRight, 
  FileIcon,
  GitBranch,
  Plus,
  Minus,
  Clock
} from 'lucide-react';
import { FileChange, FileDiff } from '@/types';

interface ChangeManagerProps {
  changes: FileChange[];
  onAcceptChange: (changeId: string) => void;
  onRejectChange: (changeId: string) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  isVisible: boolean;
  onClose: () => void;
}

export function ChangeManager({
  changes,
  onAcceptChange,
  onRejectChange,
  onAcceptAll,
  onRejectAll,
  isVisible,
  onClose
}: ChangeManagerProps) {
  const [expandedChanges, setExpandedChanges] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('changes');

  if (!isVisible || changes.length === 0) return null;

  const pendingChanges = changes.filter(change => change.status === 'pending');
  const acceptedChanges = changes.filter(change => change.status === 'accepted');
  const rejectedChanges = changes.filter(change => change.status === 'rejected');

  const toggleExpanded = (changeId: string) => {
    const newExpanded = new Set(expandedChanges);
    if (newExpanded.has(changeId)) {
      newExpanded.delete(changeId);
    } else {
      newExpanded.add(changeId);
    }
    setExpandedChanges(newExpanded);
  };

  const generateDiff = (originalContent: string, modifiedContent: string): FileDiff => {
    const originalLines = originalContent.split('\n');
    const modifiedLines = modifiedContent.split('\n');
    
    let additions = 0;
    let deletions = 0;
    const lines: any[] = [];
    
    const maxLines = Math.max(originalLines.length, modifiedLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const originalLine = originalLines[i];
      const modifiedLine = modifiedLines[i];
      
      if (originalLine === undefined && modifiedLine !== undefined) {
        lines.push({ type: 'add', content: modifiedLine, lineNumber: i + 1 });
        additions++;
      } else if (originalLine !== undefined && modifiedLine === undefined) {
        lines.push({ type: 'remove', content: originalLine, lineNumber: i + 1 });
        deletions++;
      } else if (originalLine !== modifiedLine) {
        lines.push({ type: 'remove', content: originalLine, lineNumber: i + 1 });
        lines.push({ type: 'add', content: modifiedLine, lineNumber: i + 1 });
        deletions++;
        additions++;
      } else if (originalLine !== undefined) {
        lines.push({ type: 'normal', content: originalLine, lineNumber: i + 1 });
      }
    }
    
    return { 
      additions, 
      deletions, 
      chunks: [{
        oldStart: 1,
        oldLines: originalLines.length,
        newStart: 1,
        newLines: modifiedLines.length,
        lines
      }]
    };
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'created': return <Plus className="h-4 w-4 text-green-500" />;
      case 'modified': return <GitBranch className="h-4 w-4 text-blue-500" />;
      case 'deleted': return <Minus className="h-4 w-4 text-red-500" />;
      default: return <FileIcon className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-green-600 border-green-600">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600">Rejected</Badge>;
      default:
        return null;
    }
  };

  const renderDiffLine = (line: any, index: number) => {
    const bgColor = line.type === 'add' ? 'bg-green-50 dark:bg-green-900/20' :
                   line.type === 'remove' ? 'bg-red-50 dark:bg-red-900/20' : '';
    const textColor = line.type === 'add' ? 'text-green-800 dark:text-green-200' :
                     line.type === 'remove' ? 'text-red-800 dark:text-red-200' : 'text-gray-800 dark:text-gray-200';
    const prefix = line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' ';

    return (
      <div key={index} className={`flex text-sm font-mono ${bgColor}`}>
        <div className="w-12 text-center text-gray-500 border-r px-2 py-1 text-xs">
          {line.lineNumber}
        </div>
        <div className="w-8 text-center border-r px-2 py-1 text-xs">
          <span className={textColor}>{prefix}</span>
        </div>
        <div className={`flex-1 px-3 py-1 ${textColor}`}>
          {line.content}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-[90vw] h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            File Changes ({pendingChanges.length} pending)
          </CardTitle>
          <div className="flex items-center gap-2">
            {pendingChanges.length > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={onRejectAll}>
                  <CircleX className="h-4 w-4 mr-1" />
                  Reject all
                </Button>
                <Button size="sm" onClick={onAcceptAll}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Accept all
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="changes">
                Changes ({pendingChanges.length})
              </TabsTrigger>
              <TabsTrigger value="accepted">
                Accepted ({acceptedChanges.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedChanges.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="changes" className="flex-1 overflow-auto">
              <div className="space-y-3">
                {pendingChanges.map((change) => {
                  const isExpanded = expandedChanges.has(change.id);
                  const diff = generateDiff(change.originalContent, change.modifiedContent);
                  
                  return (
                    <Card key={change.id} className="border">
                      <CardHeader 
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                        onClick={() => toggleExpanded(change.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            {getChangeIcon(change.changeType)}
                            <span className="font-medium">{change.filePath}</span>
                            {getStatusBadge(change.status)}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {change.timestamp.toLocaleTimeString()}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <span className="text-green-600">+{diff.additions}</span>
                              <span className="text-red-600">-{diff.deletions}</span>
                            </div>
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => onRejectChange(change.id)}
                              >
                                <CircleX className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={() => onAcceptChange(change.id)}
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        {change.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                            {change.description}
                          </p>
                        )}
                      </CardHeader>
                      
                      {isExpanded && (
                        <CardContent className="pt-0">
                          <div className="border rounded-lg overflow-hidden">
                            <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm font-medium border-b">
                              Diff for {change.filePath}
                            </div>
                            <div className="max-h-96 overflow-auto">
                              {diff.chunks.map((chunk, chunkIndex) => (
                                <div key={chunkIndex}>
                                  {chunk.lines.map((line: any, lineIndex: number) => 
                                    renderDiffLine(line, lineIndex)
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
                
                {pendingChanges.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No pending changes
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="accepted" className="flex-1 overflow-auto">
              <div className="space-y-2">
                {acceptedChanges.map((change) => (
                  <div key={change.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center gap-2">
                      {getChangeIcon(change.changeType)}
                      <span>{change.filePath}</span>
                      <Badge variant="outline" className="text-green-600 border-green-600">Accepted</Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {change.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                {acceptedChanges.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No accepted changes
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="rejected" className="flex-1 overflow-auto">
              <div className="space-y-2">
                {rejectedChanges.map((change) => (
                  <div key={change.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50 dark:bg-red-900/20">
                    <div className="flex items-center gap-2">
                      {getChangeIcon(change.changeType)}
                      <span>{change.filePath}</span>
                      <Badge variant="outline" className="text-red-600 border-red-600">Rejected</Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {change.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                {rejectedChanges.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No rejected changes
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 