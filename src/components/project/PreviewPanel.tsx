"use client";

import { useState, useEffect, useMemo } from 'react';
import { CheckCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';

interface FileSystem {
    [path: string]: string;
}

interface PreviewPanelProps {
    fileSystem: FileSystem;
    onStatusUpdate: (status: string) => void;
}

export function PreviewPanel({ fileSystem, onStatusUpdate }: PreviewPanelProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const previewContent = useMemo(() => {
        const files = Object.entries(fileSystem);
        
        // Find the main HTML file
        let htmlFile = files.find(([path]) => 
            path.toLowerCase().includes('index.html') || 
            path.toLowerCase().includes('app.html') ||
            path.toLowerCase().endsWith('.html')
        );

        if (!htmlFile) {
            // If no HTML file, create a basic one with the React/JS content
            const jsFiles = files.filter(([path]) => 
                path.endsWith('.js') || path.endsWith('.jsx') || path.endsWith('.ts') || path.endsWith('.tsx')
            );
            
            const cssFiles = files.filter(([path]) => path.endsWith('.css'));
            
            if (jsFiles.length > 0 || cssFiles.length > 0) {
                let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Website</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        * { box-sizing: border-box; }
`;

                // Add CSS content
                cssFiles.forEach(([, content]) => {
                    htmlContent += content + '\n';
                });

                htmlContent += `
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
`;

                // Add JavaScript/React content
                jsFiles.forEach(([, content]) => {
                    // Clean up the content for browser execution
                    let cleanContent = content
                        .replace(/import.*from.*['"];?\s*/g, '') // Remove imports
                        .replace(/export\s+(default\s+)?/g, '') // Remove exports
                        .replace(/interface\s+\w+\s*{[^}]*}/g, '') // Remove TypeScript interfaces
                        .replace(/type\s+\w+\s*=.*?;/g, ''); // Remove type definitions

                    htmlContent += cleanContent + '\n';
                });

                htmlContent += `
        // Try to render the main component
        const rootElement = document.getElementById('root');
        if (typeof App !== 'undefined') {
            ReactDOM.render(React.createElement(App), rootElement);
        } else if (typeof HomePage !== 'undefined') {
            ReactDOM.render(React.createElement(HomePage), rootElement);
        } else if (typeof LandingPage !== 'undefined') {
            ReactDOM.render(React.createElement(LandingPage), rootElement);
        } else {
            rootElement.innerHTML = '<h1>Website Generated Successfully</h1><p>Check the code files for the complete implementation.</p>';
        }
    </script>
</body>
</html>`;
                
                return htmlContent;
            }
        } else {
            let htmlContent = htmlFile[1];
            
            // Inject CSS files into the HTML
            const cssFiles = files.filter(([path]) => path.endsWith('.css'));
            if (cssFiles.length > 0) {
                const cssContent = cssFiles.map(([, content]) => `<style>${content}</style>`).join('\n');
                htmlContent = htmlContent.replace('</head>', `${cssContent}\n</head>`);
            }
            
            // Inject JS files into the HTML
            const jsFiles = files.filter(([path]) => 
                path.endsWith('.js') && !path.includes('node_modules')
            );
            if (jsFiles.length > 0) {
                const jsContent = jsFiles.map(([, content]) => `<script>${content}</script>`).join('\n');
                htmlContent = htmlContent.replace('</body>', `${jsContent}\n</body>`);
            }
            
            return htmlContent;
        }
        
        return '<div style="padding: 40px; text-align: center; color: #666;"><h2>No website files generated yet</h2><p>Generate some HTML, CSS, or JavaScript files to see the preview.</p></div>';
    }, [fileSystem]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        onStatusUpdate('Refreshing preview...');
        setTimeout(() => {
            setIsRefreshing(false);
            onStatusUpdate('Preview refreshed');
        }, 1000);
    };

    const openInNewTab = () => {
        const blob = new Blob([previewContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    };

    return (
        <div className="h-full w-full flex flex-col bg-white dark:bg-gray-900">
            {/* Preview Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Website Preview</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button 
                        size="sm" 
                        variant="outline"
                        onClick={openInNewTab}
                    >
                        <ExternalLink className="h-4 w-4" />
                        Open in New Tab
                    </Button>
                </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 bg-white">
                <iframe
                    srcDoc={previewContent}
                    className="w-full h-full border-none"
                    title="Website Preview"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                />
            </div>
        </div>
    );
} 