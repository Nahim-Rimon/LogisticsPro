"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, Shield, BarChart3, Globe } from "lucide-react";
import VideoModal from "@/components/VideoModal";

export default function LandingPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [shipmentCount, setShipmentCount] = useState(1248);

  useEffect(() => {
    const interval = setInterval(() => {
      setShipmentCount(prev => prev + Math.floor(Math.random() * 3));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-primary animate-slide-up-fade">
      <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />

      {/* Sticky, blurred glass header */}
      <header className="sticky top-0 z-50 px-6 lg:px-8 h-16 flex items-center justify-between border-b border-border/40 bg-bg/70 backdrop-blur-xl transition-all">
        <Link className="flex items-center gap-2" href="/">
          <div className="bg-accent/10 p-1.5 rounded-md">
            <Globe className="h-5 w-5 text-accent" />
          </div>
          <span className="text-xl font-bold tracking-tight">LogisticsPro</span>
        </Link>
        <nav className="hidden md:flex gap-6 items-center absolute left-1/2 -translate-x-1/2">
          <Link className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors" href="#features">Features</Link>
          <Link className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors" href="/solutions">Solutions</Link>
          <Link className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors" href="/pricing">Pricing</Link>
        </nav>
        <div className="flex gap-4 items-center">
          <Link className="text-sm font-medium hover:text-accent transition-colors hidden sm:block" href="/sign-in">
            Sign In
          </Link>
          <Button render={<Link href="/sign-up" />} nativeButton={false} size="sm" className="shadow-none">
            Get Started
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full pt-24 pb-32 md:pt-32 md:pb-48 lg:pt-40 lg:pb-64 overflow-hidden flex flex-col items-center justify-center text-center px-4">
          {/* Enhanced Animated Background Layers */}
          <div className="absolute inset-0 -z-10">
            {/* Base Radial Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-bg to-bg" />

            {/* Animated Grid Pattern */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.15] animate-grid-pulse" />

            {/* Floating Atmospheric Orbs */}
            <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent/10 rounded-full blur-[128px] animate-float" />
            <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/5 rounded-full blur-[128px] animate-float [animation-delay:2s]" />

            {/* Moving Beam Effect */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent animate-beam" />
            <div className="absolute top-[20%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/10 to-transparent animate-beam [animation-delay:3s]" />
          </div>

          <div className="space-y-6 max-w-4xl mx-auto animate-slide-up-fade stagger-1">
            <div className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-sm font-semibold text-accent mb-6 backdrop-blur-sm shadow-[0_0_20px_rgba(37,99,235,0.1)]">
              <span className="relative flex h-2 w-2 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <span className="flex gap-2">
                Welcome to the future of logistics
                <span className="text-accent/40 font-normal">|</span>
                <span className="tabular-nums font-bold">{shipmentCount.toLocaleString()}</span>
                <span className="font-normal opacity-80">live shipments tracked today</span>
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              Orchestrate your <br className="hidden sm:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent via-blue-500 to-indigo-500 drop-shadow-sm">
                global supply chain
              </span>
              <br className="hidden sm:block" />
              <span className="inline-flex items-center mt-2 sm:mt-4">
                with
                <span className="relative inline-flex items-center justify-center ml-3 px-6 py-3 bg-accent/10 rounded-full border border-accent/30 shadow-[0_0_20px_rgba(var(--accent),0.2)]">
                  <span className="bg-clip-text text-transparent bg-gradient-to-br from-accent to-purple-600 tracking-tighter">AI</span>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-ping opacity-75"></span>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></span>
                </span>
              </span>
            </h1>

            <p className="mx-auto max-w-[600px] text-text-muted text-base md:text-lg lg:text-xl leading-relaxed">
              Real-time tracking, intelligent routing, and predictive analytics
              combined in one unified, lightning-fast platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button render={<Link href="/dashboard" />} nativeButton={false} size="lg" className="px-8 h-12 text-base shadow-sm">
                Open Dashboard <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                onClick={() => setIsVideoOpen(true)}
                variant="outline"
                size="lg"
                className="px-8 h-12 text-base"
              >
                View Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 md:py-32 bg-surface border-y border-border/40">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16 animate-slide-up-fade stagger-2">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Precision at every step</h2>
              <p className="text-text-muted text-lg">
                Everything you need to monitor, manage, and optimize your operations without the complexity.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 animate-slide-up-fade stagger-3">
              <div className="group flex flex-col items-start space-y-4 border border-border/50 bg-bg p-8 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="bg-accent/10 p-3 rounded-xl text-accent">
                  <Truck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Intelligent Tracking</h3>
                <p className="text-base text-text-muted leading-relaxed">
                  End-to-end visibility of your shipments with predictive ETAs and automated milestone logging.
                </p>
              </div>
              <div className="group flex flex-col items-start space-y-4 border border-border/50 bg-bg p-8 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="bg-accent/10 p-3 rounded-xl text-accent">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Enterprise Security</h3>
                <p className="text-base text-text-muted leading-relaxed">
                  Role-based access control, secure API endpoints, and comprehensive audit logs standard on all plans.
                </p>
              </div>
              <div className="group flex flex-col items-start space-y-4 border border-border/50 bg-bg p-8 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="bg-accent/10 p-3 rounded-xl text-accent">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Actionable Analytics</h3>
                <p className="text-base text-text-muted leading-relaxed">
                  Monitor warehouse capacity, carrier performance, and overall network efficiency in real-time.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 md:py-12 px-6 lg:px-8 border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-accent" />
            <span className="text-lg font-bold tracking-tight">LogisticsPro</span>
          </div>
          <p className="text-sm text-text-muted">© {new Date().getFullYear()} LogisticsPro Inc. All rights reserved.</p>
          <nav className="flex gap-6">
            <Link className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors" href="#">Terms</Link>
            <Link className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors" href="#">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
