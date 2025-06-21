"use client";

import { useEffect, useRef, useState } from 'react';
import { WebContainer } from '@webcontainer/api';
import type { FileSystemTree } from '@webcontainer/api';
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

function buildFileTree(fileSystem: FileSystem): FileSystemTree {
    const tree: FileSystemTree = {};
    for (const path in fileSystem) {
        const parts = path.split('/').filter(p => p);
        let current: FileSystemTree = tree;
        parts.forEach((part, index) => {
            if (index === parts.length - 1) {
                current[part] = {
                    file: {
                        contents: fileSystem[path],
                    },
                };
            } else {
                if (!current[part]) {
                    current[part] = {
                        directory: {},
                    };
                }
                current = (current[part] as { directory: FileSystemTree }).directory;
            }
        });
    }
    return tree;
}

export function PreviewPanel({ fileSystem, onStatusUpdate }: PreviewPanelProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const webcontainerInstance = useRef<WebContainer | null>(null);
    const [status, setStatus] = useState<PreviewStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [url, setUrl] = useState<string | null>(null);

    const startDevServer = async (wc: WebContainer) => {
        try {
            onStatusUpdate('Writing files to virtual file system...');
            const fileTree = buildFileTree(fileSystem);
            await wc.mount(fileTree);

            setStatus('installing');
            onStatusUpdate('Installing dependencies (npm install)...');
            const installProcess = await wc.spawn('npm', ['install']);
            installProcess.output.pipeTo(new WritableStream({ write(data) { onStatusUpdate(`[npm install]: ${data}`); } }));
            const installExitCode = await installProcess.exit;
            if (installExitCode !== 0) throw new Error('npm install failed');
            onStatusUpdate('Dependencies installed successfully.');

            setStatus('running');
            onStatusUpdate('Starting development server (npm run dev)...');
            const devProcess = await wc.spawn('npm', ['run', 'dev']);
            devProcess.output.pipeTo(new WritableStream({ write(data) { onStatusUpdate(`[npm run dev]: ${data}`); } }));

            wc.on('server-ready', (port, newUrl) => {
                onStatusUpdate(`Server ready at ${newUrl}`);
                setUrl(newUrl);
            });
            
            wc.on('error', (err) => {
                setError(err.message);
                setStatus('error');
            });

        } catch (err: any) {
            setStatus('error');
            setError(err.message);
            onStatusUpdate(`Error: ${err.message}`);
        }
    };

    useEffect(() => {
        if (status === 'idle' && !webcontainerInstance.current) {
            setStatus('booting');
            onStatusUpdate('Booting WebContainer...');
            WebContainer.boot()
                .then(wc => {
                    webcontainerInstance.current = wc;
                    onStatusUpdate('WebContainer booted.');
                    startDevServer(wc);
                })
                .catch(err => {
                    setStatus('error');
                    setError(err.message);
                    onStatusUpdate(`Error: ${err.message}`);
                });
        }
        
        return () => {
            if (webcontainerInstance.current) {
                webcontainerInstance.current.teardown();
                webcontainerInstance.current = null;
            }
        };
    }, []);
    
    useEffect(() => {
        if (webcontainerInstance.current && (status === 'running' || status === 'error')) {
            setUrl(null);
            setStatus('installing'); // Reset status to re-trigger server start
            startDevServer(webcontainerInstance.current);
        }
    }, [fileSystem]);

    const renderStatus = () => {
        switch (status) {
            case 'booting':
                return <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /><span>Booting...</span></div>;
            case 'installing':
                return <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /><span>Installing...</span></div>;
            case 'running':
                return <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span>Running</span></div>;
            case 'error':
                return <div className="flex items-center gap-2 text-red-500"><ServerCrash className="h-4 w-4" /><span>Error: {error}</span><Button size="sm" variant="outline" onClick={() => window.location.reload()}>Reload</Button></div>;
            default:
                return <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /><span>Initializing...</span></div>;
        }
    };

    return (
        <div className="h-full w-full flex flex-col bg-gray-50">
            <div className="p-2 border-b text-center text-sm bg-white shadow-sm flex justify-center items-center">
                {renderStatus()}
            </div>
            {url ? (
                <iframe ref={iframeRef} src={url} className="w-full h-full border-none" title="Live Preview" />
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500">Waiting for server to start...</p>
                </div>
            )}
        </div>
    );
} 