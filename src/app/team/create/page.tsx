"use client";

import React, { useState } from 'react';
import { ProfileSidebar } from '@/components/ui/profile-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Users, 
  Plus, 
  Mail, 
  Copy, 
  Check,
  ArrowLeft
} from 'lucide-react';

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

export default function CreateTeamPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState<'create' | 'invite' | 'success'>('create');
  const [teamData, setTeamData] = useState({
    name: '',
    description: '',
    plan: 'free' as const
  });
  const [inviteEmails, setInviteEmails] = useState(['']);
  const [createdTeam, setCreatedTeam] = useState<Team | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateTeam = () => {
    if (!user || !teamData.name.trim()) return;

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

    // Save team to localStorage
    const existingTeams = JSON.parse(localStorage.getItem('teams') || '{}');
    existingTeams[newTeam.id] = newTeam;
    localStorage.setItem('teams', JSON.stringify(existingTeams));

    // Save user's team membership
    const userTeams = JSON.parse(localStorage.getItem(`user_teams_${user.walletAddress}`) || '[]');
    userTeams.push(newTeam.id);
    localStorage.setItem(`user_teams_${user.walletAddress}`, JSON.stringify(userTeams));

    setCreatedTeam(newTeam);
    setStep('invite');
  };

  const addInviteEmail = () => {
    setInviteEmails([...inviteEmails, '']);
  };

  const updateInviteEmail = (index: number, email: string) => {
    const updated = [...inviteEmails];
    updated[index] = email;
    setInviteEmails(updated);
  };

  const removeInviteEmail = (index: number) => {
    setInviteEmails(inviteEmails.filter((_, i) => i !== index));
  };

  const sendInvites = () => {
    if (!createdTeam) return;

    const validEmails = inviteEmails.filter(email => email.trim() && email.includes('@'));
    
    // In a real app, you'd send actual emails
    // For now, we'll just simulate the invite process
    const updatedMembers = [...createdTeam.members];
    
    validEmails.forEach(email => {
      const newMember: TeamMember = {
        id: `invite_${Date.now()}_${Math.random()}`,
        email: email.trim(),
        role: 'member',
        status: 'pending',
        invitedAt: new Date().toISOString()
      };
      updatedMembers.push(newMember);
    });

    const updatedTeam = { ...createdTeam, members: updatedMembers };
    
    // Update localStorage
    const existingTeams = JSON.parse(localStorage.getItem('teams') || '{}');
    existingTeams[updatedTeam.id] = updatedTeam;
    localStorage.setItem('teams', JSON.stringify(existingTeams));

    setCreatedTeam(updatedTeam);
    setStep('success');
  };

  const copyInviteLink = () => {
    if (!createdTeam) return;
    
    const inviteLink = `${window.location.origin}/team/join/${createdTeam.id}`;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderCreateStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-white mb-2">Create a team</h1>
        <p className="text-gray-400">Collaborate with your team members on AI projects</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Team name</label>
          <Input
            value={teamData.name}
            onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
            placeholder="Enter team name"
            className="bg-gray-700 border-gray-600 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">Description (optional)</label>
          <Textarea
            value={teamData.description}
            onChange={(e) => setTeamData({ ...teamData, description: e.target.value })}
            placeholder="What's this team for?"
            className="bg-gray-700 border-gray-600 text-white resize-none"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-4">Team plan</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'free', name: 'Free', price: '$0', members: '3 members', credits: '50 shared credits' },
              { id: 'pro', name: 'Pro', price: '$20/month', members: '10 members', credits: '500 shared credits' },
              { id: 'enterprise', name: 'Enterprise', price: '$100/month', members: '50 members', credits: '2000 shared credits' }
            ].map((plan) => (
              <div
                key={plan.id}
                onClick={() => setTeamData({ ...teamData, plan: plan.id as any })}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  teamData.plan === plan.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <h3 className="font-semibold text-white">{plan.name}</h3>
                <p className="text-lg font-bold text-white">{plan.price}</p>
                <p className="text-sm text-gray-400">{plan.members}</p>
                <p className="text-sm text-gray-400">{plan.credits}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateTeam}
            disabled={!teamData.name.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Create team
          </Button>
        </div>
      </div>
    </div>
  );

  const renderInviteStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Invite team members</h1>
        <p className="text-gray-400">Add members to {createdTeam?.name}</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-4">Email addresses</label>
          <div className="space-y-3">
            {inviteEmails.map((email, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  value={email}
                  onChange={(e) => updateInviteEmail(index, e.target.value)}
                  placeholder="colleague@company.com"
                  className="flex-1 bg-gray-700 border-gray-600 text-white"
                />
                {inviteEmails.length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeInviteEmail(index)}
                    className="border-gray-600 text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <Button
            variant="outline"
            onClick={addInviteEmail}
            className="mt-3 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add another email
          </Button>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-lg font-medium text-white mb-2">Or share invite link</h3>
          <div className="flex space-x-2">
            <Input
              value={`${typeof window !== 'undefined' ? window.location.origin : ''}/team/join/${createdTeam?.id}`}
              readOnly
              className="flex-1 bg-gray-700 border-gray-600 text-gray-300"
            />
            <Button
              onClick={copyInviteLink}
              className={copied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => setStep('success')}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Skip for now
          </Button>
          <Button
            onClick={sendInvites}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Send invites
          </Button>
        </div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-gray-800 rounded-lg p-8">
        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Users className="h-8 w-8 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">Team created successfully!</h1>
        <p className="text-gray-400 mb-8">
          {createdTeam?.name} is ready to go. Team members will receive email invitations to join.
        </p>

        <div className="bg-gray-700 rounded-lg p-4 mb-8">
          <h3 className="font-medium text-white mb-2">Team details</h3>
          <div className="text-sm text-gray-300 space-y-1">
            <p><span className="text-gray-400">Name:</span> {createdTeam?.name}</p>
            <p><span className="text-gray-400">Plan:</span> {createdTeam?.plan}</p>
            <p><span className="text-gray-400">Members:</span> {createdTeam?.members.length}</p>
            <p><span className="text-gray-400">Shared credits:</span> {createdTeam?.settings.sharedCredits}</p>
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push('/settings')}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Back to Settings
          </Button>
          <Button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <>
        <ProfileSidebar />
        <div className="flex items-center justify-center h-screen bg-gray-900">
          <p className="text-gray-400">Please connect your wallet to create a team.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <ProfileSidebar />
      <div className="min-h-screen bg-gray-900 text-white p-8">
        {step === 'create' && renderCreateStep()}
        {step === 'invite' && renderInviteStep()}
        {step === 'success' && renderSuccessStep()}
      </div>
    </>
  );
} 