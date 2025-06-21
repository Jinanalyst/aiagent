"use client"

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { WorkspacePanel } from '@/components/project/WorkspacePanel';
import { ChatPanel } from '@/components/project/ChatPanel';
import { ChangeManager } from '@/components/project/ChangeManager';
import { useUser } from '@/hooks/useUser';
import { useProjects } from '@/hooks/useProjects';
import { UpgradeModal } from '@/components/user/UpgradeModal';
import { ProfileSidebar } from "@/components/ui/profile-sidebar";
import { FileChange, ChangeSession } from '@/types';

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
    
    // Change tracking state
    const [fileChanges, setFileChanges] = useState<FileChange[]>([]);
    const [currentSession, setCurrentSession] = useState<ChangeSession | null>(null);
    const [showChangeManager, setShowChangeManager] = useState(false);
    const [originalFiles, setOriginalFiles] = useState<Map<string, string>>(new Map());

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    };

    // Change tracking functions
    const createChangeSession = () => {
        const session: ChangeSession = {
            id: `session-${Date.now()}`,
            changes: [],
            status: 'active',
            createdAt: new Date()
        };
        setCurrentSession(session);
        return session;
    };

    const trackFileChange = (filePath: string, newContent: string, changeType: 'created' | 'modified' | 'deleted', description?: string) => {
        const originalContent = originalFiles.get(filePath) || '';
        
        // Don't track if content is the same
        if (originalContent === newContent && changeType === 'modified') {
            return;
        }

        const change: FileChange = {
            id: `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            filePath,
            originalContent,
            modifiedContent: newContent,
            changeType,
            status: 'pending',
            timestamp: new Date(),
            description
        };

        setFileChanges(prev => {
            // Remove any existing pending changes for this file
            const filtered = prev.filter(c => c.filePath !== filePath || c.status !== 'pending');
            return [...filtered, change];
        });

        // Update the current session
        if (currentSession) {
            setCurrentSession(prev => prev ? {
                ...prev,
                changes: [...prev.changes.filter(c => c.filePath !== filePath || c.status !== 'pending'), change]
            } : null);
        }
    };

    const acceptChange = (changeId: string) => {
        setFileChanges(prev => prev.map(change => 
            change.id === changeId 
                ? { ...change, status: 'accepted' as const }
                : change
        ));

        // Apply the change to the actual files
        const change = fileChanges.find(c => c.id === changeId);
        if (change) {
            setFiles(prev => prev.map(file => 
                file.path === change.filePath 
                    ? { ...file, content: change.modifiedContent }
                    : file
            ));

            // Update active file if it's the one being changed
            if (activeFile && activeFile.path === change.filePath) {
                setActiveFile({ ...activeFile, content: change.modifiedContent });
                setActiveCode(change.modifiedContent);
            }

            // Update original content for future changes
            setOriginalFiles(prev => new Map(prev.set(change.filePath, change.modifiedContent)));
            
            addLog(`Accepted changes to ${change.filePath}`);
        }
    };

    const rejectChange = (changeId: string) => {
        setFileChanges(prev => prev.map(change => 
            change.id === changeId 
                ? { ...change, status: 'rejected' as const }
                : change
        ));

        const change = fileChanges.find(c => c.id === changeId);
        if (change) {
            addLog(`Rejected changes to ${change.filePath}`);
        }
    };

    const acceptAllChanges = () => {
        const pendingChanges = fileChanges.filter(c => c.status === 'pending');
        
        pendingChanges.forEach(change => {
            acceptChange(change.id);
        });

        setShowChangeManager(false);
        addLog(`Accepted all ${pendingChanges.length} pending changes`);
    };

    const rejectAllChanges = () => {
        const pendingChanges = fileChanges.filter(c => c.status === 'pending');
        
        setFileChanges(prev => prev.map(change => 
            change.status === 'pending' 
                ? { ...change, status: 'rejected' as const }
                : change
        ));

        setShowChangeManager(false);
        addLog(`Rejected all ${pendingChanges.length} pending changes`);
    };

    const createPlan = useCallback(async (prompt: string) => {
        if (!user) return;

        setIsGenerating(true);
        addLog('Starting project generation...');
        
        try {
            let plan: ProjectPlan;
            
            // Check if it's a Bitcoin business landing page request
            if (prompt.toLowerCase().includes('bitcoin') && (prompt.toLowerCase().includes('landing') || prompt.toLowerCase().includes('business'))) {
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
            } else if (prompt.toLowerCase().includes('react') || prompt.toLowerCase().includes('component')) {
                // React project structure
                plan = {
                    name: "React Application",
                    files: [
                        {
                            path: 'src/App.tsx',
                            content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to React</h1>
        <p>This is your new React application!</p>
      </header>
    </div>
  );
}

export default App;`
                        },
                        {
                            path: 'src/App.css',
                            content: `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.2rem;
  opacity: 0.9;
}`
                        },
                        {
                            path: 'src/index.tsx',
                            content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
                        },
                        {
                            path: 'public/index.html',
                            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React App</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>`
                        }
                    ]
                };
            } else if (prompt.toLowerCase().includes('api') || prompt.toLowerCase().includes('server') || prompt.toLowerCase().includes('backend')) {
                // Node.js API project structure
                plan = {
                    name: "Node.js API Server",
                    files: [
                        {
                            path: 'src/server.js',
                            content: `const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to your API server!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`
                        },
                        {
                            path: 'package.json',
                            content: `{
  "name": "api-server",
  "version": "1.0.0",
  "description": "Node.js API server",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}`
                        },
                        {
                            path: 'src/routes/api.js',
                            content: `const express = require('express');
const router = express.Router();

// GET /api/users
router.get('/users', (req, res) => {
  res.json([
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ]);
});

// POST /api/users
router.post('/users', (req, res) => {
  const { name, email } = req.body;
  const newUser = { id: Date.now(), name, email };
  res.status(201).json(newUser);
});

module.exports = router;`
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

            // Create files with streaming generation effect
            const streamFiles = async () => {
                // Initialize empty files
                const generatedFiles = plan.files.map(file => ({
                    id: `file-${Date.now()}-${Math.random()}`,
                    path: file.path,
                    content: '',
                    status: 'generating' as const
                }));
                
                setFiles(generatedFiles);
                
                // Set the first file as active immediately
                if (generatedFiles.length > 0) {
                    setActiveFile({ path: generatedFiles[0].path, content: '' });
                    setActiveCode('');
                }
                
                addLog(`Generating ${plan.files.length} files...`);
                
                // Stream each file's content progressively
                for (let i = 0; i < plan.files.length; i++) {
                    const file = plan.files[i];
                    addLog(`Writing ${file.path}...`);
                    
                    // Simulate typing effect for the active file
                    if (i === 0) {
                        await streamCodeToActiveFile(file.content);
                    }
                    
                    // Track the newly generated file as a change
                    trackFileChange(file.path, file.content, 'created', `AI generated file: ${file.path}`);
                    
                    // Update file status to completed
                    setFiles(prev => prev.map(f => 
                        f.path === file.path 
                            ? { ...f, content: file.content, status: 'completed' as const }
                            : f
                    ));
                    
                    // Small delay between files
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
                addLog('All files generated successfully!');
                
                // Create a change session for the generated files
                if (!currentSession) {
                    createChangeSession();
                }
                
                // Show change manager for newly generated files
                setShowChangeManager(true);
            };
            
            // Function to stream code into the active editor
            const streamCodeToActiveFile = async (fullContent: string) => {
                const words = fullContent.split(' ');
                let currentContent = '';
                
                for (let i = 0; i < words.length; i++) {
                    currentContent += (i > 0 ? ' ' : '') + words[i];
                    setActiveCode(currentContent);
                    setActiveFile(prev => prev ? { ...prev, content: currentContent } : null);
                    
                    // Variable typing speed - faster for whitespace, slower for complex syntax
                    const delay = words[i].includes('<') || words[i].includes('{') || words[i].includes('(') ? 30 : 10;
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            };
            
            await streamFiles();

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
                content: `I've created a project based on your request: "${prompt}". The project includes ${plan.files.length} file${plan.files.length > 1 ? 's' : ''} with a complete implementation. You can see the code being generated in real-time in the editor!`,
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

    const handleSend = async (message: string) => {
        if (!user) return;
        
        setMessages(prev => [...prev, { 
            id: `user-${Date.now()}`, 
            role: 'user', 
            content: message, 
            createdAt: new Date() 
        }]);
        
        addLog(`User message: ${message}`);
        setIsGenerating(true);
        
        try {
            // Simulate AI processing time
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check if user is asking for code modifications
            const isCodeRequest = message.toLowerCase().includes('add') || 
                                message.toLowerCase().includes('create') ||
                                message.toLowerCase().includes('modify') ||
                                message.toLowerCase().includes('change') ||
                                message.toLowerCase().includes('update') ||
                                message.toLowerCase().includes('build') ||
                                message.toLowerCase().includes('make');
            
            if (isCodeRequest && files.length > 0) {
                // Simulate code modification
                addLog('Analyzing request...');
                await new Promise(resolve => setTimeout(resolve, 500));
                
                addLog('Generating code changes...');
                
                // Create a simple modification to show the effect
                if (activeFile) {
                    const modifiedContent = activeFile.content + `\n\n<!-- Added based on user request: ${message} -->
<div class="user-request-addition" style="padding: 20px; margin: 20px 0; background: #f0f8ff; border-left: 4px solid #007acc; border-radius: 4px;">
    <h3>✨ New Feature Added</h3>
    <p>This section was generated based on your request: "${message}"</p>
    <p>The AI has analyzed your request and added this enhancement to improve the project.</p>
</div>`;
                    
                    // Update the active file with streaming effect
                    await streamCodeUpdate(modifiedContent);
                    
                    // Track the AI-generated change
                    trackFileChange(activeFile.path, modifiedContent, 'modified', `AI modification: ${message}`);
                    
                    // Create a change session if none exists
                    if (!currentSession) {
                        createChangeSession();
                    }
                    
                    // Update files state
                    setFiles(prev => prev.map(file => 
                        file.path === activeFile.path 
                            ? { ...file, content: modifiedContent, status: 'completed' as const }
                            : file
                    ));
                    
                    // Show change manager for AI-generated changes
                    setShowChangeManager(true);
                }
                
                setMessages(prev => [...prev, {
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: `I've implemented your request: "${message}". The code has been updated and you can see the changes in the editor. The new functionality has been added to enhance your project!`,
                    createdAt: new Date()
                }]);
                
                addLog('Code changes applied successfully!');
            } else {
                // Regular chat response
                setMessages(prev => [...prev, {
                    id: `assistant-${Date.now()}`,
                    role: 'assistant',
                    content: `I understand you want to: "${message}". I can help you with code generation, modifications, and project enhancements. Try asking me to "add a contact form" or "create a navigation menu" to see live code generation!`,
                    createdAt: new Date()
                }]);
                addLog('AI response generated');
            }
        } catch (error) {
            console.error('Message handling failed:', error);
            addLog('Failed to process message');
        } finally {
            setIsGenerating(false);
        }
    };
    
    // Function to stream code updates to the editor
    const streamCodeUpdate = async (newContent: string) => {
        if (!activeFile) return;
        
        const currentLength = activeFile.content.length;
        const additionalContent = newContent.slice(currentLength);
        const words = additionalContent.split(' ');
        let streamedContent = activeFile.content;
        
        for (let i = 0; i < words.length; i++) {
            streamedContent += (i > 0 ? ' ' : '') + words[i];
            setActiveCode(streamedContent);
            setActiveFile(prev => prev ? { ...prev, content: streamedContent } : null);
            
            // Variable typing speed
            const delay = words[i].includes('<') || words[i].includes('{') || words[i].includes('(') ? 25 : 8;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    };

    const handleAcceptAll = () => {
        const pendingChanges = fileChanges.filter(c => c.status === 'pending');
        if (pendingChanges.length > 0) {
            acceptAllChanges();
        } else {
            addLog('No pending changes to accept');
        }
    };

    const handleRejectAll = () => {
        const pendingChanges = fileChanges.filter(c => c.status === 'pending');
        if (pendingChanges.length > 0) {
            rejectAllChanges();
        } else {
            addLog('No pending changes to reject');
        }
    };

    const handleCancel = () => {
        setIsGenerating(false);
        addLog('Operation cancelled');
    };

    const handleCodeChange = (newCode: string) => {
        setActiveCode(newCode);
        if (activeFile) {
            // Track the file change
            trackFileChange(activeFile.path, newCode, 'modified', 'Manual edit in code editor');
            
            // Create a change session if none exists
            if (!currentSession) {
                createChangeSession();
            }
            
            // Show change manager if there are pending changes
            const pendingChanges = fileChanges.filter(c => c.status === 'pending');
            if (pendingChanges.length > 0) {
                setShowChangeManager(true);
            }
            
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
                const projectFiles = initialProject.files.map((file, index) => {
                    let filePath: string;
                    
                    // Determine the file path with better fallback logic
                    if ('name' in file && file.name && file.name.trim()) {
                        filePath = file.name.trim();
                    } else if ('path' in file && file.path && file.path.trim()) {
                        filePath = file.path.trim();
                    } else {
                        // Create a meaningful fallback based on content or index
                        const extension = file.content && file.content.includes('<!DOCTYPE html') ? '.html' :
                                        file.content && file.content.includes('body {') ? '.css' :
                                        file.content && (file.content.includes('function') || file.content.includes('console.log')) ? '.js' : '.txt';
                        filePath = `file-${index + 1}${extension}`;
                    }
                    
                    return {
                        id: `file-${index}`,
                        path: filePath,
                        content: file.content || '',
                        status: 'status' in file ? file.status as 'pending' | 'generating' | 'completed' | 'error' : 'completed' as const
                    };
                }).filter(file => file.path && file.path.trim()); // Filter out any files that still don't have valid paths
                
                setFiles(projectFiles);
                
                // Initialize original files tracking
                const originalFilesMap = new Map();
                projectFiles.forEach(file => {
                    originalFilesMap.set(file.path, file.content);
                });
                setOriginalFiles(originalFilesMap);
                
                if (projectFiles.length > 0) {
                    setActiveFile({ path: projectFiles[0].path, content: projectFiles[0].content });
                    setActiveCode(projectFiles[0].content);
                }
            } else if (initialPrompt && !initialProject) {
                handleGenerate();
            } else if (!initialPrompt && !initialProject) {
                // Show the actual AI-ChatGPT-Business project structure
                const projectStructureFiles = [
                    // Source files - Components
                    {
                        id: 'wallet-connect',
                        path: 'src/components/wallet/WalletConnect.tsx',
                        content: `"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

export function WalletConnect() {
  const handleConnect = () => {
    // Wallet connection logic
    console.log('Connecting wallet...');
  };

  return (
    <Button onClick={handleConnect} className="flex items-center gap-2">
      <Wallet className="h-4 w-4" />
      Connect Wallet
    </Button>
  );
}`,
                        status: 'completed' as const
                    },
                    {
                        id: 'wallet-provider',
                        path: 'src/components/wallet/WalletProvider.tsx',
                        content: `"use client";

import React, { createContext, useContext, useState } from 'react';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const connect = async () => {
    // Wallet connection implementation
    setIsConnected(true);
    setAddress('0x1234...5678');
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress(null);
  };

  return (
    <WalletContext.Provider value={{ isConnected, address, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};`,
                        status: 'completed' as const
                    },
                    {
                        id: 'workspace-settings',
                        path: 'src/components/workspace/WorkspaceSettingsModal.tsx',
                        content: `"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkspaceSettingsModal({ isOpen, onClose }: WorkspaceSettingsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Workspace Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" defaultValue="AI ChatGPT Business" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input id="description" defaultValue="AI-powered business application" className="col-span-3" />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>Save changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}`,
                        status: 'completed' as const
                    },
                    {
                        id: 'theme-provider',
                        path: 'src/components/ThemeProvider.tsx',
                        content: `"use client";

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}`,
                        status: 'completed' as const
                    },
                    // Hooks
                    {
                        id: 'use-projects',
                        path: 'src/hooks/useProjects.tsx',
                        content: `"use client";

import { useState, useCallback } from 'react';

interface Project {
  id: string;
  name: string;
  description?: string;
  files: Array<{
    path: string;
    content: string;
    status: 'pending' | 'generating' | 'completed' | 'error';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);

  const addProject = useCallback((project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProjects(prev => [newProject, ...prev]);
    return newProject;
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === id 
        ? { ...project, ...updates, updatedAt: new Date() }
        : project
    ));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  }, []);

  return {
    projects,
    addProject,
    updateProject,
    deleteProject,
  };
}`,
                        status: 'completed' as const
                    },
                    {
                        id: 'use-teams',
                        path: 'src/hooks/useTeams.tsx',
                        content: `"use client";

import { useState, useCallback } from 'react';

interface Team {
  id: string;
  name: string;
  description?: string;
  members: Array<{
    id: string;
    email: string;
    role: 'admin' | 'member';
    joinedAt: Date;
  }>;
  createdAt: Date;
}

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);

  const createTeam = useCallback((team: Omit<Team, 'id' | 'createdAt'>) => {
    const newTeam: Team = {
      ...team,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setTeams(prev => [...prev, newTeam]);
    return newTeam;
  }, []);

  const joinTeam = useCallback((teamId: string, user: { email: string; role: 'admin' | 'member' }) => {
    setTeams(prev => prev.map(team => 
      team.id === teamId 
        ? {
            ...team,
            members: [...team.members, {
              id: Date.now().toString(),
              ...user,
              joinedAt: new Date(),
            }]
          }
        : team
    ));
  }, []);

  return {
    teams,
    createTeam,
    joinTeam,
  };
}`,
                        status: 'completed' as const
                    },
                    {
                        id: 'use-user',
                        path: 'src/hooks/useUser.tsx',
                        content: `"use client";

import { useState, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  credits: number;
  subscription: 'free' | 'pro' | 'enterprise';
}

export function useUser() {
  const [user, setUser] = useState<User | null>({
    id: '1',
    email: 'user@example.com',
    name: 'Demo User',
    credits: 100,
    subscription: 'pro',
  });

  const deductCredits = useCallback((amount: number) => {
    if (!user || user.credits < amount) {
      return false;
    }
    setUser(prev => prev ? { ...prev, credits: prev.credits - amount } : null);
    return true;
  }, [user]);

  const addCredits = useCallback((amount: number) => {
    setUser(prev => prev ? { ...prev, credits: prev.credits + amount } : null);
  }, []);

  const updateSubscription = useCallback((subscription: User['subscription']) => {
    setUser(prev => prev ? { ...prev, subscription } : null);
  }, []);

  return {
    user,
    setUser,
    deductCredits,
    addCredits,
    updateSubscription,
  };
}`,
                        status: 'completed' as const
                    },
                    // Configuration files
                    {
                        id: 'env-local',
                        path: '.env.local',
                        content: `# Environment variables for local development
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key`,
                        status: 'completed' as const
                    },
                    {
                        id: 'gitignore',
                        path: '.gitignore',
                        content: `# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts`,
                        status: 'completed' as const
                    },
                    {
                        id: 'components-json',
                        path: 'components.json',
                        content: `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}`,
                        status: 'completed' as const
                    },
                    {
                        id: 'deployment-md',
                        path: 'DEPLOYMENT.md',
                        content: `# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Vercel account (recommended) or other hosting platform

## Environment Variables

Create a \`.env.local\` file with the following variables:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
\`\`\`

## Build and Deploy

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

\`\`\`bash
npm run build
npm start
\`\`\`

## Features

- ✅ AI-powered code generation
- ✅ Real-time collaboration
- ✅ Multiple AI models support
- ✅ User authentication
- ✅ Team management
- ✅ Credit system`,
                        status: 'completed' as const
                    },
                    {
                        id: 'env-example',
                        path: 'env.example',
                        content: `# Copy this file to .env.local and fill in your values

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# AI Services
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Optional
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=`,
                        status: 'completed' as const
                    },
                    {
                        id: 'eslint-config',
                        path: 'eslint.config.mjs',
                        content: `import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;`,
                        status: 'completed' as const
                    },
                    {
                        id: 'next-env-dts',
                        path: 'next-env.d.ts',
                        content: `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.`,
                        status: 'completed' as const
                    },
                    {
                        id: 'next-config-ts',
                        path: 'next.config.ts',
                        content: `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
  images: {
    domains: ["images.unsplash.com", "avatars.githubusercontent.com"],
  },
};

export default nextConfig;`,
                        status: 'completed' as const
                    },
                    {
                        id: 'package-lock-json',
                        path: 'package-lock.json',
                        content: `{
  "name": "ai-chatgpt-business",
  "version": "0.1.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "ai-chatgpt-business",
      "version": "0.1.0",
      "dependencies": {
        "next": "15.0.3",
        "react": "^18.2.0",
        "react-dom": "^18.2.0"
      }
    }
  }
}`,
                        status: 'completed' as const
                    },
                    {
                        id: 'package-json',
                        path: 'package.json',
                        content: `{
  "name": "ai-chatgpt-business",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.24.3",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@supabase/supabase-js": "^2.39.3",
    "ai": "^3.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.344.0",
    "next": "15.0.3",
    "next-themes": "^0.2.1",
    "openai": "^4.28.0",
    "prismjs": "^1.29.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-simple-code-editor": "^0.13.1",
    "tailwind-merge": "^2.2.1",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/node": "^20.11.17",
    "@types/prismjs": "^1.26.3",
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "eslint": "^8.56.0",
    "eslint-config-next": "15.0.3",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3"
  }
}`,
                        status: 'completed' as const
                    },
                    {
                        id: 'postcss-config',
                        path: 'postcss.config.mjs',
                        content: `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};

export default config;`,
                        status: 'completed' as const
                    },
                    {
                        id: 'readme-md',
                        path: 'README.md',
                        content: `# AI ChatGPT Business

An AI-powered business application built with Next.js, featuring advanced code generation, team collaboration, and multiple AI model support.

## Features

- 🤖 **AI Code Generation**: Generate complete applications with natural language
- 👥 **Team Collaboration**: Work together on projects in real-time
- 🔧 **Multiple AI Models**: Support for GPT-4, Claude, and more
- 💳 **Credit System**: Flexible usage-based pricing
- 🔐 **Authentication**: Secure user management with Supabase
- 📊 **Analytics**: Track usage and project metrics
- 🎨 **Modern UI**: Beautiful interface built with Tailwind CSS

## Getting Started

1. Clone the repository
2. Install dependencies: \`npm install\`
3. Copy \`env.example\` to \`.env.local\` and fill in your API keys
4. Run the development server: \`npm run dev\`
5. Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Services**: OpenAI GPT-4, Anthropic Claude
- **Deployment**: Vercel
- **TypeScript**: Full type safety

## Project Structure

\`\`\`
├── src/
│   ├── app/                 # App Router pages
│   ├── components/          # Reusable components
│   │   ├── ai/             # AI-related components
│   │   ├── project/        # Project management
│   │   ├── ui/             # Base UI components
│   │   ├── user/           # User management
│   │   ├── wallet/         # Wallet integration
│   │   └── workspace/      # Workspace features
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── types/              # TypeScript definitions
├── public/                 # Static assets
└── docs/                   # Documentation
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details`,
                        status: 'completed' as const
                    },
                    {
                        id: 'tsconfig-json',
                        path: 'tsconfig.json',
                        content: `{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`,
                        status: 'completed' as const
                    }
                ];
                
                setFiles(projectStructureFiles);
                
                // Initialize original files tracking for default project
                const originalFilesMap = new Map();
                projectStructureFiles.forEach(file => {
                    originalFilesMap.set(file.path, file.content);
                });
                setOriginalFiles(originalFilesMap);
                
                setActiveFile({ path: projectStructureFiles[0].path, content: projectStructureFiles[0].content });
                setActiveCode(projectStructureFiles[0].content);
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
                            fileChanges={fileChanges}
                            isLoading={isGenerating}
                            onSend={handleSend}
                            onAcceptAll={handleAcceptAll}
                            onRejectAll={handleRejectAll}
                            onOpenChangeManager={() => setShowChangeManager(true)}
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
            <ChangeManager
                changes={fileChanges}
                onAcceptChange={acceptChange}
                onRejectChange={rejectChange}
                onAcceptAll={acceptAllChanges}
                onRejectAll={rejectAllChanges}
                isVisible={showChangeManager}
                onClose={() => setShowChangeManager(false)}
            />
        </>
    );
}