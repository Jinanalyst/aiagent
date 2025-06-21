"use client";

import { useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useUser, Plan } from "@/hooks/useUser";
import Link from 'next/link';
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { PaymentStatusModal } from "@/components/project/PaymentStatusModal";

type PaymentStatus = "processing" | "success" | "error";

const tiers: {
  name: Plan;
  solPrice: number;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}[] = [
  {
    name: "FREE",
    solPrice: 0,
    description: "For individuals and small projects.",
    features: ["5 credits/month", "Basic component generation", "Community support"],
    cta: "Start for Free",
  },
  {
    name: "PRO",
    solPrice: 0.5,
    description: "For professional developers and teams.",
    features: ["100 credits/month", "Advanced component generation", "AI code completion", "Priority email support"],
    cta: "Upgrade to Pro",
    popular: true,
  },
  {
    name: "PREMIUM",
    solPrice: 1,
    description: "For large-scale applications and businesses.",
    features: ["Unlimited credits", "Team collaboration features", "Dedicated support & onboarding", "Access to beta features"],
    cta: "Upgrade to Premium",
  },
];

export default function PricingPage() {
  const { user, upgradePlan } = useUser();
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);

  const [isModalOpen, setModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("processing");
  const [signature, setSignature] = useState<string | undefined>();
  const [paymentError, setPaymentError] = useState<string | undefined>();

  const handleUpgrade = async (tier: typeof tiers[0]) => {
    if (!publicKey || !signTransaction) {
      alert('Please connect your wallet first.');
      return;
    }

    setLoadingPlan(tier.name);
    setModalOpen(true);
    setPaymentStatus("processing");
    setSignature(undefined);
    setPaymentError(undefined);

    try {
      const recipient = new PublicKey('DXMH7DLXRMHqpwSESmJ918uFhFQSxzvKEb7CA1ZDj1a2');
      
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: publicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipient,
          lamports: tier.solPrice * LAMPORTS_PER_SOL,
        })
      );

      const signedTransaction = await signTransaction(transaction);
      const txSignature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      setSignature(txSignature);
      
      const confirmation = await connection.confirmTransaction({
        signature: txSignature,
        blockhash,
        lastValidBlockHeight
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction Confirmation Failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      setPaymentStatus("success");
      upgradePlan(tier.name);

    } catch (error: any) {
      console.error('Payment failed with error:', error);
      let errorMessage = 'An unknown error occurred.';
      if (error.name === 'WalletSignTransactionError') {
        errorMessage = 'Transaction signing was rejected. Please try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      setPaymentStatus("error");
      setPaymentError(errorMessage);
    } finally {
      setLoadingPlan(null);
    }
  };

  const getButtonContent = (tier: typeof tiers[0]) => {
    if (loadingPlan === tier.name) {
      return <Button className="w-full" disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</Button>;
    }
    
    if (tier.name === user?.plan) {
      return <Button className="w-full" disabled>Your Current Plan</Button>;
    }

    if (tier.name === 'FREE') {
      return <Link href="/generate" className="w-full"><Button className="w-full">Get Started</Button></Link>;
    }

    return <Button className="w-full" onClick={() => handleUpgrade(tier)}>{tier.cta}</Button>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PaymentStatusModal 
        open={isModalOpen} 
        onOpenChange={setModalOpen} 
        status={paymentStatus}
        signature={signature}
        error={paymentError}
      />
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-24">
        <section className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4">
            Find the perfect plan
          </h1>
          <p className="max-w-2xl mx-auto mb-8 text-muted-foreground md:text-lg">
            Start for free, then upgrade to a plan that fits your needs.
          </p>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mt-12">
          {tiers.map((tier) => (
            <Card key={tier.name} className={`flex flex-col ${user?.plan === tier.name ? 'border-primary' : ''}`}>
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {tier.solPrice} SOL
                  </span>
                  <span className="text-muted-foreground">
                    {tier.name === 'FREE' ? '' : '/ month'}
                  </span>
                </div>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {getButtonContent(tier)}
              </CardFooter>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
} 