"use client";

import { FC, useState, useCallback } from 'react';
import { useWallet, Wallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';
import { Wallet as WalletIcon, LogOut } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"

export const WalletConnect: FC = () => {
  const { publicKey, connected, disconnect, wallets, select, connecting, connect } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleWalletSelect = useCallback(async (walletName: Wallet['adapter']['name']) => {
    try {
      if (walletName) {
        select(walletName);
        // Give a small delay for the wallet to be selected
        setTimeout(async () => {
          try {
            await connect();
          } catch (error) {
            console.error('Failed to connect wallet:', error);
          }
        }, 100);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error selecting wallet:', error);
    }
  }, [select, connect]);

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => disconnect()}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </Button>
      </div>
    );
  }

  const installedWallets = wallets.filter(w => w.readyState === 'Installed');

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <Button>
          <WalletIcon className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">Connect a wallet</DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Select a wallet on Solana to continue.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          {installedWallets.length > 0 ? (
            installedWallets.map((wallet) => (
              <Button
                key={wallet.adapter.name}
                onClick={() => handleWalletSelect(wallet.adapter.name)}
                variant="outline"
                className="w-full flex justify-between items-center p-4 h-16 text-base border-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                disabled={connecting}
              >
                <div className="flex items-center">
                  <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-8 h-8 mr-3" />
                  <span className="font-medium text-gray-900 dark:text-white">{wallet.adapter.name}</span>
                </div>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">Detected</span>
              </Button>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No wallets detected.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Please install a Solana wallet.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 