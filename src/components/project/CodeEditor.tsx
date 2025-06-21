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
    <div className="h-full w-full bg-[#1e1e1e] text-white relative overflow-hidden">
        <div className="absolute top-2 right-4 text-xs text-gray-400 z-10">TypeScript</div>
        <div className="h-full w-full code-editor-wrapper">
           <Editor
              value={currentCode}
              onValueChange={readOnly ? () => {} : setCode}
              highlight={code => Prism.highlight(code, Prism.languages.tsx, 'tsx')}
              padding={16}
              className={`code-editor-main ${readOnly ? 'read-only' : ''}`}
              style={{
                  fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", "SF Mono", Monaco, Consolas, monospace',
                  fontSize: 14,
                  lineHeight: 1.6,
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4',
                  opacity: readOnly ? 0.8 : 1,
                  outline: 'none',
                  border: 'none',
                  height: '100%',
                  width: '100%',
              }}
              readOnly={readOnly}
              textareaClassName="editor-textarea"
              preClassName="editor-pre"
          />
        </div>
        
        <style jsx global>{`
          .code-editor-wrapper {
            position: relative;
            height: 100%;
            width: 100%;
            overflow: auto;
            scrollbar-width: thin;
            scrollbar-color: #4a5568 #1e1e1e;
          }
          
          /* Custom scrollbar styling */
          .code-editor-wrapper::-webkit-scrollbar {
            width: 12px;
            height: 12px;
          }
          
          .code-editor-wrapper::-webkit-scrollbar-track {
            background: #1e1e1e;
          }
          
          .code-editor-wrapper::-webkit-scrollbar-thumb {
            background: #3e3e42;
            border-radius: 6px;
            border: 2px solid #1e1e1e;
          }
          
          .code-editor-wrapper::-webkit-scrollbar-thumb:hover {
            background: #4a4a4a;
          }
          
          .code-editor-wrapper::-webkit-scrollbar-corner {
            background: #1e1e1e;
          }
          
          /* Editor styling */
          .code-editor-main {
            font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', Monaco, Consolas, monospace !important;
            height: 100% !important;
            width: 100% !important;
            overflow: visible !important;
          }
          
          .code-editor-main > div {
            height: auto !important;
            min-height: 100% !important;
            width: 100% !important;
          }
          
          /* Textarea styling */
          .editor-textarea {
            outline: none !important;
            border: none !important;
            resize: none !important;
            background: transparent !important;
            color: #d4d4d4 !important;
            font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', Monaco, Consolas, monospace !important;
            font-size: 14px !important;
            line-height: 1.6 !important;
            padding: 16px !important;
            white-space: pre !important;
            word-wrap: normal !important;
            overflow-wrap: normal !important;
            width: 100% !important;
            height: auto !important;
            min-height: 100% !important;
            box-sizing: border-box !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            z-index: 1 !important;
          }
          
          .editor-textarea:focus {
            outline: none !important;
            box-shadow: none !important;
          }
          
          /* Pre element (syntax highlighting) styling */
          .editor-pre {
            margin: 0 !important;
            padding: 16px !important;
            background: transparent !important;
            font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', Monaco, Consolas, monospace !important;
            font-size: 14px !important;
            line-height: 1.6 !important;
            color: #d4d4d4 !important;
            white-space: pre !important;
            word-wrap: normal !important;
            overflow-wrap: normal !important;
            width: 100% !important;
            height: auto !important;
            min-height: 100% !important;
            box-sizing: border-box !important;
            position: relative !important;
            z-index: 0 !important;
          }
          
          /* Ensure proper text rendering */
          .code-editor-main * {
            font-variant-ligatures: normal !important;
            text-rendering: optimizeLegibility !important;
          }
          
          /* Read-only mode styling */
          .read-only .editor-textarea {
            cursor: default !important;
            opacity: 0.8 !important;
          }
          
          /* Smooth scrolling */
          .code-editor-wrapper {
            scroll-behavior: smooth;
          }
        `}</style>
    </div>
  );
}; 