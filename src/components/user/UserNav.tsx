"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useWallet } from "@solana/wallet-adapter-react";
import { CreditCard, LogOut, Settings, Plus, Users, Gift, HelpCircle, Palette, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { InviteModal } from "./InviteModal";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";

export function UserNav() {
  const { publicKey, disconnect } = useWallet();
  const { theme, setTheme } = useTheme();
  const { user } = useUser();
  const [mounted, setMounted] = useState(false);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!publicKey) return null;

  const userName = publicKey.toBase58().slice(0, 4) + '...' + publicKey.toBase58().slice(-4);
  const userEmail = "user@example.com"; // Replace with actual user email if available

  return (
    <>
      <InviteModal open={isInviteModalOpen} onOpenChange={setInviteModalOpen} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src="/avatars/01.png" alt="@shadcn" />
              <AvatarFallback>{userName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-gray-900 text-gray-50" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none text-white">{userName}</p>
              <p className="text-xs leading-none text-gray-400">
                {userEmail}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuGroup>
            <Link href="/workspace/settings" passHref>
              <DropdownMenuItem className="focus:bg-gray-800 focus:text-white">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </Link>
            {user?.plan === 'PREMIUM' && (
              <DropdownMenuItem className="focus:bg-gray-800 focus:text-white" onClick={() => setInviteModalOpen(true)}>
                <Users className="mr-2 h-4 w-4" />
                <span>Invite</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-gray-700" />
          <Link href="/workspace/create" passHref>
            <DropdownMenuItem className="focus:bg-gray-800 focus:text-white">
              <Plus className="mr-2 h-4 w-4" />
              <span>Create new workspace</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem className="focus:bg-gray-800 focus:text-white">
              <Gift className="mr-2 h-4 w-4" />
              <span>Get free credits</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-gray-800 focus:text-white">
              <HelpCircle className="mr-2 h-4 w-4" />
              <span>Help Center</span>
          </DropdownMenuItem>
          <DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem className="focus:bg-gray-800 focus:text-white" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  <Palette className="mr-2 h-4 w-4" />
                  <span>Appearance</span>
                  <span className="ml-auto">
                      {mounted ? (theme === "dark" ? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>) : null}
                  </span>
              </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem className="focus:bg-gray-800 focus:text-white" onClick={() => disconnect()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
} 