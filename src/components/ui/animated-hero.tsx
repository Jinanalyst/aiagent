"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["Ideas", "Dreams", "Prompts", "Sketches", "APIs", "Words", "Thoughts"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber((prev) => (prev + 1) % titles.length);
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl tracking-tighter font-regular flex gap-x-4 flex-wrap justify-center">
              <span>Turn</span>
              <span className="relative text-primary font-semibold">
                <span className="invisible">Thoughts</span> {/* Placeholder for width */}
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute left-0"
                    initial={{ opacity: 0 }}
                    animate={titleNumber === index ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.5, ease: "linear" }}
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
              <span>into Code</span>
            </h1>
          </div>
          <div className="flex flex-row gap-3 mt-8">
            <Button size="lg" variant="outline" className="gap-4" asChild>
              <Link href="/generate">Start for free</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero }; 