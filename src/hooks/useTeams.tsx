"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useUser } from './useUser';

interface TeamMember {
  id: string;
  email: string;
  walletAddress?: string;
  role: 'owner' | 'admin' | 'member';
  status: 'pending' | 'active';
  invitedAt: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: TeamMember[];
  createdAt: string;
  plan: 'free' | 'pro' | 'enterprise';
  settings: {
    allowMemberInvites: boolean;
    sharedCredits: number;
    maxMembers: number;
  };
}

interface TeamsContextType {
  teams: Team[];
  userTeams: Team[];
  loading: boolean;
  createTeam: (teamData: { name: string; description: string; plan: 'free' | 'pro' | 'enterprise' }) => Team;
  joinTeam: (teamId: string) => boolean;
  leaveTeam: (teamId: string) => boolean;
  getTeam: (id: string) => Team | undefined;
  inviteToTeam: (teamId: string, emails: string[]) => boolean;
  isTeamMember: (teamId: string) => boolean;
  getTeamRole: (teamId: string) => 'owner' | 'admin' | 'member' | null;
}

const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

export const TeamsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [teams, setTeams] = useState<Team[]>([]);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadTeams();
    } else {
      setTeams([]);
      setUserTeams([]);
    }
    setLoading(false);
  }, [user]);

  const loadTeams = useCallback(() => {
    if (!user) return;

    try {
      // Load all teams
      const allTeams = JSON.parse(localStorage.getItem('teams') || '{}');
      const teamsArray = Object.values(allTeams) as Team[];
      setTeams(teamsArray);

      // Load user's teams
      const userTeamIds = JSON.parse(localStorage.getItem(`user_teams_${user.walletAddress}`) || '[]');
      const userTeamsArray = userTeamIds.map((id: string) => allTeams[id]).filter(Boolean);
      setUserTeams(userTeamsArray);
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  }, [user]);

  const createTeam = useCallback((teamData: { name: string; description: string; plan: 'free' | 'pro' | 'enterprise' }): Team => {
    if (!user) throw new Error('User not authenticated');

    const newTeam: Team = {
      id: `team_${Date.now()}`,
      name: teamData.name,
      description: teamData.description,
      ownerId: user.walletAddress,
      members: [{
        id: user.walletAddress,
        email: `${user.walletAddress.slice(0, 8)}@wallet.local`,
        walletAddress: user.walletAddress,
        role: 'owner',
        status: 'active',
        invitedAt: new Date().toISOString()
      }],
      createdAt: new Date().toISOString(),
      plan: teamData.plan,
      settings: {
        allowMemberInvites: true,
        sharedCredits: teamData.plan === 'free' ? 50 : teamData.plan === 'pro' ? 500 : 2000,
        maxMembers: teamData.plan === 'free' ? 3 : teamData.plan === 'pro' ? 10 : 50
      }
    };

    // Save team
    const existingTeams = JSON.parse(localStorage.getItem('teams') || '{}');
    existingTeams[newTeam.id] = newTeam;
    localStorage.setItem('teams', JSON.stringify(existingTeams));

    // Add to user's teams
    const userTeamIds = JSON.parse(localStorage.getItem(`user_teams_${user.walletAddress}`) || '[]');
    userTeamIds.push(newTeam.id);
    localStorage.setItem(`user_teams_${user.walletAddress}`, JSON.stringify(userTeamIds));

    // Reload teams
    loadTeams();

    return newTeam;
  }, [user, loadTeams]);

  const joinTeam = useCallback((teamId: string): boolean => {
    if (!user) return false;

    try {
      const existingTeams = JSON.parse(localStorage.getItem('teams') || '{}');
      const team = existingTeams[teamId];

      if (!team) return false;

      // Check if already a member
      const isAlreadyMember = team.members.some((member: TeamMember) => 
        member.walletAddress === user.walletAddress
      );

      if (isAlreadyMember) return false;

      // Check team capacity
      if (team.members.length >= team.settings.maxMembers) return false;

      // Add user to team
      const newMember: TeamMember = {
        id: user.walletAddress,
        email: `${user.walletAddress.slice(0, 8)}@wallet.local`,
        walletAddress: user.walletAddress,
        role: 'member',
        status: 'active',
        invitedAt: new Date().toISOString()
      };

      team.members.push(newMember);
      existingTeams[teamId] = team;
      localStorage.setItem('teams', JSON.stringify(existingTeams));

      // Add to user's teams
      const userTeamIds = JSON.parse(localStorage.getItem(`user_teams_${user.walletAddress}`) || '[]');
      if (!userTeamIds.includes(teamId)) {
        userTeamIds.push(teamId);
        localStorage.setItem(`user_teams_${user.walletAddress}`, JSON.stringify(userTeamIds));
      }

      loadTeams();
      return true;
    } catch (error) {
      console.error('Failed to join team:', error);
      return false;
    }
  }, [user, loadTeams]);

  const leaveTeam = useCallback((teamId: string): boolean => {
    if (!user) return false;

    try {
      const existingTeams = JSON.parse(localStorage.getItem('teams') || '{}');
      const team = existingTeams[teamId];

      if (!team) return false;

      // Can't leave if you're the owner
      if (team.ownerId === user.walletAddress) return false;

      // Remove from team members
      team.members = team.members.filter((member: TeamMember) => 
        member.walletAddress !== user.walletAddress
      );

      existingTeams[teamId] = team;
      localStorage.setItem('teams', JSON.stringify(existingTeams));

      // Remove from user's teams
      const userTeamIds = JSON.parse(localStorage.getItem(`user_teams_${user.walletAddress}`) || '[]');
      const updatedUserTeamIds = userTeamIds.filter((id: string) => id !== teamId);
      localStorage.setItem(`user_teams_${user.walletAddress}`, JSON.stringify(updatedUserTeamIds));

      loadTeams();
      return true;
    } catch (error) {
      console.error('Failed to leave team:', error);
      return false;
    }
  }, [user, loadTeams]);

  const getTeam = useCallback((id: string): Team | undefined => {
    return teams.find(team => team.id === id);
  }, [teams]);

  const inviteToTeam = useCallback((teamId: string, emails: string[]): boolean => {
    if (!user) return false;

    try {
      const existingTeams = JSON.parse(localStorage.getItem('teams') || '{}');
      const team = existingTeams[teamId];

      if (!team) return false;

      // Check if user has permission to invite
      const userMember = team.members.find((member: TeamMember) => 
        member.walletAddress === user.walletAddress
      );

      if (!userMember || (userMember.role === 'member' && !team.settings.allowMemberInvites)) {
        return false;
      }

      // Add pending invitations
      const validEmails = emails.filter(email => email.trim() && email.includes('@'));
      
      validEmails.forEach(email => {
        const existingMember = team.members.find((member: TeamMember) => 
          member.email === email.trim()
        );

        if (!existingMember) {
          const newMember: TeamMember = {
            id: `invite_${Date.now()}_${Math.random()}`,
            email: email.trim(),
            role: 'member',
            status: 'pending',
            invitedAt: new Date().toISOString()
          };
          team.members.push(newMember);
        }
      });

      existingTeams[teamId] = team;
      localStorage.setItem('teams', JSON.stringify(existingTeams));

      loadTeams();
      return true;
    } catch (error) {
      console.error('Failed to invite to team:', error);
      return false;
    }
  }, [user, loadTeams]);

  const isTeamMember = useCallback((teamId: string): boolean => {
    if (!user) return false;
    return userTeams.some(team => team.id === teamId);
  }, [user, userTeams]);

  const getTeamRole = useCallback((teamId: string): 'owner' | 'admin' | 'member' | null => {
    if (!user) return null;
    
    const team = userTeams.find(t => t.id === teamId);
    if (!team) return null;

    const member = team.members.find(m => m.walletAddress === user.walletAddress);
    return member?.role || null;
  }, [user, userTeams]);

  return (
    <TeamsContext.Provider value={{
      teams,
      userTeams,
      loading,
      createTeam,
      joinTeam,
      leaveTeam,
      getTeam,
      inviteToTeam,
      isTeamMember,
      getTeamRole
    }}>
      {children}
    </TeamsContext.Provider>
  );
};

export const useTeams = () => {
  const context = useContext(TeamsContext);
  if (context === undefined) {
    throw new Error('useTeams must be used within a TeamsProvider');
  }
  return context;
}; 