"use client"
import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Send, Paperclip, Bot, User, Terminal, ChevronUp, CircleX, CheckCircle, Square, FileIcon, Loader2, Code, Zap } from "lucide-react"
import { Message } from 'ai/react';
import { GeneratedFile, FileChange } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const modelCosts: { [key: string]: number } = {
    'gpt-4o': 1,
    'claude-3-opus-20240229': 3,
    'claude-3.5-sonnet-20240620': 2,
    'claude-3-5-sonnet-20241022': 2,
    'claude-3-5-haiku-20241022': 1,
};

const modelDisplayNames: { [key: string]: string } = {
    'gpt-4o': 'GPT-4o',
    'claude-3-opus-20240229': 'Claude 3 Opus',
    'claude-3.5-sonnet-20240620': 'Claude 3.5 Sonnet',
    'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet (New)',
    'claude-3-5-haiku-20241022': 'Claude 3.5 Haiku',
};

interface ChatEntry {
    type: 'message' | 'log' | 'progress';
    content: string;
    author?: 'AI' | 'user';
    timestamp: string;
    fileName?: string;
    progress?: number;
    isTyping?: boolean;
}

interface ChatPanelProps {
    messages: Message[];
    logs: string[];
    files: GeneratedFile[];
    fileChanges: FileChange[];
    isLoading: boolean;
    onSend: (message: string) => void;
    onAcceptAll: () => void;
    onRejectAll: () => void;
    onOpenChangeManager: () => void;
    onModelChange: (model: string) => void;
    selectedModel: string;
    isAutoMode: boolean;
    onAutoModeChange: (enabled: boolean) => void;
    onCancel: () => void;
}

