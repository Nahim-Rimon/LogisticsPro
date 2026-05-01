import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Globe, 
  ShoppingBag, 
  Factory, 
  Ship, 
  ArrowRight,
  BarChart,
  ShieldCheck,
  Zap
} from "lucide-react";

const solutions = [
  {
    title: "E-commerce & Retail",
    icon: ShoppingBag,
    description: "Scale your online brand with automated order fulfillment, real-time stock sync, and multi-carrier shipping integrations.",
    benefits: ["Auto-sync with Shopify & Amazon", "Last-mile delivery optimization", "Branded tracking pages"],
  },
  {
    title: "Manufacturing",
    icon: Factory,
    description: "Streamline your factory output with JIT inventory management, raw material tracking, and bulk freight orchestration.",
    benefits: ["Raw material traceability", "Production line integration", "Freight cost consolidation"],
  },
  {
    title: "Global Trade & Freight",
    icon: Ship,
    description: "Navigate international logistics with automated customs documentation, sea/air freight tracking, and duty calculation.",
    benefits: ["Digital Bill of Lading", "Real-time port congestion alerts", "Multi-currency financial reporting"],
  },
];

export default function SolutionsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-primary animate-slide-up-fade">
      <header className="sticky top-0 z-50 px-6 lg:px-8 h-16 flex items-center justify-between border-b border-border/40 bg-bg/70 backdrop-blur-xl">
        <Link className="flex items-center gap-2" href="/">
          <div className="bg-accent/10 p-1.5 rounded-md">
            <Globe className="h-5 w-5 text-accent" />
          </div>
          <span className="text-xl font-bold tracking-tight">LogisticsPro</span>
        </Link>
        <div className="flex gap-4">
          <Button render={<Link href="/sign-up" />} nativeButton={false} size="sm">Get Started</Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 px-6 bg-surface border-b border-border/40 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up-fade stagger-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Tailored solutions for <span className="text-accent">every industry.</span>
              </h1>
              <p className="text-text-muted text-lg lg:text-xl leading-relaxed mb-8 max-w-lg">
                Whether you're shipping local parcels or international containers, 
                LogisticsPro provides the tools to simplify your complex supply chain.
              </p>
              <Button size="lg" render={<Link href="/sign-up" />} nativeButton={false}>
                Request a Demo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 animate-slide-up-fade stagger-2">
              <div className="bg-bg p-6 rounded-2xl border border-border shadow-sm space-y-3">
                <BarChart className="h-6 w-6 text-accent" />
                <h3 className="font-semibold">99.9% Accuracy</h3>
                <p className="text-xs text-text-muted">In inventory tracking and fulfillment.</p>
              </div>
              <div className="bg-bg p-6 rounded-2xl border border-border shadow-sm space-y-3 mt-8">
                <Zap className="h-6 w-6 text-accent" />
                <h3 className="font-semibold">35% Faster</h3>
                <p className="text-xs text-text-muted">Mean shipping time reduction.</p>
              </div>
              <div className="bg-bg p-6 rounded-2xl border border-border shadow-sm space-y-3">
                <ShieldCheck className="h-6 w-6 text-accent" />
                <h3 className="font-semibold">Bank-grade</h3>
                <p className="text-xs text-text-muted">Security and data encryption.</p>
              </div>
              <div className="bg-bg p-6 rounded-2xl border border-border shadow-sm space-y-3 mt-8">
                <Globe className="h-6 w-6 text-accent" />
                <h3 className="font-semibold">200+ Countries</h3>
                <p className="text-xs text-text-muted">Supported for global shipments.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Solutions */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto space-y-24">
            {solutions.map((sol, i) => (
              <div key={sol.title} className={`flex flex-col md:grid md:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className={`${i % 2 === 1 ? 'md:order-2' : ''} space-y-6 animate-slide-up-fade stagger-3`}>
                  <div className="bg-accent/10 p-4 rounded-2xl inline-block text-accent">
                    <sol.icon className="h-8 w-8" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{sol.title}</h2>
                  <p className="text-text-muted text-lg leading-relaxed">{sol.description}</p>
                  <ul className="space-y-3">
                    {sol.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-3 font-medium text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`bg-surface border border-border rounded-[32px] aspect-video w-full flex items-center justify-center p-4 md:p-8 animate-slide-up-fade stagger-4 ${i % 2 === 1 ? 'md:order-1' : ''}`}>
                  <div className="w-full h-full bg-bg border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col">
                    {/* Mock Browser/App Header */}
                    <div className="h-10 bg-surface border-b border-border flex items-center px-4 gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/20" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400/20" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/20" />
                      </div>
                      <div className="mx-auto bg-bg border border-border rounded px-3 py-0.5 text-[10px] text-text-muted">
                        dashboard.logisticspro.io/{sol.title.toLowerCase().split(' ')[0]}
                      </div>
                    </div>
                    {/* Mock Content */}
                    <div className="flex-1 p-4 flex gap-4 overflow-hidden">
                      <div className="w-12 h-full bg-surface/50 border border-border rounded-lg flex flex-col items-center py-3 gap-3">
                        {[1,2,3,4].map(j => <div key={j} className="w-6 h-6 rounded bg-accent/10 border border-accent/20" />)}
                      </div>
                      <div className="flex-1 flex flex-col gap-4">
                        <div className="grid grid-cols-3 gap-3">
                          {[1,2,3].map(j => (
                            <div key={j} className="h-20 bg-surface/50 border border-border rounded-xl p-3 space-y-2">
                              <div className="h-2 w-1/2 bg-text-muted/10 rounded" />
                              <div className="h-4 w-3/4 bg-accent/20 rounded" />
                            </div>
                          ))}
                        </div>
                        <div className="flex-1 bg-surface/30 border border-border rounded-xl p-4 relative overflow-hidden">
                          {/* Industry specific visuals */}
                          {i === 0 && ( // E-commerce
                            <div className="space-y-3">
                              <div className="flex justify-between items-center mb-4">
                                <div className="h-4 w-32 bg-text-primary/10 rounded" />
                                <div className="h-6 w-20 bg-emerald-500/20 rounded-full border border-emerald-500/30" />
                              </div>
                              {[1,2,3].map(j => (
                                <div key={j} className="flex gap-4 items-center h-10 border-b border-border/50">
                                   <div className="w-8 h-8 rounded bg-bg border border-border" />
                                   <div className="h-2 flex-1 bg-text-muted/5 rounded" />
                                   <div className="h-2 w-12 bg-accent/20 rounded" />
                                </div>
                              ))}
                            </div>
                          )}
                          {i === 1 && ( // Manufacturing
                            <div className="h-full flex items-end gap-2">
                              {[40, 60, 35, 90, 70, 85, 45, 100].map((h, j) => (
                                <div key={j} className="flex-1 bg-accent/20 border-t-2 border-accent rounded-t-sm" style={{ height: `${h}%` }} />
                              ))}
                            </div>
                          )}
                          {i === 2 && ( // Global Trade
                            <div className="absolute inset-0 p-4 opacity-20">
                               <Globe className="w-full h-full text-accent" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t border-border bg-surface">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-muted">© 2024 LogisticsPro Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors" href="/">Home</Link>
            <Link className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors" href="/pricing">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
