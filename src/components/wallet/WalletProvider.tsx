"use client";

import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { 
    PhantomWalletAdapter,
    TrustWalletAdapter,
    SolflareWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { UserProvider } from '@/hooks/useUser';
import { ProjectsProvider } from '@/hooks/useProjects';

const AppContent: FC<{ children: ReactNode }> = ({ children }) => {
    const { publicKey } = useWallet();
    const walletAddress = publicKey ? publicKey.toBase58() : null;

    return (
        <UserProvider walletPublicKey={walletAddress}>
            <ProjectsProvider>
                {children}
            </ProjectsProvider>
        </UserProvider>
    );
};

const Wallet: FC<{ children: ReactNode }> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new TrustWalletAdapter(),
      new SolflareWalletAdapter({ network }),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets}>
        <WalletModalProvider>
          <AppContent>
            {children}
          </AppContent>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};

export default Wallet;