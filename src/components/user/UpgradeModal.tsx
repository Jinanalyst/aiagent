import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Star, Zap } from "lucide-react"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>You've run out of credits!</DialogTitle>
          <DialogDescription>
            Upgrade your plan to continue generating projects with AI.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
            <div className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                    <h3 className="font-bold flex items-center"><Star className="h-4 w-4 mr-2 text-purple-500"/> Pro Plan</h3>
                    <p className="text-sm text-muted-foreground">Unlimited GPT-4o & Claude Sonnet</p>
                </div>
                <Button onClick={onClose}>Upgrade (0.5 SOL/month)</Button>
            </div>
            <div className="p-4 border rounded-lg flex justify-between items-center">
                <div>
                    <h3 className="font-bold flex items-center"><Zap className="h-4 w-4 mr-2 text-yellow-500"/> Premium Plan</h3>
                    <p className="text-sm text-muted-foreground">Unlimited everything, including Opus</p>
                </div>
                <Button onClick={onClose}>Upgrade (4 SOL/year)</Button>
            </div>
        </div>
        <DialogFooter>
            <Button variant="ghost" onClick={onClose}>Maybe later</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 