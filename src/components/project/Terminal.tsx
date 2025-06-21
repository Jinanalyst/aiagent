"use client"

import { Terminal as TerminalIcon, Plus, ChevronDown, Server } from "lucide-react";
import { useEffect, useRef } from "react";

interface LogEntry {
    timestamp: string;
    message: string;
    type: 'INFO' | 'ERROR' | 'SUCCESS' | 'PLAN';
}

interface TerminalProps {
    logs: LogEntry[];
}

export function Terminal({ logs }: TerminalProps) {
    const terminalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [logs]);

    const getTypeColor = (type: LogEntry['type']) => {
        switch (type) {
            case 'INFO': return 'text-gray-400';
            case 'ERROR': return 'text-red-400';
            case 'SUCCESS': return 'text-green-400';
            case 'PLAN': return 'text-blue-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="bg-gray-900 text-gray-200 font-mono text-xs rounded-b-lg flex-1 flex flex-col border-t border-gray-700">
            <div className="flex-shrink-0 px-4 py-2 border-b border-gray-700 flex items-center justify-between bg-gray-800">
                <div className="flex items-center gap-2">
                    <Server className="h-4 w-4 text-gray-400" />
                    <span className="font-semibold">Agent Logs</span>
                </div>
                <span className="text-gray-500 text-xs">Real-time</span>
            </div>
            <div ref={terminalRef} className="p-4 overflow-y-auto flex-1 space-y-2">
                {logs.map((log, index) => (
                    <div key={index} className="flex gap-3">
                        <span className="text-gray-500 flex-shrink-0">{log.timestamp}</span>
                        <span className={`${getTypeColor(log.type)} flex-shrink-0`}>[{log.type}]</span>
                        <p className="whitespace-pre-wrap break-words">{log.message}</p>
                    </div>
                ))}
                 {logs.length === 0 && (
                    <div className="text-center text-gray-500 pt-8">
                        <p>Waiting for agent to start...</p>
                        <p className="mt-2 text-xs">Logs from the AI generation process will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
} 