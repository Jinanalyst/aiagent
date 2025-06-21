"use client";

import { useEffect, useRef, useState } from 'react';
import { WebContainer } from '@webcontainer/api';
import { Loader2, ServerCrash, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface FileSystem {
    [path: string]: string;
}

interface PreviewPanelProps {
    fileSystem: FileSystem;
    onStatusUpdate: (status: string) => void;
}

type PreviewStatus = 'idle' | 'booting' | 'installing' | 'running' | 'error';

export function PreviewPanel({ fileSystem, onStatusUpdate }: PreviewPanelProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const webcontainerInstance = useRef<WebContainer | null>(null);
    const [status, setStatus] = useState<PreviewStatus>('idle');
    const [error, setError] = useState<string | null>(null);

    const startDevServer = async () => {
        if (!webcontainerInstance.current) {
            setStatus('error');
            setError('WebContainer not initialized.');
            onStatusUpdate('Error: WebContainer not initialized.');
            return;
        }

        try {
            // Write files to the virtual file system
            onStatusUpdate('Writing files to virtual file system...');
            for (const [path, content] of Object.entries(fileSystem)) {
                const dir = path.substring(0, path.lastIndexOf('/'));
                if (dir) {
                    await webcontainerInstance.current.fs.mkdir(dir, { recursive: true });
                }
                await webcontainerInstance.current.fs.writeFile(path, content);
            }

            // Install dependencies
            setStatus('installing');
            onStatusUpdate('Installing dependencies (npm install)...');
            const installProcess = await webcontainerInstance.current.spawn('npm', ['install']);
            installProcess.output.pipeTo(new WritableStream({
                write(data) {
                    onStatusUpdate(`[npm install]: ${data}`);
                }
            }));
            const installExitCode = await installProcess.exit;
            if (installExitCode !== 0) {
                throw new Error('npm install failed');
            }
            onStatusUpdate('Dependencies installed successfully.');

            // Run the dev server
            setStatus('running');
            onStatusUpdate('Starting development server (npm run dev)...');
            await webcontainerInstance.current.spawn('npm', ['run', 'dev']);

            // Wait for the server to be ready
            webcontainerInstance.current.on('server-ready', (port, url) => {
                onStatusUpdate(`Server ready at ${url}`);
                if (iframeRef.current) {
                    iframeRef.current.src = url;
                }
            });

        } catch (err: any) {
            setStatus('error');
            setError(err.message);
            onStatusUpdate(`Error: ${err.message}`);
        }
    };

    useEffect(() => {
        if (status === 'idle') {
            setStatus('booting');
            onStatusUpdate('Booting WebContainer...');
            WebContainer.boot()
                .then(wc => {
                    webcontainerInstance.current = wc;
                    onStatusUpdate('WebContainer booted.');
                    startDevServer();
                })
                .catch(err => {
                    setStatus('error');
                    setError(err.message);
                    onStatusUpdate(`Error: ${err.message}`);
                });
        }
    }, []);

    const renderStatus = () => {
        switch (status) {
            case 'booting':
                return <div className="flex flex-col items-center gap-4"><Loader2 className="h-8 w-8 animate-spin" /><span>Booting WebContainer...</span></div>;
            case 'installing':
                return <div className="flex flex-col items-center gap-4"><Loader2 className="h-8 w-8 animate-spin" /><span>Installing Dependencies...</span></div>;
            case 'running':
                return <div className="flex flex-col items-center gap-4"><CheckCircle className="h-8 w-8 text-green-500" /><span>Server is running!</span></div>;
            case 'error':
                return <div className="flex flex-col items-center gap-4 text-red-500"><ServerCrash className="h-8 w-8" /><span>Error: {error}</span><Button onClick={() => window.location.reload()}>Reload Preview</Button></div>;
            default:
                return <div className="flex flex-col items-center gap-4"><Loader2 className="h-8 w-8 animate-spin" /><span>Initializing...</span></div>;
        }
    };

    return (
        <div className="h-full w-full flex flex-col">
            <div className="p-2 border-b text-center text-sm bg-gray-50">
                {renderStatus()}
            </div>
            <iframe ref={iframeRef} className="w-full h-full border-none" title="Live Preview" />
        </div>
    );
} 