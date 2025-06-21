"use client";

import { usePathname } from 'next/navigation';
import Link from "next/link";
import { Button } from "./button";
import { Badge } from "./badge";
import { Bot, Star, Zap, Gem } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletConnect } from '../wallet/WalletConnect';
import { UserNav } from '../user/UserNav';

export function Navigation() {
    const pathname = usePathname();
    const { connected } = useWallet();
    const [isMounted, setIsMounted] = useState(false);
    const { user, loading } = useUser();
  
    useEffect(() => {
      setIsMounted(true);
    }, []);
  
    const renderUserStatus = () => {
        if (!user || loading) {
            return <Badge variant="outline">Loading...</Badge>;
        }

        switch(user.plan) {
            case 'PRO':
                return <Badge variant="secondary" className="border-purple-500/50"><Star className="h-3 w-3 mr-1 text-purple-500"/> Pro</Badge>;
            case 'PREMIUM':
                return <Badge variant="secondary" className="border-yellow-500/50"><Zap className="h-3 w-3 mr-1 text-yellow-500"/> Premium</Badge>;
            default:
                return <Badge variant="outline"><Gem className="h-3 w-3 mr-1" /> {user.credits} Credits</Badge>;
        }
    };

    const navItems = [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/generate", label: "Generate" },
        { href: "/pricing", label: "Pricing" },
        { href: "/support", label: "Support" },
    ];

    // Don't show navigation on the root landing page
    if (pathname === '/') return null;

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="mr-8 flex items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <Bot className="h-6 w-6" />
                        <span className="font-bold text-lg">DX</span>
                    </Link>
                </div>
                <div className="flex-1 flex items-center justify-between">
                    <nav className="flex items-center space-x-6 text-sm font-medium">
                        {navItems.map(item => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`transition-colors hover:text-foreground/80 ${pathname === item.href ? "text-foreground" : "text-foreground/60"}`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex items-center gap-4">
                        {isMounted ? (
                            connected ? (
                                <>
                                    {renderUserStatus()}
                                    <UserNav />
                                </>
                            ) : (
                                <WalletConnect />
                            )
                        ) : (
                            <Button variant="outline" disabled>Connect Wallet</Button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}