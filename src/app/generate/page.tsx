"use client"

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navigation } from '@/components/ui/navigation';
import { ArrowRight, Bot } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GeneratorWorkspace } from '@/components/ai/GeneratorWorkspace';
import { useUser } from '@/hooks/useUser';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

const allModels = {
  'gpt-4o': { name: 'GPT-4o', cost: 1, plans: ['FREE', 'PRO', 'PREMIUM'] },
  'claude-3-sonnet-20240229': { name: 'Claude 3 Sonnet', cost: 1, plans: ['FREE', 'PRO', 'PREMIUM'] },
  'claude-3-opus-20240229': { name: 'Claude 3 Opus', cost: 1, plans: ['PREMIUM'] },
};

export default function GeneratePage() {
    const { user } = useUser();
    const [view, setView] = useState('start');
    const [prompt, setPrompt] = useState('');
    const [selectedModel, setSelectedModel] = useState<keyof typeof allModels>('gpt-4o');

    const { connected } = useWallet();
    const { setVisible } = useWalletModal();

    useEffect(() => {
        if (!connected) {
            setVisible(true);
        }
    }, [connected, setVisible]);

    const handleGenerate = () => {
        if (prompt) {
            setView('generating');
        }
    };
    
    const availableModels = Object.entries(allModels).filter(([key, model]) => 
        user ? model.plans.includes(user.plan) : model.plans.includes('FREE')
    );

    if (view === 'generating') {
        return <GeneratorWorkspace prompt={prompt} model={selectedModel} />;
    }

    return (
        <div className="flex flex-col min-h-screen">
             <Navigation />
            <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-5xl font-bold mb-8">Ask AI Anything</h1>
                
                <div className="w-full max-w-2xl">
                    <div className="relative">
                        <Input
                            placeholder="What's the first rule of Fight Club?"
                            className="w-full rounded-full p-6 pr-20 text-lg shadow-md"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleGenerate();
                            }}
                        />
                        <Button 
                            type="submit" 
                            size="icon" 
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-gray-800 hover:bg-gray-900 text-white"
                            onClick={handleGenerate}
                            disabled={!prompt}
                        >
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="mt-6 flex justify-center items-center gap-4">
                         <div className="flex items-center gap-2 text-muted-foreground">
                            <Bot className="h-5 w-5" />
                            <span>Select Model:</span>
                        </div>
                        <Select value={selectedModel} onValueChange={(v) => setSelectedModel(v as keyof typeof allModels)}>
                            <SelectTrigger className="w-[250px]">
                                <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableModels.map(([key, { name }]) => (
                                    <SelectItem key={key} value={key}>
                                        {name} (1 credit)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </main>
        </div>
    );
} 