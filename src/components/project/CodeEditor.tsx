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
    <div className="relative h-full font-mono text-sm bg-[#1e1e1e] text-white overflow-hidden">
        <div className="absolute top-2 right-4 text-xs text-gray-400 z-10">TypeScript</div>
        <div className="h-full w-full code-editor-container">
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
                  height: '100%',
                  width: '100%',
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4',
                  opacity: readOnly ? 0.8 : 1,
                  outline: 'none',
                  border: 'none',
                  overflow: 'auto',
              }}
              readOnly={readOnly}
              textareaClassName="code-textarea"
          />
        </div>
        
        <style jsx global>{`
          .code-editor-container {
            height: 100%;
            overflow: auto;
            scrollbar-width: thin;
            scrollbar-color: #4a5568 #1e1e1e;
          }
          
          .code-editor-container::-webkit-scrollbar {
            width: 14px;
            height: 14px;
          }
          
          .code-editor-container::-webkit-scrollbar-track {
            background: #1e1e1e;
            border-radius: 0;
          }
          
          .code-editor-container::-webkit-scrollbar-thumb {
            background: #3e3e42;
            border-radius: 7px;
            border: 2px solid #1e1e1e;
          }
          
          .code-editor-container::-webkit-scrollbar-thumb:hover {
            background: #4a4a4a;
          }
          
          .code-editor-container::-webkit-scrollbar-corner {
            background: #1e1e1e;
          }
          
          .code-editor {
            font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', Monaco, Consolas, monospace !important;
            height: 100% !important;
            overflow: visible !important;
          }
          
          .code-editor > div {
            height: auto !important;
            min-height: 100% !important;
          }
          
          .code-textarea {
            outline: none !important;
            border: none !important;
            resize: none !important;
            height: auto !important;
            min-height: calc(100vh - 120px) !important;
            background: transparent !important;
            color: #d4d4d4 !important;
            font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', Monaco, Consolas, monospace !important;
            font-size: 14px !important;
            line-height: 1.6 !important;
            padding: 16px !important;
            overflow: visible !important;
          }
          
          .code-textarea:focus {
            outline: none !important;
            box-shadow: none !important;
          }
          
          /* Ensure pre element (highlighted code) also scrolls properly */
          .code-editor pre {
            height: auto !important;
            min-height: calc(100vh - 120px) !important;
            margin: 0 !important;
            overflow: visible !important;
            white-space: pre-wrap !important;
            word-wrap: break-word !important;
          }
          
          /* VS Code style scrollbar for the code editor */
          .code-editor-container::-webkit-scrollbar-track:vertical {
            background: #1e1e1e;
          }
          
          .code-editor-container::-webkit-scrollbar-track:horizontal {
            background: #1e1e1e;
          }
          
          .code-editor-container::-webkit-scrollbar-thumb:vertical {
            background: #3e3e42;
            min-height: 20px;
          }
          
          .code-editor-container::-webkit-scrollbar-thumb:horizontal {
            background: #3e3e42;
            min-width: 20px;
          }
        `}</style>
    </div>
  );
}; 