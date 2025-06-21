"use client";

import React, { useState, useEffect } from 'react';
import { ProfileSidebar } from '@/components/ui/profile-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/hooks/useUser';
import { SubscriptionStatus } from '@/components/ui/subscription-status';
import { 
  X, 
  Settings, 
  Monitor, 
  Code, 
  Users, 
  Coins, 
  Grid3X3, 
  Beaker, 
  Brain, 
  Network, 
  HardDrive,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type SettingsSection = 
  | 'general' 
  | 'appearance' 
  | 'editor' 
  | 'team' 
  | 'tokens' 
  | 'applications' 
  | 'feature-previews' 
  | 'knowledge' 
  | 'network' 
  | 'backups';

export default function SettingsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');

  // Handle URL parameters for direct section navigation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section') as SettingsSection;
    if (section && settingsSections.some(s => s.id === section)) {
      setActiveSection(section);
    }
  }, []);

  const [settings, setSettings] = useState({
    // General
    deleteAllChats: false,
    
    // Chat
    showTokenUsage: true,
    
    // Appearance
    theme: 'dark',
    
    // Editor
    fontSize: '14',
    tabSize: '2',
    wordWrap: true,
    
    // Feature Previews
    diffs: true,
    dynamicReasoning: true,
    
    // Knowledge
    projectPrompt: `For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.

By default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.

Use icons from lucide-react for logos.`,
    globalSystemPrompt: '',
    
    // Network
    apiEndpoint: 'https://api.openai.com/v1',
    timeout: '30',
    
    // Tokens
    openaiApiKey: '',
    anthropicApiKey: '',
  });

  const settingsSections = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Monitor },
    { id: 'editor', label: 'Editor', icon: Code },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'tokens', label: 'Tokens', icon: Coins },
    { id: 'applications', label: 'Applications', icon: Grid3X3 },
    { id: 'feature-previews', label: 'Feature Previews', icon: Beaker },
    { id: 'knowledge', label: 'Knowledge', icon: Brain },
    { id: 'network', label: 'Network', icon: Network },
    { id: 'backups', label: 'Backups', icon: HardDrive },
  ] as const;

  const updateSetting = (key: string, value: unknown) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleDeleteAllChats = () => {
    if (confirm('Are you sure you want to delete all chats? This action cannot be undone.')) {
      // Clear all projects from localStorage
      if (user) {
        const allProjects = JSON.parse(localStorage.getItem('projects') || '{}');
        delete allProjects[user.walletAddress];
        localStorage.setItem('projects', JSON.stringify(allProjects));
        
        // Clear referral stats
        localStorage.removeItem(`referrals_${user.walletAddress}`);
        
        alert('All chats have been deleted.');
      }
    }
  };

  const saveProjectPrompt = () => {
    localStorage.setItem('projectPrompt', settings.projectPrompt);
    alert('Project prompt saved successfully!');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Chat</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Delete all chats</h3>
                  </div>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAllChats}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete all
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Show token usage in chat</h3>
                  </div>
                  <Switch
                    checked={settings.showTokenUsage}
                    onCheckedChange={(checked) => updateSetting('showTokenUsage', checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Appearance</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Theme</h3>
                  </div>
                  <Select value={settings.theme} onValueChange={(value) => updateSetting('theme', value)}>
                    <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'editor':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Editor</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Font Size</h3>
                  </div>
                  <Select value={settings.fontSize} onValueChange={(value) => updateSetting('fontSize', value)}>
                    <SelectTrigger className="w-20 bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="12">12px</SelectItem>
                      <SelectItem value="14">14px</SelectItem>
                      <SelectItem value="16">16px</SelectItem>
                      <SelectItem value="18">18px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Tab Size</h3>
                  </div>
                  <Select value={settings.tabSize} onValueChange={(value) => updateSetting('tabSize', value)}>
                    <SelectTrigger className="w-16 bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="8">8</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Word Wrap</h3>
                  </div>
                  <Switch
                    checked={settings.wordWrap}
                    onCheckedChange={(checked) => updateSetting('wordWrap', checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'feature-previews':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Feature Previews</h2>
              <p className="text-gray-400 mb-6">Preview and provide feedback on upcoming enhancements to Bolt.</p>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Diffs</h3>
                    <p className="text-sm text-gray-400">Bolt will use a diff-based approach to editing existing files rather than re-writing the entire file for each change.</p>
                  </div>
                  <Switch
                    checked={settings.diffs}
                    onCheckedChange={(checked) => updateSetting('diffs', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white">Dynamic Reasoning</h3>
                    <p className="text-sm text-gray-400">Use this for complex problems that need more reasoning.</p>
                  </div>
                  <Switch
                    checked={settings.dynamicReasoning}
                    onCheckedChange={(checked) => updateSetting('dynamicReasoning', checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'knowledge':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Knowledge</h2>
              
              <div className="space-y-6">
                <div className="border-b border-gray-700">
                  <div className="flex space-x-8">
                    <button className="pb-4 text-blue-400 border-b-2 border-blue-400 font-medium">
                      Project Prompt
                    </button>
                    <button className="pb-4 text-gray-400 hover:text-white">
                      Global System Prompt
                    </button>
                  </div>
                </div>
                
                <div>
                  <p className="text-gray-400 mb-4">
                    Define project-specific instructions that Bolt will follow when working on this project. This helps tailor Bolt's responses to your project's unique context and requirements.
                  </p>
                  
                  <Textarea
                    value={settings.projectPrompt}
                    onChange={(e) => updateSetting('projectPrompt', e.target.value)}
                    className="min-h-40 bg-gray-800 border-gray-600 text-white resize-none"
                    placeholder="Enter your project-specific instructions..."
                  />
                  
                  <div className="flex justify-end mt-4">
                    <Button 
                      onClick={saveProjectPrompt}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Save prompt
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'tokens':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">API Keys</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">OpenAI API Key</h3>
                  <Input
                    type="password"
                    value={settings.openaiApiKey}
                    onChange={(e) => updateSetting('openaiApiKey', e.target.value)}
                    placeholder="sk-..."
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    Required for GPT models. Get your API key from OpenAI.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Anthropic API Key</h3>
                  <Input
                    type="password"
                    value={settings.anthropicApiKey}
                    onChange={(e) => updateSetting('anthropicApiKey', e.target.value)}
                    placeholder="sk-ant-..."
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    Required for Claude models. Get your API key from Anthropic.
                  </p>
                </div>

                {user && (
                  <div className="space-y-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-white mb-2">Current Balance</h3>
                      <p className="text-2xl font-bold text-green-400">{user.credits} tokens</p>
                      <p className="text-sm text-gray-400">Plan: {user.plan}</p>
                    </div>
                    <SubscriptionStatus />
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'network':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Network</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">API Endpoint</h3>
                  <Input
                    value={settings.apiEndpoint}
                    onChange={(e) => updateSetting('apiEndpoint', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Request Timeout (seconds)</h3>
                  <Input
                    type="number"
                    value={settings.timeout}
                    onChange={(e) => updateSetting('timeout', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white w-32"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Team</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-white">Create a team</h3>
                      <p className="text-sm text-gray-400">Collaborate with team members on AI projects</p>
                    </div>
                    <Button
                      onClick={() => router.push('/team/create')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Create a team
                    </Button>
                  </div>
                </div>

                {/* Current Teams */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-white mb-4">Your teams</h3>
                  {user && (() => {
                    const userTeams = JSON.parse(localStorage.getItem(`user_teams_${user.walletAddress}`) || '[]');
                    const allTeams = JSON.parse(localStorage.getItem('teams') || '{}');
                    const teams = userTeams.map((teamId: string) => allTeams[teamId]).filter(Boolean);
                    
                    if (teams.length === 0) {
                      return (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-400">You&apos;re not part of any teams yet</p>
                          <p className="text-sm text-gray-500">Create a team or ask someone to invite you</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {teams.map((team: {id: string; name: string; members: unknown[]; plan: string; settings: {sharedCredits: number}; ownerId: string}) => (
                          <div key={team.id} className="bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-white">{team.name}</h4>
                                <p className="text-sm text-gray-400">
                                  {team.members.length} members • {team.plan} plan • {team.settings.sharedCredits} credits
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  team.ownerId === user.walletAddress 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-gray-600 text-gray-300'
                                }`}>
                                  {team.ownerId === user.walletAddress ? 'Owner' : 'Member'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-400">This section is coming soon...</p>
          </div>
        );
    }
  };

  return (
    <>
      <ProfileSidebar />
      <div className="flex h-screen bg-gray-900 text-white">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-6">
              <Settings className="h-6 w-6" />
              <h1 className="text-xl font-bold">Settings</h1>
            </div>
            
            <nav className="space-y-1">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as SettingsSection)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold capitalize">
                {activeSection.replace('-', ' ')}
              </h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.history.back()}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </>
  );
} 