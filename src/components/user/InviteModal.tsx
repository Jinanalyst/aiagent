"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Mail, Users, Plus } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId?: string;
}

export function InviteModal({ isOpen, onClose, teamId }: InviteModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  const generateInviteLink = () => {
    const linkId = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const link = `${window.location.origin}/team/join/${linkId}`;
    
    // Save invite to localStorage
    const invites = JSON.parse(localStorage.getItem('team_invites') || '{}');
    invites[linkId] = {
      id: linkId,
      teamId: teamId || 'default-team',
      email: 'invite-link',
      role: role,
      invitedAt: new Date().toISOString(),
      status: 'pending'
    };
    localStorage.setItem('team_invites', JSON.stringify(invites));
    
    setInviteLink(link);
  };

  const sendEmailInvite = async () => {
    if (!email) return;
    
    setIsInviting(true);
    
    try {
      // Simulate sending email invite
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save invite to localStorage
      const inviteId = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const invites = JSON.parse(localStorage.getItem('team_invites') || '{}');
      invites[inviteId] = {
        id: inviteId,
        teamId: teamId || 'default-team',
        email: email,
        role: role,
        invitedAt: new Date().toISOString(),
        status: 'pending'
      };
      localStorage.setItem('team_invites', JSON.stringify(invites));
      
      alert(`Invite sent to ${email}!`);
      setEmail('');
      onClose();
    } catch (error) {
      console.error('Failed to send invite:', error);
      alert('Failed to send invite. Please try again.');
    } finally {
      setIsInviting(false);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert('Invite link copied to clipboard!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Invite Team Members</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Email Invite */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-blue-400" />
              <Label className="text-sm font-medium">Send Email Invitation</Label>
            </div>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="email" className="text-sm text-gray-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="role" className="text-sm text-gray-300">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={sendEmailInvite}
                disabled={!email || isInviting}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isInviting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </div>
          
          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-800 px-2 text-gray-400">Or</span>
            </div>
          </div>
          
          {/* Invite Link */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Copy className="h-4 w-4 text-green-400" />
              <Label className="text-sm font-medium">Share Invite Link</Label>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={generateInviteLink}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate Invite Link
              </Button>
              
              {inviteLink && (
                <div className="flex space-x-2">
                  <Input
                    value={inviteLink}
                    readOnly
                    className="bg-gray-700 border-gray-600 text-white flex-1"
                  />
                  <Button 
                    onClick={copyInviteLink}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 