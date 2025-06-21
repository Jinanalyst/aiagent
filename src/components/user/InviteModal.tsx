"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Link as LinkIcon, Zap, Crown, MessageSquare } from "lucide-react";
import Image from "next/image";

interface InviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteModal({ open, onOpenChange }: InviteModalProps) {
  const inviteLink = "https://lovable.dev/invite/ed5d89a4-b5c4-45"; // Replace with actual generated link

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
            <div className="relative h-40 w-full mb-4">
                 <Image src="https://placehold.co/400x160/d3b3ff/a279ff?text=+" alt="Spread the love" layout="fill" objectFit="cover" className="rounded-t-lg" />
                 <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium">
                    Earn 10+ credits
                 </div>
            </div>
          <DialogTitle className="text-2xl font-bold text-center">Spread the love</DialogTitle>
          <DialogDescription className="text-center">
            and earn free credits
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <h3 className="text-lg font-semibold mb-2">How it works:</h3>
            <div className="space-y-3 text-muted-foreground">
                <div className="flex items-center space-x-3">
                    <Zap className="h-5 w-5 text-primary" />
                    <span>Share your invite link</span>
                </div>
                <div className="flex items-center space-x-3">
                    <Crown className="h-5 w-5 text-primary" />
                    <span>They sign up and get <span className="font-bold text-foreground">extra 10 credits</span></span>
                </div>
                <div className="flex items-center space-x-3">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <span>You get <span className="font-bold text-foreground">10 credits</span> once they publish their first website</span>
                </div>
            </div>

        </div>
        <div>
            <label htmlFor="invite-link" className="text-sm font-medium">Your invite link:</label>
            <div className="flex w-full items-center space-x-2 mt-1">
                <Input
                    id="invite-link"
                    value={inviteLink}
                    readOnly
                    className="flex-1"
                />
                <Button type="submit" size="sm" className="px-3" onClick={() => navigator.clipboard.writeText(inviteLink)}>
                    <span className="sr-only">Copy</span>
                    <Copy className="h-4 w-4" />
                </Button>
            </div>
        </div>
        <div className="text-center mt-4">
            <a href="#" className="text-xs text-muted-foreground underline">View Terms and Conditions</a>
        </div>
      </DialogContent>
    </Dialog>
  )
} 