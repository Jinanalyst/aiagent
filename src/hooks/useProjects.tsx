"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useUser } from './useUser';
import { GeneratedFile, Project } from '@/types';

interface ProjectsContextType {
  projects: Project[];
  loading: boolean;
  activeProjectId: string | null;
  addProject: (projectData: { name: string, files: GeneratedFile[] }) => Project;
  getProject: (id: string) => Project | undefined;
  updateProject: (id: string, updates: Partial<Project>) => void;
  setActiveProjectId: (id: string | null) => void;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export const ProjectsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    if (user) {
      try {
        const allProjects = JSON.parse(localStorage.getItem('projects') || '{}');
        const userProjects = allProjects[user.walletAddress] || [];
        setProjects(userProjects);
        if (userProjects.length > 0 && !activeProjectId) {
          setActiveProjectId(userProjects[0].id);
        }
      } catch (error) {
        console.error("Failed to parse projects from localStorage", error);
        setProjects([]);
      }
    } else {
      setProjects([]);
    }
    setLoading(false);
  }, [user]);

  const addProject = useCallback((projectData: { name: string, files: GeneratedFile[] }): Project => {
    if (!user) throw new Error("User not authenticated");

    const newProject: Project = {
      ...projectData,
      id: `proj_${new Date().getTime()}`,
      createdAt: new Date().toISOString(),
      userId: user.walletAddress,
    };

    const allProjects = JSON.parse(localStorage.getItem('projects') || '{}');
    const userProjects = allProjects[user.walletAddress] || [];
    const updatedProjects = [...userProjects, newProject];
    
    allProjects[user.walletAddress] = updatedProjects;
    localStorage.setItem('projects', JSON.stringify(allProjects));
    setProjects(updatedProjects);
    setActiveProjectId(newProject.id);

    return newProject;
  }, [user]);

  const getProject = useCallback((id: string): Project | undefined => {
    return projects.find(p => p.id === id);
  }, [projects]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    if (!user) return;

    setProjects(currentProjects => {
      const projectIndex = currentProjects.findIndex(p => p.id === id);
      if (projectIndex === -1) {
        return currentProjects; 
      }

      const updatedProjects = [...currentProjects];
      const updatedProject = {
        ...updatedProjects[projectIndex],
        ...updates,
        labs: { // Ensure labs object exists
            ...updatedProjects[projectIndex].labs,
            ...updates.labs,
        }
      };
      updatedProjects[projectIndex] = updatedProject;

      const allProjects = JSON.parse(localStorage.getItem('projects') || '{}');
      allProjects[user.walletAddress] = updatedProjects;
      localStorage.setItem('projects', JSON.stringify(allProjects));
      
      return updatedProjects;
    });
  }, [user]);

  return (
    <ProjectsContext.Provider value={{ projects, loading, addProject, getProject, activeProjectId, setActiveProjectId, updateProject }}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
}; 