"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProjects } from '@/hooks/useProjects';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Settings, 
  HelpCircle, 
  CreditCard, 
  User, 
  LogOut,
  FileText,
  Calendar,
  Coins
} from 'lucide-react';
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { Project } from '@/types';
import { ReferralModal } from '@/components/user/ReferralModal';

interface ProfileSidebarProps {
  className?: string;
}

export function ProfileSidebar({ className = '' }: ProfileSidebarProps) {
  const { projects, loading } = useProjects();
  const { user } = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupProjectsByDate = (projects: Project[]) => {
    const groups: { [key: string]: Project[] } = {
      Today: [],
      Yesterday: [],
      'This Week': [],
      'This Month': [],
      Older: []
    };

    projects.forEach(project => {
      const date = new Date(project.createdAt);
      if (isToday(date)) {
        groups.Today.push(project);
      } else if (isYesterday(date)) {
        groups.Yesterday.push(project);
      } else if (isThisWeek(date)) {
        groups['This Week'].push(project);
      } else if (isThisMonth(date)) {
        groups['This Month'].push(project);
      } else {
        groups.Older.push(project);
      }
    });

    return groups;
  };

  const groupedProjects = groupProjectsByDate(filteredProjects);

  const handleNewProject = () => {
    router.push('/generate');
    setIsHovered(false);
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/project/${projectId}`);
    setIsHovered(false);
  };

  const renderProjectGroup = (title: string, projects: Project[]) => {
    if (projects.length === 0) return null;

    return (
      <div key={title} className="mb-6">
        <h3 className="text-sm font-medium text-gray-400 mb-3 px-3">{title}</h3>
        <div className="space-y-1">
          {projects.map(project => (
            <button
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-gray-400 group-hover:text-white" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {project.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(project.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`fixed left-0 bottom-0 z-50 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Profile Icon */}
      <div className="relative">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors m-4">
            <span className="text-lg font-medium text-white">
              {user ? user.walletAddress.slice(0, 1).toUpperCase() : 'U'}
            </span>
          </div>
          {/* Small indicator rectangles */}
          <div className="flex flex-col space-y-1 ml-2">
            <div className="w-4 h-1 bg-gray-600 rounded"></div>
            <div className="w-4 h-1 bg-gray-600 rounded"></div>
          </div>
        </div>
        
        {/* Sidebar Overlay */}
        {isHovered && (
          <div className="absolute left-0 bottom-0 w-80 bg-gray-900 text-white h-screen flex flex-col border-r border-gray-700 shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <div className="text-xl font-bold">bolt</div>
              </div>
              
              {/* New Chat Button */}
              <Button 
                onClick={handleNewProject}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-4"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Start new chat
              </Button>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Your Chats */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <h2 className="text-lg font-semibold mb-4">Your Chats</h2>
              
              {loading ? (
                <div className="text-center text-gray-400">
                  <p>Loading projects...</p>
                </div>
              ) : filteredProjects.length > 0 ? (
                <div>
                  {Object.entries(groupedProjects).map(([title, projects]) => 
                    renderProjectGroup(title, projects)
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No projects found</p>
                  {searchQuery && (
                    <p className="text-sm mt-2">Try adjusting your search</p>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Navigation */}
            <div className="border-t border-gray-700 p-4 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-green-400 hover:text-green-300 hover:bg-gray-800"
                onClick={() => {
                  setIsReferralModalOpen(true);
                  setIsHovered(false);
                }}
              >
                <Coins className="h-4 w-4 mr-3" />
                Get free tokens
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => router.push('/support')}
              >
                <Settings className="h-4 w-4 mr-3" />
                Settings
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => router.push('/support')}
              >
                <HelpCircle className="h-4 w-4 mr-3" />
                Help Center
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => router.push('/pricing')}
              >
                <CreditCard className="h-4 w-4 mr-3" />
                My Subscription
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => router.push('/account')}
              >
                <User className="h-4 w-4 mr-3" />
                Select Account
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Sign Out
              </Button>

              {/* User Info */}
              {user && (
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-700">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user.walletAddress.slice(0, 1).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-4)}
                    </p>
                    <p className="text-xs text-green-400">
                      Pro • {user.credits} credits
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Referral Modal */}
      <ReferralModal 
        isOpen={isReferralModalOpen} 
        onClose={() => setIsReferralModalOpen(false)} 
      />
    </div>
  );
} 