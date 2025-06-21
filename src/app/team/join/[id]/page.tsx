"use client";

import React, { useState, useEffect } from 'react';
import { ProfileSidebar } from '@/components/ui/profile-sidebar';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';
import { useRouter, useParams } from 'next/navigation';
import { Users, Check, X, ArrowLeft } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: any[];
  createdAt: string;
  plan: 'free' | 'pro' | 'enterprise';
  settings: {
    allowMemberInvites: boolean;
    sharedCredits: number;
    maxMembers: number;
  };
}

export default function JoinTeamPage() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const teamId = params.id as string;
    if (teamId) {
      // Load team from localStorage
      const existingTeams = JSON.parse(localStorage.getItem('teams') || '{}');
      const foundTeam = existingTeams[teamId];
      
      if (foundTeam) {
        setTeam(foundTeam);
      } else {
        setError('Team not found or invitation is invalid.');
      }
    }
    setLoading(false);
  }, [params.id]);

  const handleJoinTeam = async () => {
    if (!user || !team) return;

    setJoining(true);

    try {
      // Check if user is already a member
      const isAlreadyMember = team.members.some(
        member => member.walletAddress === user.walletAddress || member.email === `${user.walletAddress.slice(0, 8)}@wallet.local`
      );

      if (isAlreadyMember) {
        setError('You are already a member of this team.');
        setJoining(false);
        return;
      }

      // Check if team has reached max members
      if (team.members.length >= team.settings.maxMembers) {
        setError('This team has reached its maximum number of members.');
        setJoining(false);
        return;
      }

      // Add user to team
      const newMember = {
        id: user.walletAddress,
        email: `${user.walletAddress.slice(0, 8)}@wallet.local`,
        walletAddress: user.walletAddress,
        role: 'member' as const,
        status: 'active' as const,
        invitedAt: new Date().toISOString()
      };

      const updatedTeam = {
        ...team,
        members: [...team.members, newMember]
      };

      // Update team in localStorage
      const existingTeams = JSON.parse(localStorage.getItem('teams') || '{}');
      existingTeams[team.id] = updatedTeam;
      localStorage.setItem('teams', JSON.stringify(existingTeams));

      // Add team to user's teams
      const userTeams = JSON.parse(localStorage.getItem(`user_teams_${user.walletAddress}`) || '[]');
      if (!userTeams.includes(team.id)) {
        userTeams.push(team.id);
        localStorage.setItem(`user_teams_${user.walletAddress}`, JSON.stringify(userTeams));
      }

      // Redirect to dashboard with success message
      router.push('/dashboard?joined=' + team.name);
          } catch {
      setError('Failed to join team. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <>
        <ProfileSidebar />
        <div className="flex items-center justify-center h-screen bg-gray-900">
          <p className="text-gray-400">Loading team invitation...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ProfileSidebar />
        <div className="min-h-screen bg-gray-900 text-white p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <X className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Unable to join team</h1>
              <p className="text-gray-400 mb-8">{error}</p>
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <ProfileSidebar />
        <div className="min-h-screen bg-gray-900 text-white p-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Join {team?.name}</h1>
              <p className="text-gray-400 mb-8">Connect your wallet to join this team and start collaborating on AI projects.</p>
              <Button
                onClick={() => router.push('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ProfileSidebar />
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="bg-gray-800 rounded-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">You've been invited to join</h1>
              <h2 className="text-2xl font-semibold text-blue-400 mb-4">{team?.name}</h2>
              {team?.description && (
                <p className="text-gray-400 mb-6">{team.description}</p>
              )}
            </div>

            <div className="bg-gray-700 rounded-lg p-6 mb-8">
              <h3 className="font-medium text-white mb-4">Team details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Plan:</span>
                  <span className="text-white ml-2 capitalize">{team?.plan}</span>
                </div>
                <div>
                  <span className="text-gray-400">Members:</span>
                  <span className="text-white ml-2">{team?.members.length}/{team?.settings.maxMembers}</span>
                </div>
                <div>
                  <span className="text-gray-400">Shared credits:</span>
                  <span className="text-white ml-2">{team?.settings.sharedCredits}</span>
                </div>
                <div>
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white ml-2">{team ? new Date(team.createdAt).toLocaleDateString() : ''}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-8">
              <h4 className="font-medium text-blue-400 mb-2">What you'll get access to:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Shared team credits for AI model usage</li>
                <li>• Collaborative project workspace</li>
                <li>• Team chat and project history</li>
                <li>• Shared templates and knowledge base</li>
              </ul>
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Maybe later
              </Button>
              <Button
                onClick={handleJoinTeam}
                disabled={joining}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {joining ? 'Joining...' : 'Join team'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 