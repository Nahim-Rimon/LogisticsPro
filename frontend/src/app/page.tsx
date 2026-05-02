"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Truck, Shield, BarChart3, Globe, Bot, Sparkles, BrainCircuit, Route } from "lucide-react";
import VideoModal from "@/components/VideoModal";
import { Navbar } from "@/components/Navbar";

const DynamicHeroBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden bg-slate-950 dark:bg-black">
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes dash-flow {
        to { stroke-dashoffset: -1000; }
      }
      @keyframes pulse-core {
        0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; filter: blur(100px); }
        50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; filter: blur(120px); }
      }
      @keyframes node-glow {
        0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); opacity: 0.8; }
        50% { transform: scale(1.5); box-shadow: 0 0 40px rgba(168, 85, 247, 1); opacity: 1; }
      }
      @keyframes float-complex {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
      }
      .animate-dash { stroke-dasharray: 15; animation: dash-flow 20s linear infinite; }
      .animate-node { animation: node-glow 4s ease-in-out infinite; }
    `}} />
    
    {/* Central Glowing AI Core */}
    <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-blue-600/30 rounded-full mix-blend-screen" style={{ animation: 'pulse-core 8s ease-in-out infinite' }} />
    <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-purple-600/30 rounded-full mix-blend-screen" style={{ animation: 'pulse-core 6s ease-in-out infinite reverse' }} />
    
    {/* High-tech Grid */}
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_20%,transparent_100%)]" />

    {/* SVG Animated Network Lines */}
    <svg className="absolute inset-0 w-full h-full opacity-50" preserveAspectRatio="none">
      <defs>
        <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      
      <path d="M-100,100 C200,300 400,-100 800,200 S1200,600 1500,100" fill="none" stroke="url(#line-grad)" strokeWidth="2" className="animate-dash" />
      <path d="M-100,500 C300,600 500,200 900,400 S1300,100 1600,500" fill="none" stroke="url(#line-grad)" strokeWidth="1.5" className="animate-dash" style={{ animationDirection: 'reverse', animationDuration: '25s' }} />
      <path d="M200,-100 C300,200 100,600 400,900 S800,800 1000,1200" fill="none" stroke="url(#line-grad)" strokeWidth="1" className="animate-dash" style={{ animationDelay: '-10s' }} />
      <path d="M1200,-100 C1100,300 1400,500 1000,800 S600,900 800,1200" fill="none" stroke="url(#line-grad)" strokeWidth="2" className="animate-dash" style={{ animationDirection: 'reverse', animationDelay: '-5s' }} />
    </svg>

    {/* Glowing Nodes */}
    <div className="absolute top-[30%] left-[25%] w-3 h-3 bg-blue-400 rounded-full animate-node" style={{ animationDelay: '0s' }} />
    <div className="absolute top-[60%] left-[45%] w-4 h-4 bg-purple-400 rounded-full animate-node" style={{ animationDelay: '1s' }} />
    <div className="absolute top-[40%] left-[75%] w-3 h-3 bg-pink-400 rounded-full animate-node" style={{ animationDelay: '2s' }} />
    <div className="absolute top-[75%] left-[20%] w-2 h-2 bg-blue-300 rounded-full animate-node" style={{ animationDelay: '1.5s' }} />

    {/* Floating Huge Tech Icons */}
    <div className="absolute top-[15%] left-[10%] text-white/5" style={{ animation: 'float-complex 10s ease-in-out infinite' }}><BrainCircuit className="w-40 h-40" /></div>
    <div className="absolute top-[60%] right-[10%] text-white/5" style={{ animation: 'float-complex 12s ease-in-out infinite reverse' }}><Bot className="w-32 h-32" /></div>
    <div className="absolute top-[20%] right-[25%] text-white/5" style={{ animation: 'float-complex 8s ease-in-out infinite 2s' }}><Route className="w-24 h-24" /></div>
  </div>
);

export default function LandingPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);


  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-primary animate-slide-up-fade">
      <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />

      {/* Sticky, blurred glass header */}
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full pt-24 pb-32 md:pt-32 md:pb-48 lg:pt-40 lg:pb-64 overflow-hidden flex flex-col items-center justify-center text-center px-4 text-white">
          <DynamicHeroBackground />

          <div className="space-y-6 max-w-4xl mx-auto animate-slide-up-fade stagger-1">
            <div className="inline-flex items-center rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-sm font-semibold text-blue-300 mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <span className="relative flex h-2 w-2 mr-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="flex gap-2">
                Welcome to the future of logistics
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-white drop-shadow-md">
              Orchestrate your <br className="hidden sm:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-lg">
                global supply chain
              </span>
              <br className="hidden sm:block" />
              <span className="inline-flex items-center mt-2 sm:mt-4">
                with
                <span className="relative inline-flex items-center justify-center ml-3 px-6 py-3 bg-blue-500/10 rounded-full border border-blue-400/30 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                  <span className="bg-clip-text text-transparent bg-gradient-to-br from-blue-400 to-purple-400 tracking-tighter">AI</span>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping opacity-75"></span>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full"></span>
                </span>
              </span>
            </h1>

            <p className="mx-auto max-w-[600px] text-slate-300 text-base md:text-lg lg:text-xl leading-relaxed drop-shadow-sm">
              Real-time tracking, intelligent routing, and predictive analytics
              combined in one unified, lightning-fast platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button render={<Link href="/dashboard" />} nativeButton={false} size="lg" className="px-8 h-12 text-base shadow-lg hover:shadow-blue-500/25 border-0 bg-blue-600 hover:bg-blue-700 text-white">
                Open Dashboard <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                onClick={() => setIsVideoOpen(true)}
                variant="outline"
                size="lg"
                className="px-8 h-12 text-base border-slate-600 text-white hover:bg-slate-800 hover:text-white backdrop-blur-sm bg-black/20"
              >
                View Demo
              </Button>
            </div>
          </div>
        </section>

        {/* AI Showcase Section */}
        <section className="w-full py-20 md:py-32 relative overflow-hidden bg-bg border-b border-border/40">
          {/* Subtle gradient background for AI section */}
          <div className="absolute inset-0 bg-gradient-to-b from-bg via-accent/5 to-bg -z-10" />
          
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center text-center max-w-5xl mx-auto mb-16 animate-slide-up-fade stagger-2">
              <div className="inline-flex items-center rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent mb-6">
                <Sparkles className="h-4 w-4 mr-2" /> Powered by Gemini AI
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 lg:whitespace-nowrap">
                Logistics meets <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-purple-600">Artificial Intelligence</span>
              </h2>
              <p className="text-text-muted text-lg md:text-xl">
                Unlock next-generation capabilities when you onboard. Our platform leverages advanced LLMs to automate complex decisions and provide deep insights.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3 animate-slide-up-fade stagger-3">
              {/* Feature 1 */}
              <div className="relative group overflow-hidden rounded-2xl border border-border bg-surface p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Bot className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Natural Language Query</h3>
                  <p className="text-text-muted leading-relaxed">
                    Ask questions about your supply chain in plain English. Get instant insights about delays, inventory levels, and carrier performance without writing complex SQL.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="relative group overflow-hidden rounded-2xl border border-border bg-surface p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <BrainCircuit className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Predictive Forecasting</h3>
                  <p className="text-text-muted leading-relaxed">
                    Anticipate stockouts and shipment delays before they happen. Our AI models analyze historical data and external factors to generate accurate risk assessments.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="relative group overflow-hidden rounded-2xl border border-border bg-surface p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Route className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Smart Route Optimization</h3>
                  <p className="text-text-muted leading-relaxed">
                    Generate the most efficient multi-stop delivery routes in seconds. Minimize fuel costs and travel time using advanced algorithmic solving.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 md:py-32 bg-surface">
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
