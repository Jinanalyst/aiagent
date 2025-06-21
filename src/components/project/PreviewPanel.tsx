"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, ExternalLink } from 'lucide-react';

interface PreviewPanelProps {
    files: Array<{
        path: string;
        content: string;
        status?: string;
    }>;
}

export function PreviewPanel({ files }: PreviewPanelProps) {
    const [previewKey, setPreviewKey] = useState(0);

    const refreshPreview = () => {
        setPreviewKey(prev => prev + 1);
    };

    const openInNewTab = () => {
        const htmlContent = assembleHtml();
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    const assembleHtml = () => {
        const htmlFile = files.find(f => f.path.endsWith('.html') || f.path === 'index.html');
        
        if (!htmlFile) {
            return '<html><body><h1>No HTML file found</h1><p>Create an HTML file to see the preview.</p></body></html>';
        }

        let htmlContent = htmlFile.content;

        // Inject CSS files
        const cssFiles = files.filter(f => f.path.endsWith('.css'));
        cssFiles.forEach(cssFile => {
            const cssTag = `<style>${cssFile.content}</style>`;
            if (htmlContent.includes('</head>')) {
                htmlContent = htmlContent.replace('</head>', `${cssTag}</head>`);
            } else {
                htmlContent = `<head>${cssTag}</head>${htmlContent}`;
            }
        });

        // Inject JS files
        const jsFiles = files.filter(f => f.path.endsWith('.js') && !f.path.includes('node_modules'));
        jsFiles.forEach(jsFile => {
            const scriptTag = `<script>${jsFile.content}</script>`;
            if (htmlContent.includes('</body>')) {
                htmlContent = htmlContent.replace('</body>', `${scriptTag}</body>`);
            } else {
                htmlContent = `${htmlContent}${scriptTag}`;
            }
        });

        // Handle React JSX files with basic transformation
        const jsxFiles = files.filter(f => f.path.endsWith('.jsx') || f.path.endsWith('.tsx'));
        if (jsxFiles.length > 0) {
            jsxFiles.forEach(jsxFile => {
                // Simple JSX to JS transformation (very basic)
                const cleanContent = jsxFile.content
                    .replace(/import.*from.*['"].*['"];?\n?/g, '') // Remove imports
                    .replace(/export\s+default\s+/g, '') // Remove export default
                    .replace(/export\s+/g, ''); // Remove other exports
                
                const scriptTag = `<script type="text/babel">${cleanContent}</script>`;
                if (htmlContent.includes('</body>')) {
                    htmlContent = htmlContent.replace('</body>', `${scriptTag}</body>`);
                } else {
                    htmlContent = `${htmlContent}${scriptTag}`;
                }
            });

            // Add Babel standalone for JSX transformation
            const babelScript = '<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>';
            if (htmlContent.includes('</head>')) {
                htmlContent = htmlContent.replace('</head>', `${babelScript}</head>`);
            } else {
                htmlContent = `<head>${babelScript}</head>${htmlContent}`;
            }
        }

        return htmlContent;
    };

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b bg-gray-50">
                <h3 className="font-medium text-gray-700">Preview</h3>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshPreview}
                        className="h-8 px-3"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={openInNewTab}
                        className="h-8 px-3"
                    >
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 bg-white">
                <iframe
                    key={previewKey}
                    srcDoc={assembleHtml()}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin"
                    title="Preview"
                />
            </div>
        </div>
    );
} 