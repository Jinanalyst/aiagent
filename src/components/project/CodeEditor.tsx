"use client";

import React, { useEffect, useRef } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate content height based on number of lines
  useEffect(() => {
    if (containerRef.current) {
      const lineCount = currentCode.split('\n').length;
      const lineHeight = 1.6 * 14; // lineHeight * fontSize
      const padding = 32; // 16px top + 16px bottom
      const minHeight = Math.max(lineCount * lineHeight + padding, window.innerHeight);
      
      // Set CSS custom property for dynamic height
      containerRef.current.style.setProperty('--content-height', `${minHeight}px`);
    }
  }, [currentCode]);
  
  return (
    <div className="relative h-full font-mono text-sm bg-[#1e1e1e] text-white overflow-hidden">
        <div className="absolute top-2 right-4 text-xs text-gray-400 z-10">TypeScript</div>
        <div ref={containerRef} className="h-full w-full code-editor-container">
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
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4',
                  opacity: readOnly ? 0.8 : 1,
                  outline: 'none',
                  border: 'none',
                  minHeight: '100%',
                  width: '100%',
                  overflow: 'visible',
              }}
              readOnly={readOnly}
              textareaClassName="code-textarea"
          />
        </div>
        
        <style jsx global>{`
          .code-editor-container {
            height: 100%;
            width: 100%;
            overflow-y: auto;
            overflow-x: auto;
            scrollbar-width: thin;
            scrollbar-color: #4a5568 #1e1e1e;
            position: relative;
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
            min-height: var(--content-height, 100vh) !important;
            width: 100% !important;
            overflow: visible !important;
            position: relative !important;
          }
          
          .code-editor > div {
            min-height: var(--content-height, 100vh) !important;
            width: 100% !important;
            position: relative !important;
          }
          
          .code-textarea {
            outline: none !important;
            border: none !important;
            resize: none !important;
            min-height: var(--content-height, 100vh) !important;
            height: auto !important;
            background: transparent !important;
            color: #d4d4d4 !important;
            font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', Monaco, Consolas, monospace !important;
            font-size: 14px !important;
            line-height: 1.6 !important;
            padding: 16px !important;
            overflow: visible !important;
            white-space: pre-wrap !important;
            word-wrap: break-word !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          
          .code-textarea:focus {
            outline: none !important;
            box-shadow: none !important;
          }
          
          /* Ensure pre element (highlighted code) also expands properly */
          .code-editor pre {
            min-height: var(--content-height, 100vh) !important;
            height: auto !important;
            margin: 0 !important;
            overflow: visible !important;
            white-space: pre-wrap !important;
            word-wrap: break-word !important;
            padding: 16px !important;
            box-sizing: border-box !important;
            width: 100% !important;
            background: transparent !important;
            font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', Monaco, Consolas, monospace !important;
            font-size: 14px !important;
            line-height: 1.6 !important;
            color: inherit !important;
          }
          
          /* Ensure both textarea and pre expand together */
          .code-editor textarea,
          .code-editor pre {
            min-height: var(--content-height, 100vh) !important;
          }
          
          /* VS Code style scrollbar variants */
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
          
          /* Smooth scrolling */
          .code-editor-container {
            scroll-behavior: smooth;
          }
        `}</style>
    </div>
  );
}; 