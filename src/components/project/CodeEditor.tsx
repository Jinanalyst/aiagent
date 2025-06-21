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
}

export const CodeEditor = ({ code, setCode }: CodeEditorProps) => {
  const currentCode = typeof code === 'string' ? code : '';
  
  return (
    <div className="relative h-full font-mono text-sm bg-[#f8f8f8] border-l">
        <div className="absolute top-2 right-4 text-xs text-gray-400">TypeScript</div>
         <Editor
            value={currentCode}
            onValueChange={code => setCode(code)}
            highlight={code => Prism.highlight(code, Prism.languages.tsx, 'tsx')}
            padding={16}
            className="code-editor"
            style={{
                fontFamily: '"Fira Mono", "DejaVu Sans Mono", Menlo, Consolas, "Liberation Mono", Monaco, "Lucida Console", monospace',
                fontSize: 14,
                lineHeight: 1.5,
                height: '100%',
                overflow: 'auto',
            }}
        />
    </div>
  );
}; 