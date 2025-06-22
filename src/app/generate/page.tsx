"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Send, 
  Code2, 
  Eye, 
  Loader2, 
  User, 
  Bot,
  Download,
  ExternalLink
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { DeploymentModal } from '@/components/project/DeploymentModal';
import { TopNavigation } from '@/components/ui/top-navigation';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

interface Project {
  name: string;
  description: string;
  files: GeneratedFile[];
  techStack: string[];
}

export default function GeneratePage() {
  const { user, deductCredits } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('code');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const generateProject = async (prompt: string): Promise<Project> => {
    // Simulate AI project generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Parse prompt to determine project type
    const isLandingPage = prompt.toLowerCase().includes('landing') || prompt.toLowerCase().includes('website');
    
    if (isLandingPage) {
      return {
        name: 'Modern Landing Page',
        description: 'A modern, responsive landing page with Tailwind CSS',
        techStack: ['Next.js', 'Tailwind CSS', 'TypeScript'],
        files: [
          {
            path: 'app/page.tsx',
            language: 'typescript',
            content: `export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-6">
            Build the Future
          </h1>
          <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
            Transform your ideas into reality with our cutting-edge platform.
            Join thousands of creators building amazing experiences.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors">
              Get Started
            </button>
            <button className="border border-purple-400 text-purple-300 hover:bg-purple-800 px-8 py-4 rounded-lg font-semibold transition-colors">
              Learn More
            </button>
          </div>
        </div>
        
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <div className="w-12 h-12 bg-purple-600 rounded-lg mb-4 flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
            <p className="text-purple-200">Simple and intuitive interface designed for everyone.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <div className="w-12 h-12 bg-blue-600 rounded-lg mb-4 flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-purple-200">Optimized performance for the best user experience.</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg mb-4 flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure</h3>
            <p className="text-purple-200">Enterprise-grade security to protect your data.</p>
          </div>
        </div>
      </div>
    </div>
  );
}`
          },
          {
            path: 'app/layout.tsx',
            language: 'typescript',
            content: `import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Modern Landing Page',
  description: 'A beautiful, modern landing page built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}`
          },
          {
            path: 'app/globals.css',
            language: 'css',
            content: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }
  
  body {
    @apply antialiased;
  }
}

@layer components {
  .gradient-bg {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .glass-effect {
    backdrop-filter: blur(16px) saturate(180%);
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.125);
  }
}`
          }
        ]
      };
    }
    
    return {
      name: 'React Dashboard App',
      description: 'A modern React dashboard with components and routing',
      techStack: ['React', 'TypeScript', 'Tailwind CSS'],
      files: [
        {
          path: 'src/App.tsx',
          language: 'typescript',
          content: `import React from 'react';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <div className="App">
      <Dashboard />
    </div>
  );
}

export default App;`
        },
        {
          path: 'src/components/Dashboard.tsx',
          language: 'typescript',
          content: `import React from 'react';
import { BarChart, Users, TrendingUp, DollarSign } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { title: 'Total Users', value: '12,345', icon: Users, change: '+12%' },
    { title: 'Revenue', value: '$45,234', icon: DollarSign, change: '+8%' },
    { title: 'Growth', value: '23%', icon: TrendingUp, change: '+5%' },
    { title: 'Reports', value: '156', icon: BarChart, change: '+3%' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-green-600 text-sm font-medium">{stat.change}</span>
                  <span className="text-gray-600 text-sm"> from last month</span>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{item}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Activity item {item}</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;`
        }
      ]
    };
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || isGenerating) return;
    
    if (!user || !deductCredits(3)) {
      alert('Insufficient credits. Please upgrade your plan.');
      return;
    }

    const userPrompt = inputValue;
    setInputValue('');
    addMessage('user', userPrompt);
    setIsGenerating(true);
    
    addMessage('assistant', 'I&apos;ll help you build that! Let me generate the project for you...');

    try {
      const project = await generateProject(userPrompt);
      setCurrentProject(project);
      setSelectedFile(project.files[0]?.path || '');
      
      addMessage('assistant', 
        `✅ **Project generated successfully!**\n\n**${project.name}**\n${project.description}\n\n**Tech Stack:** ${project.techStack.join(', ')}\n\n**Files created:** ${project.files.length}\n\nYou can now view the code and preview your app in the tabs on the right. Click "Deploy" to publish it live!`
      );
    } catch {
      addMessage('assistant', 'Sorry, there was an error generating your project. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getCurrentFileContent = () => {
    if (!currentProject || !selectedFile) return '';
    const file = currentProject.files.find(f => f.path === selectedFile);
    return file?.content || '';
  };

  const generatePreviewUrl = () => {
    if (!currentProject) return null;
    
    // Find the main HTML file (index.html, page.tsx, or App.tsx)
    let mainFile = currentProject.files.find(f => 
      f.path.includes('page.tsx') || 
      f.path.includes('index.html') || 
      f.path.includes('App.tsx')
    );
    
    if (!mainFile) mainFile = currentProject.files[0];
    
    if (!mainFile) return null;

    // Create a simple HTML preview for React/TypeScript files
    if (mainFile.path.includes('.tsx') || mainFile.path.includes('.ts')) {
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview - ${currentProject.name}</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
      ${mainFile.content.replace('export default function', 'function').replace(/import.*from.*;/g, '')}
      
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(${mainFile.path.includes('HomePage') ? 'HomePage' : 'App'}));
    </script>
</body>
</html>`;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      return URL.createObjectURL(blob);
    }
    
    // For HTML files, use content directly
    if (mainFile.path.includes('.html')) {
      const blob = new Blob([mainFile.content], { type: 'text/html' });
      return URL.createObjectURL(blob);
    }
    
    // For CSS files, create a simple preview
    if (mainFile.path.includes('.css')) {
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>${mainFile.content}</style>
</head>
<body>
    <div style="padding: 20px;">
        <h1>CSS Preview</h1>
        <p>This is a preview of your CSS styles.</p>
        <button>Sample Button</button>
        <div class="card">Sample card component</div>
    </div>
</body>
</html>`;
      const blob = new Blob([htmlContent], { type: 'text/html' });
      return URL.createObjectURL(blob);
    }
    
    return null;
  };

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Fixed Top Navigation */}
      <TopNavigation
        projectTitle={currentProject ? currentProject.name : "AI Code Generator"}
        subtitle={currentProject ? currentProject.description : "Describe what you want to build"}
        onDeploy={() => setIsDeployModalOpen(true)}
        onAIAction={() => {
          // Enhanced AI action - focus chat input and add suggestion
          const chatInput = document.querySelector('textarea');
          if (chatInput) {
            chatInput.focus();
            if (currentProject) {
              // Suggest project improvements if there's a current project
              setInputValue(`Improve this ${currentProject.name} by adding `);
            }
          }
        }}
        userCredits={user?.credits}
        isDeployEnabled={!!currentProject}
        showBackButton={true}
        projectFiles={currentProject ? 
          currentProject.files.reduce((acc, file) => {
            acc[file.path] = file.content;
            return acc;
          }, {} as Record<string, string>) 
          : {}
        }
        projectName={currentProject?.name || "My Project"}
      />
      
            {/* Content with top padding for fixed header */}
      <div className="pt-14 flex-1 flex">{/* pt-14 accounts for the 56px (h-14) header height */}
        {/* Left Chat Panel */}
        <div className="w-80 border-r border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h2 className="font-semibold text-lg">Chat</h2>
            <p className="text-sm text-gray-400">Describe what you want to build</p>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Start by describing what you want to build</p>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="bg-gray-800 rounded p-2">&quot;Build a landing page for my startup&quot;</div>
                  <div className="bg-gray-800 rounded p-2">&quot;Create a React dashboard with charts&quot;</div>
                  <div className="bg-gray-800 rounded p-2">&quot;Make a portfolio website&quot;</div>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4 text-blue-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium mb-1">
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </div>
                  <div className="text-sm text-gray-300 whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            
            {isGenerating && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium mb-1">AI Assistant</div>
                  <div className="text-sm text-gray-300">Generating your project...</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex gap-2">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Describe what you want to build..."
                className="flex-1 min-h-[80px] bg-gray-800 border-gray-700 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <Button
                onClick={handleSubmit}
                disabled={!inputValue.trim() || isGenerating}
                size="icon"
                className="self-end bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Code/Preview Panel */}
        <div className="flex-1 flex flex-col">
          {currentProject ? (
            <>
              {/* Enhanced Tabs Header */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <div className="bg-[#1a1a1a] border-b border-gray-800 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Project: {currentProject.name}</span>
                  </div>
                  <TabsList className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-1 h-9">
                    <TabsTrigger 
                      value="code" 
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md px-3 py-1 text-sm font-medium transition-all"
                    >
                      <Code2 className="mr-1.5 h-3.5 w-3.5" />
                      Code
                    </TabsTrigger>
                    <TabsTrigger 
                      value="preview" 
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-md px-3 py-1 text-sm font-medium transition-all"
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      Preview
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="code" className="flex-1 m-0">
                  <div className="flex h-full">
                    {/* File Explorer */}
                    <div className="w-64 border-r border-gray-800 bg-[#1a1a1a]">
                      <div className="p-3 border-b border-gray-800">
                        <h3 className="text-sm font-medium">Files</h3>
                      </div>
                      <div className="p-2">
                        {currentProject.files.map((file) => (
                          <button
                            key={file.path}
                            onClick={() => setSelectedFile(file.path)}
                            className={`w-full text-left p-2 text-sm rounded hover:bg-gray-800 ${
                              selectedFile === file.path ? 'bg-gray-800 text-blue-400' : 'text-gray-300'
                            }`}
                          >
                            {file.path}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Code Editor */}
                    <div className="flex-1 bg-[#0a0a0a] flex flex-col">
                      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Code2 className="h-4 w-4 text-blue-400" />
                          <span className="text-sm font-medium">{selectedFile}</span>
                          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                            {getCurrentFileContent().split('\n').length} lines
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              const content = getCurrentFileContent();
                              navigator.clipboard.writeText(content);
                            }}
                            className="text-xs"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              const content = getCurrentFileContent();
                              const blob = new Blob([content], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              window.open(url, '_blank');
                            }}
                            className="text-xs"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Open
                          </Button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-auto">
                        <div className="flex">
                          {/* Line Numbers */}
                          <div className="bg-[#1a1a1a] px-4 py-4 text-right border-r border-gray-800 select-none">
                            {getCurrentFileContent().split('\n').map((_, index) => (
                              <div key={index} className="text-xs text-gray-500 leading-6 font-mono">
                                {index + 1}
                              </div>
                            ))}
                          </div>
                          
                          {/* Code Content */}
                          <div className="flex-1 p-4">
                            <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap leading-6">
                              {getCurrentFileContent().split('\n').map((line, index) => (
                                <div key={index} className="min-h-[24px]">
                                  {line || ' '}
                                </div>
                              ))}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="flex-1 m-0">
                  <div className="h-full bg-[#1a1a1a] flex flex-col">
                    {/* Preview Header */}
                    <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium">Live Preview</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const url = generatePreviewUrl();
                            if (url) window.open(url, '_blank');
                          }}
                          className="text-xs"
                        >
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Open in New Tab
                        </Button>
                      </div>
                    </div>
                    
                    {/* Preview Content */}
                    <div className="flex-1 p-4">
                      {generatePreviewUrl() ? (
                        <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-xl">
                          <iframe
                            src={generatePreviewUrl()!}
                            className="w-full h-full border-0"
                            title="App Preview"
                            sandbox="allow-scripts allow-same-origin"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
                          <div className="text-center text-gray-500">
                            <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">No Preview Available</p>
                            <p className="text-sm">Generate a project to see live preview</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Code2 className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-xl font-medium mb-2">Ready to build</p>
                <p className="text-sm">Start a conversation to generate your first project</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deploy Modal */}
      <DeploymentModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        projectName={currentProject?.name || 'My Project'}
        projectFiles={currentProject ? 
          currentProject.files.reduce((acc, file) => {
            acc[file.path] = file.content;
            return acc;
          }, {} as Record<string, string>) 
          : {}
        }
      />
    </div>
  );
} 