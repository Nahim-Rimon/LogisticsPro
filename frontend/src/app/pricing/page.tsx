import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Globe } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: "$49",
    description: "Ideal for small businesses starting their logistics journey.",
    features: ["Up to 100 shipments/mo", "Real-time tracking", "Basic warehouse management", "Email support"],
    cta: "Start for free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$199",
    description: "Perfect for growing companies with complex supply chains.",
    features: ["Unlimited shipments", "Advanced analytics", "Multi-warehouse support", "Priority 24/7 support", "Custom integrations"],
    cta: "Get Started",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For global enterprises requiring maximum scale and security.",
    features: ["Custom white-labeling", "Dedicated account manager", "On-premise deployment options", "Custom SLA", "Global logistics consulting"],
    cta: "Contact Sales",
    popular: false,
  },
];

export default function PricingPage() {
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
          <Button render={<Link href="/sign-in" />} nativeButton={false} variant="ghost" size="sm">Sign In</Button>
          <Button render={<Link href="/sign-up" />} nativeButton={false} size="sm">Get Started</Button>
        </div>
      </header>

      <main className="flex-1 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up-fade stagger-1">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Simple, transparent pricing</h1>
            <p className="text-text-muted text-lg max-w-2xl mx-auto">
              Choose the plan that's right for your business. No hidden fees, ever.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up-fade stagger-2 items-start">
            {tiers.map((tier) => (
              <div key={tier.name} className="relative pt-4">
                {tier.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-accent text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest z-10 shadow-lg">
                    Most Popular
                  </div>
                )}
                <Card className={`flex flex-col border-border/50 overflow-visible ${tier.popular ? 'ring-2 ring-accent shadow-xl scale-105' : ''}`}>
                  <CardHeader>
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                    <CardDescription className="text-base mt-2">{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="mb-8">
                      <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                      {tier.price !== "Custom" && <span className="text-text-muted ml-1">/month</span>}
                    </div>
                    <ul className="space-y-4">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm">
                          <Check className="h-4 w-4 text-accent mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant={tier.popular ? 'default' : 'outline'} size="lg" render={<Link href="/sign-up" />} nativeButton={false}>
                      {tier.cta}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-text-muted">© 2024 LogisticsPro Inc. All rights reserved.</p>
          <nav className="flex gap-6">
            <Link className="text-sm font-medium text-text-muted hover:text-text-primary" href="#">Terms</Link>
            <Link className="text-sm font-medium text-text-muted hover:text-text-primary" href="#">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
