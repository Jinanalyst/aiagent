"use client";

import { Hero } from "@/components/ui/animated-hero";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for referral parameter
    const referralId = searchParams.get('ref');
    if (referralId) {
      // Store referral ID in localStorage for later use when user signs up
      localStorage.setItem('referralId', referralId);
      
      // Show a toast or notification about the referral
      console.log('Referral ID detected:', referralId);
    }
  }, [searchParams]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <Hero />
    </main>
  );
}
