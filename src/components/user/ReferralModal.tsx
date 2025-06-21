"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/hooks/useUser';
import { Gift, Copy, Users, Check, X } from 'lucide-react';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReferralModal({ isOpen, onClose }: ReferralModalProps) {
  const { user } = useUser();
  const [referralLink, setReferralLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [referralStats, setReferralStats] = useState({
    tokensEarned: 0,
    freeReferrals: 0,
    proReferrals: 0
  });

  useEffect(() => {
    if (user && isOpen) {
      // Generate referral link based on user's wallet address
      const referralId = user.walletAddress.slice(-8); // Use last 8 characters as referral ID
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      setReferralLink(`${baseUrl}/?ref=${referralId}`);
      
      // Load referral stats from localStorage
      const savedStats = localStorage.getItem(`referrals_${user.walletAddress}`);
      if (savedStats) {
        setReferralStats(JSON.parse(savedStats));
      }
    }
  }, [user, isOpen]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <Gift className="h-6 w-6 text-blue-400" />
            <DialogTitle className="text-xl font-bold text-white">
              Refer Users: Earn Tokens
            </DialogTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-gray-400 hover:text-white"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Reward Information */}
          <div className="space-y-4">
            <p className="text-gray-300">
              Earn <span className="text-white font-bold">10 tokens</span> for yourself & each new user you refer.
            </p>
            <p className="text-gray-300">
              Pro users: earn an additional <span className="text-green-400 font-bold">50 tokens</span> for yourself & your 
              referral when they upgrade to a Pro account within 30 days!
            </p>
          </div>

          {/* Stats */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Gift className="h-5 w-5 text-blue-400" />
              <span className="font-medium">Referral tokens earned</span>
            </div>
            <div className="text-3xl font-bold text-white mb-4">
              {referralStats.tokensEarned}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Free Referrals</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {referralStats.freeReferrals}
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Pro Referrals</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {referralStats.proReferrals}
                </div>
              </div>
            </div>
          </div>

          {/* Referral Link */}
          <div className="space-y-3">
            <p className="font-medium text-white">
              Use your personal referral link to invite users to join Bolt:
            </p>
            
            <div className="flex space-x-2">
              <Input
                value={referralLink}
                readOnly
                className="flex-1 bg-gray-800 border-gray-600 text-gray-300 text-sm"
              />
              <Button
                onClick={handleCopyLink}
                className={`px-4 ${
                  copied 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy link
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium text-white mb-3">How it works:</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start space-x-2">
                <span className="text-blue-400 font-bold">1.</span>
                <span>Share your referral link with friends</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-400 font-bold">2.</span>
                <span>They sign up using your link</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-400 font-bold">3.</span>
                <span>Both of you get 10 tokens instantly</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-400 font-bold">4.</span>
                <span>Earn 50 bonus tokens if they upgrade to Pro within 30 days</span>
              </li>
            </ul>
          </div>

          {/* Social Sharing Buttons */}
          <div className="space-y-3">
            <p className="font-medium text-white">Share on social media:</p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                onClick={() => {
                  const text = `Check out this amazing AI coding platform! Use my referral link to get started: ${referralLink}`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                }}
              >
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                onClick={() => {
                  const text = `Check out this amazing AI coding platform! Use my referral link to get started: ${referralLink}`;
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}&summary=${encodeURIComponent(text)}`, '_blank');
                }}
              >
                LinkedIn
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                onClick={() => {
                  const text = `Check out this amazing AI coding platform! ${referralLink}`;
                  if (navigator.share) {
                    navigator.share({ title: 'AI Coding Platform', text, url: referralLink });
                  } else {
                    navigator.clipboard.writeText(text);
                  }
                }}
              >
                Share
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 