export function ChatPanel({
    messages, logs, files, fileChanges, isLoading, onSend,
    onAcceptAll, onRejectAll, onOpenChangeManager, onModelChange, selectedModel,
    isAutoMode, onAutoModeChange, onCancel
}: ChatPanelProps) {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [combinedFeed, setCombinedFeed] = useState<ChatEntry[]>([]);
    const [typingText, setTypingText] = useState("");
    const [currentProgress, setCurrentProgress] = useState(0);
    const [progressSteps] = useState([
        { step: 1, label: "Analyzing requirements", progress: 20 },
        { step: 2, label: "Planning file structure", progress: 40 },
        { step: 3, label: "Generating code", progress: 60 },
        { step: 4, label: "Applying changes", progress: 80 },
        { step: 5, label: "Finalizing files", progress: 100 }
    ]);

    // Simulate progress when loading
    useEffect(() => {
        if (isLoading) {
            setCurrentProgress(0);
            const progressInterval = setInterval(() => {
                setCurrentProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(progressInterval);
                        return 100;
                    }
                    return prev + 2;
                });
            }, 100);

            return () => clearInterval(progressInterval);
        }
    }, [isLoading]);

    // Typing effect for AI responses
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant' && !isLoading) {
            setTypingText("");
            const text = lastMessage.content;
            let i = 0;
            
            const typingInterval = setInterval(() => {
                if (i < text.length) {
                    setTypingText(prev => prev + text[i]);
                    i++;
                } else {
                    clearInterval(typingInterval);
                }
            }, 20);

            return () => clearInterval(typingInterval);
        }
    }, [messages, isLoading]);

    useEffect(() => {
        const messageEntries: ChatEntry[] = messages.map(m => ({
            type: 'message',
            content: m.content,
            author: m.role === 'user' ? 'user' : 'AI',
            timestamp: m.createdAt?.toISOString() || new Date().toISOString(),
            isTyping: m.role === 'assistant' && !isLoading
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

        // Add progress entries when generating
        const progressEntries: ChatEntry[] = files
            .filter(f => f.status === 'generating' || f.status === 'completed')
            .map(file => ({
                type: 'progress',
                content: `${file.status === 'completed' ? 'Generated' : 'Generating'} ${file.path}`,
                timestamp: new Date().toISOString(),
                fileName: file.path,
                progress: file.status === 'completed' ? 100 : currentProgress
            }));

        const sortedFeed = [...messageEntries, ...logEntries, ...progressEntries]
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        setCombinedFeed(sortedFeed);

    }, [messages, logs, files, currentProgress, isLoading]);


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
        if (entry.type === 'progress') {
            return entry.progress === 100 ? 
                <CheckCircle className="h-5 w-5 text-green-500" /> : 
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
        }
        if (entry.type === 'log') {
            return <Terminal className="h-5 w-5 text-gray-500" />;
        }
        return entry.author === 'AI' ? <Bot className="h-5 w-5 text-gray-500" /> : <User className="h-5 w-5 text-gray-500" />;
    };

    const getCurrentProgressStep = () => {
        return progressSteps.find(step => currentProgress >= step.progress - 20 && currentProgress < step.progress) 
            || progressSteps[progressSteps.length - 1];
    };

    const pendingChangesCount = fileChanges.filter(c => c.status === 'pending').length;
    const editedFilesCount = files.filter(f => f.status === 'completed' || f.status === 'generating' || f.status === 'error').length;

    const renderProgressBar = (progress: number) => (
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progress}%` }}
            />
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg">
            {/* Message Display Area */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                {combinedFeed.map((entry, index) => (
                    <div key={index} className={`flex items-start space-x-3 ${entry.type === 'log' ? 'font-mono text-xs' : ''}`}>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            {renderIcon(entry)}
                        </div>
                        <div className={`flex-1 p-3 rounded-lg ${
                            entry.type === 'log' 
                                ? 'bg-gray-900 text-gray-200' 
                                : entry.type === 'progress'
                                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                : 'bg-gray-50 dark:bg-gray-700 border dark:border-gray-600'
                        }`}>
                            {entry.type === 'progress' ? (
                                <div>
                                    <div className="flex items-center gap-2">
                                        <FileIcon className="h-4 w-4 text-blue-500" />
                                        <span className="font-medium text-sm">{entry.content}</span>
                                    </div>
                                    {entry.progress !== undefined && renderProgressBar(entry.progress)}
                                </div>
                            ) : entry.isTyping ? (
                                <p className="text-sm text-gray-800 dark:text-gray-200">
                                    {typingText}
                                    <span className="animate-pulse">|</span>
                                </p>
                            ) : (
                                <p className={`text-sm ${entry.type === 'log' ? '' : 'text-gray-800 dark:text-gray-200'}`}>
                                    {entry.content}
                                </p>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <>
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <Bot className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="flex-1 p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border dark:border-gray-600">
                                <div className="flex items-center gap-2">
                                    <Code className="h-4 w-4 text-blue-500" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {getCurrentProgressStep().label}...
                                    </p>
                                </div>
                                {renderProgressBar(currentProgress)}
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-gray-500">
                                        Step {getCurrentProgressStep().step} of {progressSteps.length}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {currentProgress}%
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        {files.filter(f => f.status === 'generating').map((file, index) => (
                            <div key={index} className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    <Zap className="h-5 w-5 text-yellow-500" />
                                </div>
                                <div className="flex-1 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                                    <div className="flex items-center gap-2">
                                        <FileIcon className="h-4 w-4 text-yellow-600" />
                                        <span className="text-sm font-medium">Writing {file.path}</span>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                        <div className="flex gap-1">
                                            <span className="animate-pulse">●</span>
                                            <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</span>
                                            <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t dark:border-gray-700">
                <div className="bg-gray-900 text-gray-300 rounded-lg p-3 space-y-3 shadow-sm border border-gray-700">

                    {(pendingChangesCount > 0 || editedFilesCount > 0) && (
                        <div className="flex justify-between items-center text-sm px-2 py-1 bg-gray-800 rounded-md">
                            <div className="flex items-center gap-2">
                                <span>
                                    {pendingChangesCount > 0 
                                        ? `${pendingChangesCount} pending change${pendingChangesCount !== 1 ? 's' : ''}`
                                        : `${editedFilesCount} file${editedFilesCount !== 1 ? 's' : ''} edited`
                                    }
                                </span>
                                {pendingChangesCount > 0 && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={onOpenChangeManager}
                                        className="text-blue-400 hover:text-blue-300 px-2 py-1 h-auto text-xs"
                                    >
                                        View Details
                                    </Button>
                                )}
                            </div>
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
                        disabled={isLoading}
                    />
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="secondary" size="sm" disabled={isLoading}>
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
                                    <Button variant="secondary" size="sm" disabled={isLoading}>
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
                            <Button variant="ghost" size="icon" onClick={() => console.log('Attach file clicked')} disabled={isLoading}>
                                <Paperclip className="h-5 w-5" />
                            </Button>
                            {isLoading ? (
                                <Button onClick={onCancel} size="icon" variant="destructive" className="bg-gray-700 hover:bg-gray-600">
                                    <Square className="h-5 w-5" />
                                </Button>
                            ) : (
                                <Button onClick={handleSendClick} disabled={!input || isLoading} size="icon" className="bg-gray-700 hover:bg-gray-600">
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