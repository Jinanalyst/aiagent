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
                overflow: 'auto',
                backgroundColor: '#1e1e1e',
                color: '#d4d4d4',
                opacity: readOnly ? 0.8 : 1,
            }}
            readOnly={readOnly}
        />
    </div>
  );
}; 