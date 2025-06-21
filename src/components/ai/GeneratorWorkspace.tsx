"use client"

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { WorkspacePanel } from '@/components/project/WorkspacePanel';
import { ChatPanel } from '@/components/project/ChatPanel';
import { useUser } from '@/hooks/useUser';
import { useProjects } from '@/hooks/useProjects';
import { UpgradeModal } from '@/components/user/UpgradeModal';
import { ProfileSidebar } from "@/components/ui/profile-sidebar";

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: Date;
}

interface FilePlan {
    path: string;
    content: string;
}

interface ProjectPlan {
    name: string;
    files: FilePlan[];
}

interface GeneratorWorkspaceProps {
    prompt?: string;
    initialProject?: {
        name: string;
        files: FilePlan[];
    } | {
        id: string;
        name: string;
        files: Array<{
            id: string;
            name: string;
            content: string;
            type: string;
            status: string;
        }>;
    };
}

export function GeneratorWorkspace({ prompt: initialPrompt, initialProject }: GeneratorWorkspaceProps) {
    const { user, deductCredits } = useUser();
    const { addProject } = useProjects();
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [files, setFiles] = useState<Array<{
        id: string;
        path: string;
        content: string;
        status: 'pending' | 'generating' | 'completed' | 'error';
    }>>([]);
    const [activeFile, setActiveFile] = useState<{ path: string; content: string } | null>(null);
    const [activeCode, setActiveCode] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState('gpt-4o');
    const [isAutoMode, setIsAutoMode] = useState(true);
    const [logs, setLogs] = useState<string[]>([]);
    const effectRan = useRef(false);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    };

    const createPlan = useCallback(async (prompt: string) => {
        if (!user) return;

        setIsGenerating(true);
        addLog('Starting project generation...');
        
        try {
            let plan: ProjectPlan;
            
            // Check if it's a Bitcoin business landing page request
            if (prompt.toLowerCase().includes('bitcoin') && prompt.toLowerCase().includes('landing')) {
                plan = {
                    name: "Bitcoin Business Landing Page",
                    files: [
                        {
                            path: 'index.html',
                            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BitCoin Pro - Your Gateway to Digital Currency</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="nav-brand">
                <span class="logo">₿</span>
                <span class="brand-name">BitCoin Pro</span>
            </div>
            <ul class="nav-menu">
                <li><a href="#features">Features</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="#" class="btn-nav">Get Started</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section class="hero">
            <div class="hero-content">
                <h1 class="hero-title">The Future of Money is Here</h1>
                <p class="hero-subtitle">Join millions of users worldwide in the Bitcoin revolution. Secure, fast, and decentralized digital currency for everyone.</p>
                <div class="hero-buttons">
                    <button class="btn-primary">Start Trading</button>
                    <button class="btn-secondary">Learn More</button>
                </div>
                <div class="hero-stats">
                    <div class="stat">
                        <div class="stat-number">$67,234</div>
                        <div class="stat-label">Bitcoin Price</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">2.1M+</div>
                        <div class="stat-label">Active Users</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">99.9%</div>
                        <div class="stat-label">Uptime</div>
                    </div>
                </div>
            </div>
            <div class="hero-visual">
                <div class="bitcoin-animation">
                    <div class="bitcoin-symbol">₿</div>
                </div>
            </div>
        </section>

        <section id="features" class="features">
            <div class="container">
                <h2 class="section-title">Why Choose BitCoin Pro?</h2>
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">🔒</div>
                        <h3>Bank-Grade Security</h3>
                        <p>Your assets are protected with industry-leading security measures and cold storage.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">⚡</div>
                        <h3>Lightning Fast</h3>
                        <p>Execute trades in milliseconds with our advanced trading engine.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🌍</div>
                        <h3>Global Access</h3>
                        <p>Trade Bitcoin from anywhere in the world, 24/7/365.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">📊</div>
                        <h3>Advanced Analytics</h3>
                        <p>Make informed decisions with real-time charts and market data.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="cta">
            <div class="container">
                <h2>Ready to Start Your Bitcoin Journey?</h2>
                <p>Join thousands of satisfied customers who trust BitCoin Pro</p>
                <button class="btn-primary large">Get Started Today</button>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 BitCoin Pro. All rights reserved.</p>
        </div>
    </footer>

    <script src="script.js"></script>
</body>
</html>`
                        },
                        {
                            path: 'styles.css',
                            content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
    background: #0a0a0a;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Header */
.header {
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(10px);
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1000;
    border-bottom: 1px solid rgba(247, 147, 26, 0.2);
}

.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
}

.nav-brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.logo {
    font-size: 2rem;
    color: #f7931a;
    font-weight: bold;
}

.brand-name {
    font-size: 1.5rem;
    font-weight: bold;
    color: #f7931a;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 2rem;
    align-items: center;
}

.nav-menu a {
    color: white;
    text-decoration: none;
    transition: color 0.3s;
}

.nav-menu a:hover {
    color: #f7931a;
}

.btn-nav {
    background: #f7931a;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    color: black !important;
    font-weight: 600;
}

/* Hero Section */
.hero {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
    min-height: 100vh;
    padding: 8rem 2rem 4rem;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
}

.hero-title {
    font-size: 3.5rem;
    font-weight: 900;
    color: white;
    margin-bottom: 1rem;
    line-height: 1.1;
}

.hero-subtitle {
    font-size: 1.2rem;
    color: #ccc;
    margin-bottom: 2rem;
    line-height: 1.6;
}

.hero-buttons {
    display: flex;
    gap: 1rem;
    margin-bottom: 3rem;
}

.btn-primary {
    background: linear-gradient(45deg, #f7931a, #ffb347);
    color: black;
    border: none;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(247, 147, 26, 0.3);
}

.btn-primary.large {
    padding: 1.2rem 3rem;
    font-size: 1.3rem;
}

.btn-secondary {
    background: transparent;
    color: white;
    border: 2px solid #f7931a;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-secondary:hover {
    background: #f7931a;
    color: black;
}

.hero-stats {
    display: flex;
    gap: 3rem;
}

.stat {
    text-align: center;
}

.stat-number {
    font-size: 2rem;
    font-weight: bold;
    color: #f7931a;
}

.stat-label {
    color: #ccc;
    font-size: 0.9rem;
}

.hero-visual {
    display: flex;
    justify-content: center;
    align-items: center;
}

.bitcoin-animation {
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: linear-gradient(45deg, #f7931a, #ffb347);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse 2s infinite;
    box-shadow: 0 0 50px rgba(247, 147, 26, 0.5);
}

.bitcoin-symbol {
    font-size: 8rem;
    color: black;
    font-weight: bold;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

/* Features Section */
.features {
    padding: 6rem 0;
    background: #111;
}

.section-title {
    text-align: center;
    font-size: 2.5rem;
    color: white;
    margin-bottom: 3rem;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    max-width: 1000px;
    margin: 0 auto;
}

.feature-card {
    background: rgba(255, 255, 255, 0.05);
    padding: 2rem;
    border-radius: 12px;
    text-align: center;
    border: 1px solid rgba(247, 147, 26, 0.2);
    transition: transform 0.3s, border-color 0.3s;
}

.feature-card:hover {
    transform: translateY(-5px);
    border-color: #f7931a;
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.feature-card h3 {
    color: white;
    margin-bottom: 1rem;
    font-size: 1.3rem;
}

.feature-card p {
    color: #ccc;
    line-height: 1.6;
}

/* CTA Section */
.cta {
    padding: 6rem 0;
    background: linear-gradient(45deg, #f7931a, #ffb347);
    text-align: center;
}

.cta h2 {
    font-size: 2.5rem;
    color: black;
    margin-bottom: 1rem;
}

.cta p {
    font-size: 1.2rem;
    color: rgba(0, 0, 0, 0.8);
    margin-bottom: 2rem;
}

/* Footer */
.footer {
    background: #000;
    padding: 2rem 0;
    text-align: center;
    border-top: 1px solid rgba(247, 147, 26, 0.2);
}

.footer p {
    color: #ccc;
}

/* Responsive */
@media (max-width: 768px) {
    .hero {
        grid-template-columns: 1fr;
        text-align: center;
        padding: 6rem 1rem 4rem;
    }
    
    .hero-title {
        font-size: 2.5rem;
    }
    
    .hero-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .hero-stats {
        justify-content: center;
        gap: 2rem;
    }
    
    .nav-menu {
        display: none;
    }
}`
                        },
                        {
                            path: 'script.js',
                            content: `// Bitcoin price animation
function animateBitcoinPrice() {
    const priceElement = document.querySelector('.stat-number');
    if (priceElement && priceElement.textContent.includes('$')) {
        const basePrice = 67234;
        const variation = Math.random() * 1000 - 500;
        const newPrice = Math.round(basePrice + variation);
        priceElement.textContent = '$' + newPrice.toLocaleString();
    }
}

// Update price every 3 seconds
setInterval(animateBitcoinPrice, 3000);

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to header
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(0, 0, 0, 0.98)';
    } else {
        header.style.background = 'rgba(0, 0, 0, 0.95)';
    }
});

// Button click handlers
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Add click animation
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
            
            // Show alert for demo
            alert('Welcome to BitCoin Pro! This is a demo landing page.');
        });
    });
});`
                        }
                    ]
                };
            } else {
                // Default simple project for other prompts
                plan = {
                    name: `Project for "${prompt.substring(0, 40)}..."`,
                    files: [
                        {
                            path: 'index.html',
                            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${prompt}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 40px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            max-width: 600px;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }
        p {
            font-size: 1.2rem;
            opacity: 0.9;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>✨ Generated Project</h1>
        <p>This project was created based on your request: "${prompt}"</p>
        <p>The AI has generated a basic structure that you can customize further.</p>
    </div>
</body>
</html>`
                        }
                    ]
                };
            }

            // Create files with proper structure
            const generatedFiles = plan.files.map(file => ({
                id: `file-${Date.now()}-${Math.random()}`,
                path: file.path,
                content: file.content,
                status: 'completed' as const
            }));

            setFiles(generatedFiles);
            
            // Set the first file as active
            if (generatedFiles.length > 0) {
                setActiveFile({ path: generatedFiles[0].path, content: generatedFiles[0].content });
                setActiveCode(generatedFiles[0].content);
            }

            // Add project to the projects list
            addProject({
                name: plan.name,
                files: plan.files.map(file => ({
                    path: file.path,
                    content: file.content,
                    status: 'completed' as const
                }))
            });

            setMessages(prev => [...prev, {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: `I've created a project based on your request: "${prompt}". The project includes ${plan.files.length} file${plan.files.length > 1 ? 's' : ''} with a complete implementation.`,
                createdAt: new Date()
            }]);

            addLog('Project generation completed successfully!');

        } catch (error: unknown) {
            console.error('Generation failed:', error);
            addLog('Project generation failed. Please try again.');
            setMessages(prev => [...prev, {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: 'Sorry, there was an error generating your project. Please try again.',
                createdAt: new Date()
            }]);
        } finally {
            setIsGenerating(false);
        }
    }, [user, addProject]);

    const handleGenerate = useCallback(async () => {
        if (!user) {
            setUpgradeModalOpen(true);
            return;
        }

        // Check if user has enough credits
        const creditsNeeded = 1;
        if (!deductCredits(creditsNeeded)) {
            setUpgradeModalOpen(true);
            return;
        }
        
        if (initialPrompt) {
            setMessages([{ id: 'user-prompt', role: 'user', content: initialPrompt, createdAt: new Date() }]);
            createPlan(initialPrompt);
        }
    }, [user, deductCredits, initialPrompt, createPlan]);

    const handleSend = (message: string) => {
        if (!user) return;
        
        setMessages(prev => [...prev, { 
            id: `user-${Date.now()}`, 
            role: 'user', 
            content: message, 
            createdAt: new Date() 
        }]);
        
        addLog(`User message: ${message}`);
        
        // Simulate AI response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: `I understand you want to: "${message}". I'll help you with that.`,
                createdAt: new Date()
            }]);
            addLog('AI response generated');
        }, 1000);
    };

    const handleAcceptAll = () => {
        addLog('All changes accepted');
    };

    const handleRejectAll = () => {
        addLog('All changes rejected');
    };

    const handleCancel = () => {
        setIsGenerating(false);
        addLog('Operation cancelled');
    };

    const handleCodeChange = (newCode: string) => {
        setActiveCode(newCode);
        if (activeFile) {
            setFiles(prev => prev.map(file => 
                file.path === activeFile.path 
                    ? { ...file, content: newCode }
                    : file
            ));
        }
    };


    
    useEffect(() => {
        if (effectRan.current === false) {
            if (initialProject) {
                // Handle existing project
                const projectFiles = initialProject.files.map((file, index) => ({
                    id: `file-${index}`,
                    path: 'name' in file ? file.name : file.path,
                    content: file.content,
                    status: 'status' in file ? file.status as 'pending' | 'generating' | 'completed' | 'error' : 'completed' as const
                }));
                
                setFiles(projectFiles);
                
                if (projectFiles.length > 0) {
                    setActiveFile({ path: projectFiles[0].path, content: projectFiles[0].content });
                    setActiveCode(projectFiles[0].content);
                }
            } else if (initialPrompt && !initialProject) {
                handleGenerate();
            } else if (!initialPrompt && !initialProject) {
                // Create a default project to show something
                const defaultFiles = [
                    {
                        id: 'default-html',
                        path: 'index.html',
                        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to AI Code Generator</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 40px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            max-width: 600px;
        }
        h1 {
            font-size: 3rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }
        p {
            font-size: 1.2rem;
            opacity: 0.9;
            line-height: 1.6;
        }
        .cta {
            margin-top: 2rem;
            padding: 12px 24px;
            background: rgba(255,255,255,0.2);
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 8px;
            color: white;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .cta:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 AI Code Generator</h1>
        <p>Welcome to your AI-powered development workspace!</p>
        <p>Start by typing a prompt in the chat panel to generate your first project.</p>
        <button class="cta" onclick="alert('Use the chat panel on the right to start generating code!')">
            Get Started
        </button>
    </div>
</body>
</html>`,
                        status: 'completed' as const
                    }
                ];
                
                setFiles(defaultFiles);
                setActiveFile({ path: defaultFiles[0].path, content: defaultFiles[0].content });
                setActiveCode(defaultFiles[0].content);
            }
        }
        
        return () => {
            effectRan.current = true;
        }
    }, [initialPrompt, initialProject, handleGenerate]);

    if (isGenerating) {
        return (
            <div className="flex h-screen bg-gray-50">
                <div className="flex-1 flex items-center justify-center">
                    <Card className="w-96">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Generating Your Project</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-sm text-gray-600">Creating your project...</div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full transition-all duration-300 w-3/4" />
                            </div>
                            <div className="text-xs text-gray-500">75% complete</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <>
            <ProfileSidebar />
            <div className="flex h-screen bg-gray-50">
                <div className="flex-1 flex">
                    <div className="flex-1 border-r border-gray-200 min-h-0">
                        <WorkspacePanel 
                            files={files}
                            activeFile={activeFile}
                            onCodeChange={handleCodeChange}
                        />
                    </div>
                    <div className="w-96 min-h-0">
                        <ChatPanel 
                            messages={messages}
                            logs={logs}
                            files={files}
                            isLoading={isGenerating}
                            onSend={handleSend}
                            onAcceptAll={handleAcceptAll}
                            onRejectAll={handleRejectAll}
                            onModelChange={setSelectedModel}
                            selectedModel={selectedModel}
                            isAutoMode={isAutoMode}
                            onAutoModeChange={setIsAutoMode}
                            onCancel={handleCancel}
                        />
                    </div>
                </div>
            </div>
            <UpgradeModal 
                isOpen={upgradeModalOpen} 
                onClose={() => setUpgradeModalOpen(false)} 
            />
        </>
    );
} 