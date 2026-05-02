"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { UserButton, useAuth } from "@clerk/nextjs";

export function Navbar() {
  const { isLoaded, userId } = useAuth();

  return (
    <header className="sticky top-0 z-50 px-6 lg:px-8 h-16 flex items-center justify-between border-b border-border/40 bg-bg/70 backdrop-blur-xl transition-all">
      <Link className="flex items-center gap-2" href="/">
        <div className="bg-accent/10 p-1.5 rounded-md">
          <Globe className="h-5 w-5 text-accent" />
        </div>
        <span className="text-xl font-bold tracking-tight">LogisticsPro</span>
      </Link>
      <nav className="hidden md:flex gap-6 items-center absolute left-1/2 -translate-x-1/2">
        <Link className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors" href="/#features">Features</Link>
        <Link className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors" href="/solutions">Solutions</Link>
        <Link className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors" href="/pricing">Pricing</Link>
      </nav>
      <div className="flex gap-4 items-center">
        {isLoaded && userId ? (
          <>
            <Link className="text-sm font-medium hover:text-accent transition-colors hidden sm:block" href="/dashboard">
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </>
        ) : (
          <>
            <Link className="text-sm font-medium hover:text-accent transition-colors hidden sm:block" href="/sign-in">
              Sign In
            </Link>
            <Button render={<Link href="/sign-up" />} nativeButton={false} size="sm" className="shadow-none">
              Get Started
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
