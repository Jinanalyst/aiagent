"use client";

import React, { useState, useEffect } from 'react';
import { ProfileSidebar } from '@/components/ui/profile-sidebar';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, Shield, Loader2 } from 'lucide-react';

interface TeamInvite {
    id: string;
    teamId: string;
    email: string;
    role: string;
    invitedAt: string;
    status: 'pending' | 'accepted' | 'rejected';
}

interface Team {
    id: string;
    name: string;
    description: string;
    plan: string;
    ownerId: string;
    members: Array<{
        id: string;
        email: string;
        walletAddress: string;
        role: string;
        status: string;
        joinedAt: string;
    }>;
    settings: {
        sharedCredits: number;
    };
    createdAt: string;
}

export default function JoinTeamPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();
    const [invite, setInvite] = useState<TeamInvite | null>(null);
    const [team, setTeam] = useState<Team | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);

    useEffect(() => {
        const inviteId = params.id as string;
        
        // Load invite data
        const allInvites = JSON.parse(localStorage.getItem('team_invites') || '{}');
        const foundInvite = allInvites[inviteId];
        
        if (foundInvite) {
            setInvite(foundInvite);
            
            // Load team data
            const allTeams = JSON.parse(localStorage.getItem('teams') || '{}');
            const foundTeam = allTeams[foundInvite.teamId];
            setTeam(foundTeam);
        }
        
        setIsLoading(false);
    }, [params.id]);

    const handleJoinTeam = async () => {
        if (!user || !invite || !team) return;
        
        setIsJoining(true);
        
        try {
            // Add user to team members
            const allTeams = JSON.parse(localStorage.getItem('teams') || '{}');
            const updatedTeam = { ...allTeams[team.id] };
            
            updatedTeam.members.push({
                id: user.walletAddress,
                email: `${user.walletAddress.slice(0, 8)}@wallet.local`,
                walletAddress: user.walletAddress,
                role: invite.role,
                status: 'active',
                joinedAt: new Date().toISOString()
            });
            
            allTeams[team.id] = updatedTeam;
            localStorage.setItem('teams', JSON.stringify(allTeams));
            
            // Add team to user's teams
            const userTeams = JSON.parse(localStorage.getItem(`user_teams_${user.walletAddress}`) || '[]');
            if (!userTeams.includes(team.id)) {
                userTeams.push(team.id);
                localStorage.setItem(`user_teams_${user.walletAddress}`, JSON.stringify(userTeams));
            }
            
            // Update invite status
            const allInvites = JSON.parse(localStorage.getItem('team_invites') || '{}');
            allInvites[invite.id] = { ...invite, status: 'accepted' };
            localStorage.setItem('team_invites', JSON.stringify(allInvites));
            
            // Redirect to settings
            router.push('/settings?section=team');
            
        } catch (error) {
            console.error('Error joining team:', error);
        } finally {
            setIsJoining(false);
        }
    };

    if (isLoading) {
        return (
            <>
                <ProfileSidebar />
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            </>
        );
    }

    if (!invite || !team) {
        return (
            <>
                <ProfileSidebar />
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                    <Card className="w-full max-w-md bg-gray-800 border-gray-700">
                        <CardContent className="p-6 text-center">
                            <h1 className="text-xl font-bold text-white mb-4">Invalid Invite</h1>
                            <p className="text-gray-400 mb-6">
                                This team invitation is invalid or has expired.
                            </p>
                            <Button 
                                onClick={() => router.push('/')}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Go Home
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    if (invite.status === 'accepted') {
        return (
            <>
                <ProfileSidebar />
                <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                    <Card className="w-full max-w-md bg-gray-800 border-gray-700">
                        <CardContent className="p-6 text-center">
                            <h1 className="text-xl font-bold text-white mb-4">Already Joined</h1>
                            <p className="text-gray-400 mb-6">
                                You&apos;ve already joined this team.
                            </p>
                            <Button 
                                onClick={() => router.push('/settings?section=team')}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                View Teams
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </>
        );
    }

    return (
        <>
            <ProfileSidebar />
            <div className="min-h-screen bg-gray-900 p-4">
                <div className="max-w-2xl mx-auto pt-20">
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="text-center">
                            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                                <Users className="h-8 w-8 text-white" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-white">
                                Join Team
                            </CardTitle>
                            <p className="text-gray-400">
                                You&apos;ve been invited to join a team
                            </p>
                        </CardHeader>
                        
                        <CardContent className="space-y-6">
                            {/* Team Info */}
                            <div className="bg-gray-700 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-white mb-2">{team.name}</h3>
                                <p className="text-gray-300 mb-3">{team.description}</p>
                                
                                <div className="flex items-center space-x-4 text-sm text-gray-400">
                                    <div className="flex items-center space-x-1">
                                        <Users className="h-4 w-4" />
                                        <span>{team.members.length} members</span>
                                    </div>
                                    <Badge variant="secondary" className="bg-blue-600 text-white">
                                        {team.plan.toUpperCase()} Plan
                                    </Badge>
                                    <div className="flex items-center space-x-1">
                                        <Shield className="h-4 w-4" />
                                        <span>{team.settings.sharedCredits} credits</span>
                                    </div>
                                </div>
                            </div>

                            {/* Invite Details */}
                            <div className="bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center space-x-3 mb-2">
                                    <Mail className="h-5 w-5 text-blue-400" />
                                    <span className="text-white font-medium">Invitation Details</span>
                                </div>
                                <div className="space-y-2 text-sm text-gray-300">
                                    <div className="flex justify-between">
                                        <span>Role:</span>
                                        <Badge variant="outline" className="border-gray-600 text-gray-300">
                                            {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Invited:</span>
                                        <span>{new Date(invite.invitedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex space-x-4">
                                <Button 
                                    onClick={handleJoinTeam}
                                    disabled={isJoining || !user}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                                >
                                    {isJoining ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Joining...
                                        </>
                                    ) : (
                                        'Join Team'
                                    )}
                                </Button>
                                
                                <Button 
                                    variant="outline"
                                    onClick={() => router.push('/')}
                                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                                >
                                    Decline
                                </Button>
                            </div>

                            {!user && (
                                <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
                                    <p className="text-yellow-400 text-sm">
                                        Please connect your wallet to join the team.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
} 