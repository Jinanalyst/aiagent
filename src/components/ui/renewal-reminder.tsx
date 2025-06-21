"use client";

import { useUser } from "@/hooks/useUser";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, Clock, CreditCard } from "lucide-react";
import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

export function RenewalReminder() {
  const { user, subscriptionStatus, renewSubscription, dismissRenewalReminder } = useUser();
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [isRenewing, setIsRenewing] = useState(false);

  if (!user || !subscriptionStatus || !subscriptionStatus.showRenewalReminder) {
    return null;
  }

  const handleRenewal = async () => {
    if (!publicKey || !signTransaction) {
      alert('Please connect your wallet first.');
      return;
    }

    setIsRenewing(true);

    try {
      const recipient = new PublicKey('DXMH7DLXRMHqpwSESmJ918uFhFQSxzvKEb7CA1ZDj1a2');
      const solPrice = user.plan === 'PRO' ? 0.5 : 1.0; // PRO: 0.5 SOL, PREMIUM: 1 SOL
      
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: publicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipient,
          lamports: solPrice * LAMPORTS_PER_SOL,
        })
      );

      const signedTransaction = await signTransaction(transaction);
      const txSignature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      const confirmation = await connection.confirmTransaction({
        signature: txSignature,
        blockhash,
        lastValidBlockHeight
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction Confirmation Failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      renewSubscription(user.plan);
      alert('Subscription renewed successfully!');

    } catch (error: any) {
      console.error('Renewal failed:', error);
      alert(`Renewal failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsRenewing(false);
    }
  };

  const isExpired = subscriptionStatus.isExpired;
  const daysLeft = subscriptionStatus.daysUntilExpiry;

  return (
    <Alert className={`mb-4 ${isExpired ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {isExpired ? (
            <CreditCard className="h-5 w-5 text-red-500 mt-0.5" />
          ) : (
            <Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
          )}
          <div className="flex-1">
            <AlertDescription>
              {isExpired ? (
                <div>
                  <p className="font-semibold text-red-700">Your {user.plan} subscription has expired!</p>
                  <p className="text-red-600 mt-1">
                    Your account has been downgraded to FREE plan. Renew now to restore your {user.plan} benefits.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-yellow-700">
                    Your {user.plan} subscription expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                  </p>
                  <p className="text-yellow-600 mt-1">
                    Renew now to continue enjoying unlimited access and avoid any service interruption.
                  </p>
                </div>
              )}
            </AlertDescription>
            <div className="flex items-center space-x-2 mt-3">
              <Button
                onClick={handleRenewal}
                disabled={isRenewing}
                size="sm"
                className={isExpired ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'}
              >
                {isRenewing ? 'Processing...' : `Renew ${user.plan} Plan`}
              </Button>
              <Button
                onClick={dismissRenewalReminder}
                variant="outline"
                size="sm"
              >
                Remind me later
              </Button>
            </div>
          </div>
        </div>
        <Button
          onClick={dismissRenewalReminder}
          variant="ghost"
          size="sm"
          className="p-1 h-auto"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
} 