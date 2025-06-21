"use client";

import React from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';

// We need to import a theme for Prism. You can choose any theme.
// Let's use a custom one defined in globals.css
// import 'prismjs/themes/prism-okaidia.css'; 

interface CodeEditorProps {
    code: string;
    setCode: (code: string) => void;
    readOnly?: boolean;
}

export const CodeEditor = ({ code, setCode, readOnly = false }: CodeEditorProps) => {
  const currentCode = typeof code === 'string' ? code : '';
  
  return (
    <div className="relative h-full font-mono text-sm bg-[#1e1e1e] text-white">
        <div className="absolute top-2 right-4 text-xs text-gray-400 z-10">TypeScript</div>
         <div className="h-full overflow-auto custom-scrollbar">
           <Editor
              value={currentCode}
              onValueChange={readOnly ? () => {} : setCode}
              highlight={code => Prism.highlight(code, Prism.languages.tsx, 'tsx')}
              padding={16}
              className={`code-editor ${readOnly ? 'read-only' : ''}`}
              style={{
                  fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", "SF Mono", Monaco, Consolas, monospace',
                  fontSize: 14,
                  lineHeight: 1.6,
                  minHeight: '100%',
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4',
                  opacity: readOnly ? 0.8 : 1,
                  outline: 'none',
                  border: 'none',
              }}
              readOnly={readOnly}
              textareaClassName="code-textarea"
          />
        </div>
        
        <style jsx global>{`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #4a5568 #2d3748;
          }
          
          .custom-scrollbar::-webkit-scrollbar {
            width: 12px;
            height: 12px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #2d3748;
            border-radius: 6px;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #4a5568;
            border-radius: 6px;
            border: 2px solid #2d3748;
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #718096;
          }
          
          .custom-scrollbar::-webkit-scrollbar-corner {
            background: #2d3748;
          }
          
          .code-textarea {
            outline: none !important;
            border: none !important;
            resize: none !important;
          }
          
          .code-editor {
            font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', Monaco, Consolas, monospace !important;
          }
        `}</style>
    </div>
  );
}; 