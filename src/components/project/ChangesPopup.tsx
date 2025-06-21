"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  CircleX, 
  ChevronDown, 
  ChevronUp,
  FileIcon,
  GitBranch,
  Plus,
  Minus,
  Clock,
  Eye
} from 'lucide-react';
import { FileChange } from '@/types';

interface ChangesPopupProps {
  changes: FileChange[];
  onAcceptChange: (changeId: string) => void;
  onRejectChange: (changeId: string) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onViewDetails: () => void;
  isVisible: boolean;
  isGenerating: boolean;
}

export function ChangesPopup({
  changes,
  onAcceptChange,
  onRejectChange,
  onAcceptAll,
  onRejectAll,
  onViewDetails,
  isVisible,
  isGenerating
}: ChangesPopupProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  const pendingChanges = changes.filter(change => change.status === 'pending');
  const recentChanges = changes.filter(change => 
    change.status === 'pending' && 
    Date.now() - change.timestamp.getTime() < 10000 // Last 10 seconds
  );

  useEffect(() => {
    if (isVisible && pendingChanges.length > 0) {
      setTimeout(() => setAnimateIn(true), 100);
    } else {
      setAnimateIn(false);
    }
  }, [isVisible, pendingChanges.length]);

  if (!isVisible || pendingChanges.length === 0) return null;

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'created': return <Plus className="h-3 w-3 text-green-500" />;
      case 'modified': return <GitBranch className="h-3 w-3 text-blue-500" />;
      case 'deleted': return <Minus className="h-3 w-3 text-red-500" />;
      default: return <FileIcon className="h-3 w-3" />;
    }
  };

  const getFileExtension = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx': case 'ts': return '🔷';
      case 'js': case 'jsx': return '📄';
      case 'css': return '🎨';
      case 'html': return '🌐';
      case 'json': return '📋';
      case 'md': return '📝';
      default: return '📄';
    }
  };

  const calculateStats = () => {
    let totalAdditions = 0;
    let totalDeletions = 0;
    
    pendingChanges.forEach(change => {
      const originalLines = change.originalContent.split('\n').length;
      const modifiedLines = change.modifiedContent.split('\n').length;
      
      if (change.changeType === 'created') {
        totalAdditions += modifiedLines;
      } else if (change.changeType === 'modified') {
        totalAdditions += Math.max(0, modifiedLines - originalLines);
        totalDeletions += Math.max(0, originalLines - modifiedLines);
      } else if (change.changeType === 'deleted') {
        totalDeletions += originalLines;
      }
    });
    
    return { totalAdditions, totalDeletions };
  };

  const { totalAdditions, totalDeletions } = calculateStats();

  return (
    <div className={`fixed bottom-20 left-4 right-4 z-40 transition-all duration-300 ease-out ${
      animateIn ? 'transform translate-y-0 opacity-100' : 'transform translate-y-4 opacity-0'
    }`}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">
                    {pendingChanges.length} file{pendingChanges.length !== 1 ? 's' : ''} edited
                  </span>
                </div>
                {(totalAdditions > 0 || totalDeletions > 0) && (
                  <div className="flex items-center gap-2 text-xs">
                    {totalAdditions > 0 && (
                      <span className="text-green-600 font-medium">+{totalAdditions}</span>
                    )}
                    {totalDeletions > 0 && (
                      <span className="text-red-600 font-medium">-{totalDeletions}</span>
                    )}
                  </div>
                )}
                {isGenerating && (
                  <Badge variant="outline" className="text-blue-600 border-blue-600 animate-pulse">
                    Generating...
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-6 px-2 text-xs"
                >
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </div>

          {/* File List - Expandable */}
          {isExpanded && (
            <div className="max-h-40 overflow-y-auto bg-gray-50 dark:bg-gray-800/50">
              {pendingChanges.slice(0, 5).map((change, index) => (
                <div key={change.id} className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm">{getFileExtension(change.filePath)}</span>
                    {getChangeIcon(change.changeType)}
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {change.filePath}
                    </span>
                    {recentChanges.includes(change) && (
                      <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRejectChange(change.id)}
                      className="h-6 w-6 p-0 text-red-500 hover:bg-red-50"
                    >
                      <CircleX className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAcceptChange(change.id)}
                      className="h-6 w-6 p-0 text-green-500 hover:bg-green-50"
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {pendingChanges.length > 5 && (
                <div className="px-4 py-2 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onViewDetails}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    View {pendingChanges.length - 5} more files...
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="bg-white dark:bg-gray-900 px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={onViewDetails}
                className="text-blue-600 hover:text-blue-700 text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                View Details
              </Button>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRejectAll}
                  className="h-7 px-3 text-xs border-red-200 text-red-600 hover:bg-red-50"
                >
                  <CircleX className="h-3 w-3 mr-1" />
                  Reject all
                </Button>
                <Button
                  size="sm"
                  onClick={onAcceptAll}
                  className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Accept all
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 