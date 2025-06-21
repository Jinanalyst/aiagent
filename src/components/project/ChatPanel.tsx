"use client"
import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Send, Paperclip, Mic, Bot, User, Terminal } from "lucide-react"
import { Message } from 'ai/react';

interface ChatEntry {
    type: 'message' | 'log';
    content: string;
    author?: 'AI' | 'user';
    timestamp: string;
}

interface ChatPanelProps {
    messages: Message[];
    logs: string[];
    isLoading: boolean;
    onSend: (message: string) => void;
}

export function ChatPanel({ messages, logs, isLoading, onSend }: ChatPanelProps) {
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
                // Check if the parsed date is valid
                if (!isNaN(parsedDate.getTime())) {
                    timestamp = parsedDate.toISOString();
                }
            }
            // Fallback to current date if no valid timestamp is found
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

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Message Display Area */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {combinedFeed.map((entry, index) => (
                  <div key={index} className={`flex items-start space-x-3 ${entry.type === 'log' ? 'font-mono text-xs' : ''}`}>
                     <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        {renderIcon(entry)}
                     </div>
                     <div className={`p-3 rounded-lg ${entry.type === 'log' ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 border'}`}>
                        <p className={`text-sm ${entry.type === 'log' ? '' : 'text-gray-800'}`}>{entry.content}</p>
                     </div>
                  </div>
                ))}
                
                {isLoading && (
                     <div className="flex items-start space-x-3">
                         <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <Bot className="h-5 w-5 text-gray-500" />
                         </div>
                         <div className="p-3 rounded-lg bg-gray-50 border flex items-center">
                            <p className="text-sm text-gray-500">Thinking...</p>
                         </div>
                     </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t">
                <div className="bg-white rounded-lg p-3 space-y-3 shadow-sm border">
                    <Textarea
                        placeholder="Ask a follow-up or describe a new task..."
                        className="border-none focus:ring-0 resize-none"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                                <Paperclip className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Mic className="h-5 w-5" />
                            </Button>
                        </div>
                        <Button onClick={handleSendClick} disabled={!input || isLoading}>
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
} 