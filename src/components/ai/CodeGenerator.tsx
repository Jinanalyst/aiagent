"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@solana/wallet-adapter-react";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const models = {
  'gpt-4o': { name: 'GPT-4o', cost: 1 },
  'claude-3-sonnet-20240229': { name: 'Claude 3 Sonnet', cost: 2 },
  'claude-3-opus-20240229': { name: 'Claude 3 Opus', cost: 3 },
};

interface CodeGeneratorProps {
  initialPrompt?: string;
  initialModel?: keyof typeof models;
}

export function CodeGenerator({ initialPrompt = "", initialModel = 'gpt-4o' }: CodeGeneratorProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [generatedCode, setGeneratedCode] = useState("");
  const [activeTab, setActiveTab] = useState("html");
  const [loading, setLoading] = useState(false);
  const { publicKey } = useWallet();
  const supabase = createClient();

  const [credits, setCredits] = useState(0);
  const [selectedModel, setSelectedModel] = useState<keyof typeof models>(initialModel);

  useEffect(() => {
    async function fetchCredits() {
      if (!publicKey) return;
      const { data, error } = await supabase
        .from('users')
        .select('credits')
        .eq('walletAddress', publicKey.toBase58())
        .single();
      
      if (data) setCredits(data.credits);
    }
    fetchCredits();
  }, [publicKey, supabase]);

  const handleGenerate = async () => {
    if (!prompt || !publicKey) return;

    setLoading(true);
    setGeneratedCode("");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, walletAddress: publicKey.toBase58(), model: selectedModel }),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedCode(data.completion);
        const modelCost = models[selectedModel].cost;
        setCredits(prev => prev - modelCost);
      } else {
        setGeneratedCode(`Error: ${data.error}`);
      }
    } catch (error: unknown) {
      console.error('Generation failed:', error);
      setGeneratedCode("Error: Failed to generate code. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const creditsRequired = models[selectedModel].cost;
  const hasInsufficientCredits = credits < creditsRequired;

  return (
    <div className="space-y-6">
       <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 space-y-2">
                <label htmlFor="prompt" className="font-medium">Enter your prompt</label>
                <Textarea
                    id="prompt"
                    placeholder="e.g., A responsive hero section with a centered call-to-action button"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px]"
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="model" className="font-medium">Select Model</label>
                <Select value={selectedModel} onValueChange={(v) => setSelectedModel(v as keyof typeof models)}>
                    <SelectTrigger id="model">
                        <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(models).map(([key, { name, cost }]) => (
                            <SelectItem key={key} value={key}>
                                {name} ({cost} credit{cost > 1 ? 's' : ''})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>

          {hasInsufficientCredits && (
             <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Insufficient Credits</AlertTitle>
              <AlertDescription>
                You need {creditsRequired} credits to use {models[selectedModel].name}, but you only have {credits}. Please upgrade your plan or purchase more credits.
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={handleGenerate} disabled={loading || !prompt || hasInsufficientCredits}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Generate"}
          </Button>
        </CardContent>
      </Card>
      
      {generatedCode && (
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex justify-between items-center px-4 py-2 border-b">
                <TabsList>
                  <TabsTrigger value="html">HTML</TabsTrigger>
                </TabsList>
                <Badge variant="secondary">Preview</Badge>
              </div>
              <TabsContent value="html">
                <pre className="p-4 text-sm overflow-x-auto">
                  <code>{generatedCode}</code>
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 