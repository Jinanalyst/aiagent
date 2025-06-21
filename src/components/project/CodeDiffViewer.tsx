"use client";

import React from 'react';
import { FileIcon, Plus, Minus } from 'lucide-react';

interface DiffLine {
  type: 'add' | 'remove' | 'normal' | 'context';
  content: string;
  lineNumber?: number;
  oldLineNumber?: number;
  newLineNumber?: number;
}

interface CodeDiffViewerProps {
  fileName: string;
  oldContent: string;
  newContent: string;
  isGenerating?: boolean;
  generatedLines?: number;
}

export function CodeDiffViewer({ 
  fileName, 
  oldContent, 
  newContent, 
  isGenerating = false,
  generatedLines = 0
}: CodeDiffViewerProps) {
  const generateDiff = (oldContent: string, newContent: string): DiffLine[] => {
    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    const diff: DiffLine[] = [];
    
    // Simple diff algorithm - in production, use a proper diff library
    let oldIndex = 0;
    let newIndex = 0;
    
    while (oldIndex < oldLines.length || newIndex < newLines.length) {
      const oldLine = oldLines[oldIndex];
      const newLine = newLines[newIndex];
      
      if (oldIndex >= oldLines.length) {
        // Only new lines remaining
        diff.push({
          type: 'add',
          content: newLine,
          newLineNumber: newIndex + 1
        });
        newIndex++;
      } else if (newIndex >= newLines.length) {
        // Only old lines remaining
        diff.push({
          type: 'remove',
          content: oldLine,
          oldLineNumber: oldIndex + 1
        });
        oldIndex++;
      } else if (oldLine === newLine) {
        // Lines are the same
        diff.push({
          type: 'normal',
          content: oldLine,
          oldLineNumber: oldIndex + 1,
          newLineNumber: newIndex + 1
        });
        oldIndex++;
        newIndex++;
      } else {
        // Lines are different - show as remove + add
        diff.push({
          type: 'remove',
          content: oldLine,
          oldLineNumber: oldIndex + 1
        });
        diff.push({
          type: 'add',
          content: newLine,
          newLineNumber: newIndex + 1
        });
        oldIndex++;
        newIndex++;
      }
    }
    
    return diff;
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
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

  const diff = generateDiff(oldContent, newContent);
  const displayedDiff = isGenerating ? diff.slice(0, generatedLines) : diff;
  
  const additions = displayedDiff.filter(line => line.type === 'add').length;
  const deletions = displayedDiff.filter(line => line.type === 'remove').length;

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-900 font-mono text-sm">
      {/* File Header */}
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getFileIcon(fileName)}</span>
          <span className="text-white font-medium">{fileName}</span>
          {additions > 0 && (
            <span className="text-green-400 text-xs">+{additions}</span>
          )}
          {deletions > 0 && (
            <span className="text-red-400 text-xs">-{deletions}</span>
          )}
        </div>
        {isGenerating && (
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
      </div>
      
      {/* Diff Content */}
      <div className="max-h-96 overflow-y-auto">
        {displayedDiff.map((line, index) => {
          const bgColor = line.type === 'add' ? 'bg-green-900/30' : 
                         line.type === 'remove' ? 'bg-red-900/30' : '';
          const textColor = line.type === 'add' ? 'text-green-300' :
                           line.type === 'remove' ? 'text-red-300' : 'text-gray-300';
          const prefix = line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' ';
          const lineNumberColor = line.type === 'add' ? 'text-green-500' :
                                 line.type === 'remove' ? 'text-red-500' : 'text-gray-500';

          return (
            <div key={index} className={`flex ${bgColor} hover:bg-gray-800/50`}>
              {/* Line Numbers */}
              <div className="w-16 px-2 py-1 text-xs text-center border-r border-gray-700 bg-gray-800">
                <span className={lineNumberColor}>
                  {line.oldLineNumber || ''}
                </span>
              </div>
              <div className="w-16 px-2 py-1 text-xs text-center border-r border-gray-700 bg-gray-800">
                <span className={lineNumberColor}>
                  {line.newLineNumber || ''}
                </span>
              </div>
              
              {/* Prefix */}
              <div className="w-8 px-2 py-1 text-center border-r border-gray-700">
                <span className={textColor}>{prefix}</span>
              </div>
              
              {/* Code Content */}
              <div className={`flex-1 px-3 py-1 ${textColor} whitespace-pre-wrap break-all`}>
                {line.content || '\u00A0'}
              </div>
            </div>
          );
        })}
        
        {isGenerating && displayedDiff.length < diff.length && (
          <div className="px-4 py-2 text-gray-500 text-xs border-t border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
              Generating more changes...
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 