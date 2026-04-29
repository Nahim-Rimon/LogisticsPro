"use client";

import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Package,
  Truck,
  Warehouse,
  Settings,
  Menu,
  X,
  Globe,
  User,
  Map
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";


const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Shipments', href: '/shipments', icon: Package },
  { name: 'Carriers', href: '/carriers', icon: Truck },
  { name: 'Warehouses', href: '/warehouses', icon: Warehouse },
  { name: 'Route Planner', href: '/route-planner', icon: Map },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg ">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="fixed inset-0 bg-text-primary/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className={`fixed inset-y-0 left-0 w-72 bg-surface p-6 shadow-2xl transition-transform duration-300 ease-out border-r border-border flex flex-col h-full ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between mb-8">
            <Link className="flex items-center gap-2" href="/">
              <div className="bg-accent/10 p-1.5 rounded-md">
                <Globe className="h-5 w-5 text-accent" />
              </div> <UserButton />
              <span className="text-xl font-bold tracking-tight">LogisticsPro</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 text-text-muted hover:text-text-primary hover:bg-border/50 rounded-lg transition-colors font-medium"
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="pt-6 mt-auto">
            <div className="flex items-center gap-3 px-4 py-3 bg-bg border border-border/60 rounded-xl">
              <Show when="signed-in">
                <UserButton />
              </Show>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium truncate"><User /></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:bg-surface lg:border-r lg:border-border">
        <div className="flex flex-col h-full p-6 overflow-y-auto">
          <div className="flex items-center mb-10 pl-2">
            <Link className="flex items-center gap-2" href="/">
              <div className="bg-accent/10 p-1.5 rounded-md">
                <Globe className="h-5 w-5 text-accent" />
              </div>
              <span className="text-xl font-bold tracking-tight">LogisticsPro</span>
            </Link>
          </div>
          <nav className="flex-1 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 text-text-muted hover:bg-border/50 hover:text-text-primary rounded-xl transition-colors group"
              >
                <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            ))}
          </nav>
          <div className="pt-6 mt-auto">
            <div className="flex items-center gap-3 px-4 py-3 bg-bg border border-border/60 rounded-xl">
              <Show when="signed-in">

                <UserButton />
                <span className="text-sm font-medium truncate">My Account</span>

              </Show>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border/40 bg-bg/70 backdrop-blur-xl px-4 sm:gap-x-6 sm:px-6 lg:px-8 transition-all">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6 ml-auto">
              <ThemeSwitcher />
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <div className="animate-slide-up-fade stagger-1">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
