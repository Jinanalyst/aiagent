import { Navigation } from "@/components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { UserNav } from "@/components/user/UserNav";

export default function AccountPage() {
    const { connected, publicKey, disconnect } = useWallet();

    if (!connected) {
        return (
             <div className="flex flex-col min-h-screen">
                <Navigation />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">Please connect your wallet</h2>
                        <p className="text-muted-foreground">Connect your wallet to view your account details.</p>
                    </div>
                </main>
            </div>
        )
    }

  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Account</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Plan & Credits</CardTitle>
                    <CardDescription>
                        View your current plan and credit usage.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                            <h3 className="font-semibold">Current Plan</h3>
                            <p className="text-sm text-muted-foreground">Your are currently on the Free plan.</p>
                        </div>
                        <Button variant="outline" asChild>
                            <a href="/pricing">Upgrade</a>
                        </Button>
                    </div>
                     <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                            <h3 className="font-semibold">Credits</h3>
                            <p className="text-sm text-muted-foreground">You have 5/5 daily credits remaining.</p>
                        </div>
                        <Button variant="outline" asChild>
                           <a href="/pricing">Get More</a>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Logout</CardTitle>
                     <CardDescription>
                        Sign out of your account.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="destructive" onClick={() => disconnect()}>
                        Log Out
                    </Button>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
} 