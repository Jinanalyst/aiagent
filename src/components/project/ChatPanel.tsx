"use client"
import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Send, Paperclip, Bot, User, Terminal, ChevronUp, CircleX, CheckCircle, Square } from "lucide-react"
import { Message } from 'ai/react';
import { GeneratedFile } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const modelCosts: { [key: string]: number } = {
    'gpt-4o': 1,
    'claude-3-opus-20240229': 3,
    'claude-3.5-sonnet-20240620': 2,
};

const modelDisplayNames: { [key: string]: string } = {
    'gpt-4o': 'GPT-4o',
    'claude-3-opus-20240229': 'Claude 3 Opus',
    'claude-3.5-sonnet-20240620': 'Claude 4',
};

interface ChatEntry {
    type: 'message' | 'log';
    content: string;
    author?: 'AI' | 'user';
    timestamp: string;
}

interface ChatPanelProps {
    messages: Message[];
    logs: string[];
    files: GeneratedFile[];
    isLoading: boolean;
    onSend: (message: string) => void;
    onAcceptAll: () => void;
    onRejectAll: () => void;
    onModelChange: (model: string) => void;
    selectedModel: string;
    isAutoMode: boolean;
    onAutoModeChange: (enabled: boolean) => void;
    onCancel: () => void;
}

export function ChatPanel({
    messages, logs, files, isLoading, onSend,
    onAcceptAll, onRejectAll, onModelChange, selectedModel,
    isAutoMode, onAutoModeChange, onCancel
}: ChatPanelProps) {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [combinedFeed, setCombinedFeed] = useState<ChatEntry[]>([]);

    useEffect(() => {
        const messageEntries: ChatEntry[] = messages.map(m => ({
            type: 'message',
            content: m.content,
            author: m.role === 'user' ? 'user' : 'AI',
            timestamp: m.createdAt?.toISOString() || new Date().toISOString()
        }));

        const logEntries: ChatEntry[] = logs.map(log => {
            const timestampMatch = log.match(/^\[(.*?)\]/);
            let timestamp;
            if (timestampMatch) {
                const parsedDate = new Date(timestampMatch[1]);
                if (!isNaN(parsedDate.getTime())) {
                    timestamp = parsedDate.toISOString();
                }
            }
            if (!timestamp) {
                timestamp = new Date().toISOString();
            }

            return {
                type: 'log',
                content: log,
                timestamp: timestamp
            }
        });

        const sortedFeed = [...messageEntries, ...logEntries].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        setCombinedFeed(sortedFeed);

    }, [messages, logs]);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [combinedFeed, isLoading]);

    const handleSendClick = () => {
        if (input.trim()) {
            onSend(input.trim());
            setInput("");
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendClick();
        }
    };

    const renderIcon = (entry: ChatEntry) => {
        if (entry.type === 'log') {
            return <Terminal className="h-5 w-5 text-gray-500" />;
        }
        return entry.author === 'AI' ? <Bot className="h-5 w-5 text-gray-500" /> : <User className="h-5 w-5 text-gray-500" />;
    };

    const editedFilesCount = files.filter(f => f.status === 'completed' || f.status === 'generating' || f.status === 'error').length;


    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg">
            {/* Message Display Area */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                {combinedFeed.map((entry, index) => (
                    <div key={index} className={`flex items-start space-x-3 ${entry.type === 'log' ? 'font-mono text-xs' : ''}`}>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            {renderIcon(entry)}
                        </div>
                        <div className={`p-3 rounded-lg ${entry.type === 'log' ? 'bg-gray-900 text-gray-200' : 'bg-gray-50 dark:bg-gray-700 border dark:border-gray-600'}`}>
                            <p className={`text-sm ${entry.type === 'log' ? '' : 'text-gray-800 dark:text-gray-200'}`}>{entry.content}</p>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <Bot className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border dark:border-gray-600 flex items-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Thinking...</p>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t dark:border-gray-700">
                <div className="bg-gray-900 text-gray-300 rounded-lg p-3 space-y-3 shadow-sm border border-gray-700">

                    {editedFilesCount > 0 && (
                        <div className="flex justify-between items-center text-sm px-2 py-1 bg-gray-800 rounded-md">
                            <span>Edited {editedFilesCount} files</span>
                            <div>
                                <Button variant="ghost" size="sm" onClick={onRejectAll}>
                                    <CircleX className="h-4 w-4 mr-1"/>
                                    Reject all
                                </Button>
                                <Button variant="ghost" size="sm" onClick={onAcceptAll}>
                                    <CheckCircle className="h-4 w-4 mr-1"/>
                                    Accept all
                                </Button>
                            </div>
                        </div>
                    )}

                    <Button variant="ghost" size="sm" className="w-full text-left justify-start">@ Add Context</Button>

                    <Textarea
                        placeholder="Plan, search, build anything"
                        className="border-none focus:ring-0 resize-none bg-transparent dark:text-white h-12 text-base"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="secondary" size="sm">
                                        <Bot className="h-4 w-4 mr-1"/>
                                        Agent
                                        <ChevronUp className="h-4 w-4 ml-1"/>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-60 z-50">
                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <h4 className="font-medium leading-none">Model</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Select the model to power the agent.
                                            </p>
                                        </div>
                                        <Select onValueChange={onModelChange} defaultValue={selectedModel}>
                                            <SelectTrigger>
                                                <SelectValue>
                                                    {`${modelDisplayNames[selectedModel]} (${modelCosts[selectedModel]} credit${modelCosts[selectedModel] > 1 ? 's' : ''})`}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(modelDisplayNames).map(([value, name]) => (
                                                    <SelectItem key={value} value={value}>
                                                        {`${name} (${modelCosts[value]} credit${modelCosts[value] > 1 ? 's' : ''})`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="secondary" size="sm">
                                        Auto
                                        <ChevronUp className="h-4 w-4 ml-1"/>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 z-50">
                                    <div className="flex items-center space-x-2">
                                        <Switch id="auto-mode" checked={isAutoMode} onCheckedChange={onAutoModeChange} />
                                        <Label htmlFor="auto-mode" className="flex flex-col">
                                            <span>Auto</span>
                                            <span className="text-xs text-muted-foreground">
                                                Balanced quality and speed, recommended for most tasks
                                            </span>
                                        </Label>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2 ml-12">Ctrl+/ for model menu</p>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="flex items-center">
                            <Button variant="ghost" size="icon" onClick={() => console.log('Attach file clicked')}>
                                <Paperclip className="h-5 w-5" />
                            </Button>
                            {isLoading ? (
                                <Button onClick={onCancel} size="icon" variant="destructive" className="bg-gray-700 hover:bg-gray-600">
                                    <Square className="h-5 w-5" />
                                </Button>
                            ) : (
                                <Button onClick={handleSendClick} disabled={!input} size="icon" className="bg-gray-700 hover:bg-gray-600">
                                    <Send className="h-5 w-5" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}