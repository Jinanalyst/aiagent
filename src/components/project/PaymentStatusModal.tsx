"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useMemo } from "react";
import { useConnection } from "@solana/wallet-adapter-react";

type Status = "processing" | "success" | "error";

interface PaymentStatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: Status;
  signature?: string;
  error?: string;
}

export function PaymentStatusModal({ open, onOpenChange, status, signature, error }: PaymentStatusModalProps) {
  const { connection } = useConnection()
  const explorerUrl = useMemo(() => {
    if(!signature) return ''
    const endpoint = connection.rpcEndpoint
    const cluster = endpoint.includes('devnet') ? 'devnet' : 'mainnet-beta'
    return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
  }, [signature, connection])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment Status</DialogTitle>
          <DialogDescription>
            {status === "processing" && "Your transaction is being processed."}
            {status === "success" && "Your payment was successful!"}
            {status === "error" && "There was an error with your payment."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8">
          {status === "processing" && <Loader2 className="h-16 w-16 animate-spin text-primary" />}
          {status === "success" && <CheckCircle className="h-16 w-16 text-green-500" />}
          {status === "error" && <XCircle className="h-16 w-16 text-red-500" />}

          {signature && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 text-sm text-blue-500 hover:underline"
            >
              View Transaction on Explorer
            </a>
          )}
          {status === "error" && <p className="mt-4 text-sm text-red-500">{error || "Something went wrong."}</p>}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 