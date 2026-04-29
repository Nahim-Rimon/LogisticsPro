"use client";

import { X, Play, Volume2, Maximize, Pause, CheckCircle2, Package, Truck, Warehouse, BarChart3 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";

const scenes = [
  { 
    start: 0, 
    end: 25, 
    title: "Unified Command Center", 
    description: "Get a 360° view of your entire supply chain metrics in real-time.",
    icon: LayoutDashboardIcon
  },
  { 
    start: 25, 
    end: 50, 
    title: "Global Shipment Tracking", 
    description: "Track every milestone from origin to destination with millisecond precision.",
    icon: Package
  },
  { 
    start: 50, 
    end: 75, 
    title: "Intelligent Warehousing", 
    description: "Optimize space and monitor capacity across your global network of facilities.",
    icon: Warehouse
  },
  { 
    start: 75, 
    end: 100, 
    title: "Carrier Performance", 
    description: "Evaluate shipping partners with data-driven performance scores and transit times.",
    icon: BarChart3
  }
];

function LayoutDashboardIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  )
}

export default function VideoModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  // Voice Narration Logic
  useEffect(() => {
    if (isOpen && isPlaying && !isMuted) {
      const synth = window.speechSynthesis;
      const currentScene = scenes.find(s => progress >= s.start && progress < s.end);
      
      if (currentScene) {
        // Only speak if this scene just started (within first few ticks of progress)
        const sceneProgress = progress - currentScene.start;
        if (sceneProgress < 0.5) {
          synth.cancel(); // Stop previous narration
          const utterance = new SpeechSynthesisUtterance(`${currentScene.title}. ${currentScene.description}`);
          utterance.rate = 1.0;
          utterance.pitch = 1;
          utterance.volume = 0.8;
          synth.speak(utterance);
        }
      }
    } else {
      window.speechSynthesis.cancel();
    }
    
    return () => window.speechSynthesis.cancel();
  }, [isOpen, isPlaying, isMuted, progress]);

  useEffect(() => {
    if (isOpen && isPlaying) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 100 ? 0 : prev + 0.3));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isOpen, isPlaying]);

  const currentScene = useMemo(() => {
    return scenes.find(s => progress >= s.start && progress < s.end) || scenes[0];
  }, [progress]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-text-primary/40 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-5xl bg-bg rounded-2xl overflow-hidden shadow-2xl border border-border animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 p-2 rounded-lg">
              <currentScene.icon className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-base leading-none">{currentScene.title}</h3>
              <p className="text-xs text-text-muted mt-1">AI Narrated Tour • {isMuted ? 'Muted' : 'Voice Active'}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Video Area */}
        <div className="relative aspect-video bg-[#0a0a0a] group overflow-hidden">
          {/* Background Grid for Video */}
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />

          {/* Audio Visualizer Mock */}
          {!isMuted && isPlaying && (
            <div className="absolute top-8 right-8 flex items-end gap-1 h-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div 
                  key={i} 
                  className="w-1 bg-accent/40 rounded-full animate-pulse" 
                  style={{ 
                    height: `${Math.random() * 100}%`,
                    animationDuration: `${0.5 + Math.random()}s`
                  }} 
                />
              ))}
            </div>
          )}

          {/* Dynamic App Mockup */}
          <div className="absolute inset-0 p-12 flex gap-8 overflow-hidden select-none pointer-events-none">
            {/* Sidebar Mock */}
            <div className="w-16 h-full bg-white/[0.03] rounded-2xl border border-white/5 flex flex-col items-center gap-5 p-4">
              <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30" />
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`w-8 h-8 rounded-lg transition-colors duration-500 ${scenes.indexOf(currentScene) === i-1 ? 'bg-accent/40 border-accent/50' : 'bg-white/5 border-white/5'}`} />
              ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col gap-8 transition-all duration-700">
              {/* Header Mock */}
              <div className="flex justify-between items-center">
                <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse" />
                <div className="h-10 w-32 bg-accent/20 rounded-lg border border-accent/30" />
              </div>

              {/* Scene 1: Dashboard */}
              {progress < 25 && (
                <div className="grid grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-white/[0.03] rounded-2xl border border-white/5 p-5 flex flex-col justify-between">
                      <div className="h-3 w-1/2 bg-white/10 rounded" />
                      <div className="h-8 w-3/4 bg-white/20 rounded-lg" />
                    </div>
                  ))}
                  <div className="col-span-4 h-64 bg-white/[0.02] rounded-3xl border border-white/5 p-8">
                     <div className="w-full h-full flex items-end gap-3">
                        {[40, 70, 45, 90, 65, 80, 55, 75, 60, 85].map((h, i) => (
                          <div key={i} className="flex-1 bg-accent/20 rounded-t-md transition-all duration-1000" style={{ height: `${h}%` }} />
                        ))}
                     </div>
                  </div>
                </div>
              )}

              {/* Scene 2: Shipments */}
              {progress >= 25 && progress < 50 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="h-12 w-full bg-white/[0.05] rounded-xl border border-white/10" />
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-14 w-full bg-white/[0.02] rounded-xl border border-white/5 flex items-center px-6 gap-6">
                      <div className="w-8 h-8 rounded bg-accent/10 flex items-center justify-center"><Truck className="h-4 w-4 text-accent/50" /></div>
                      <div className="h-3 w-32 bg-white/10 rounded" />
                      <div className="h-3 w-48 bg-white/5 rounded" />
                      <div className="ml-auto h-6 w-24 bg-accent/10 rounded-full border border-accent/20" />
                    </div>
                  ))}
                </div>
              )}

              {/* Scene 3: Warehouses */}
              {progress >= 50 && progress < 75 && (
                <div className="grid grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white/[0.03] rounded-3xl border border-white/5 p-8 space-y-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-white/20 rounded" />
                          <div className="h-3 w-24 bg-white/10 rounded" />
                        </div>
                        <Warehouse className="h-6 w-6 text-accent/40" />
                      </div>
                      <div className="space-y-3">
                         <div className="flex justify-between text-[10px] text-white/40 uppercase tracking-wider font-bold">
                           <span>Capacity</span>
                           <span>{70 + i * 5}%</span>
                         </div>
                         <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-accent/60 rounded-full" style={{ width: `${70 + i * 5}%` }} />
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Scene 4: Carriers */}
              {progress >= 75 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="grid grid-cols-3 gap-8">
                     {[1, 2, 3].map(i => (
                       <div key={i} className="aspect-square bg-white/[0.03] rounded-full border border-white/5 flex flex-col items-center justify-center p-8 text-center space-y-3">
                          <div className="text-3xl font-bold text-accent">9{i}.{i}%</div>
                          <div className="text-[10px] text-white/40 uppercase font-bold">Reliability</div>
                       </div>
                     ))}
                  </div>
                  <div className="h-48 bg-white/[0.02] rounded-3xl border border-white/5 p-6 flex flex-col gap-4">
                     {[1, 2, 3].map(i => (
                       <div key={i} className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-full bg-white/5" />
                         <div className="flex-1 space-y-2">
                           <div className="h-2 w-1/4 bg-white/20 rounded" />
                           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-accent/40" style={{ width: `${80 - i * 10}%` }} />
                           </div>
                         </div>
                       </div>
                     ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Floating Caption / Callout */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 pointer-events-none">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl animate-slide-up-fade">
              <p className="text-white text-base font-medium leading-relaxed">
                {currentScene.description}
              </p>
            </div>
          </div>

          {/* Video Overlay Controls */}
          <div className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/80 via-transparent to-transparent">
            <div className="p-8 space-y-6">
              {/* Progress Bar */}
              <div className="relative h-1.5 w-full bg-white/10 rounded-full cursor-pointer overflow-hidden group/bar">
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] animate-beam" />
                <div className="absolute inset-y-0 left-0 bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-8">
                  <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-accent transition-colors transform hover:scale-110 active:scale-95">
                    {isPlaying ? <Pause className="h-7 w-7 fill-current" /> : <Play className="h-7 w-7 fill-current" />}
                  </button>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setIsMuted(!isMuted)}>
                      <Volume2 className={`h-6 w-6 transition-colors ${isMuted ? 'text-white/20' : 'text-accent'}`} />
                    </button>
                    <div className="w-20 h-1 bg-white/20 rounded-full overflow-hidden">
                       <div className={`h-full bg-white/60 transition-all ${isMuted ? 'w-0' : 'w-3/4'}`} />
                    </div>
                  </div>
                  <span className="text-sm font-semibold tracking-wider tabular-nums text-white/80">
                    0:{Math.floor(progress * 0.6).toString().padStart(2, '0')} <span className="text-white/30 mx-1">/</span> 1:00
                  </span>
                </div>
                <div className="flex items-center gap-6">
                   <div className="text-[10px] font-black px-2 py-0.5 border border-white/20 rounded tracking-widest bg-white/5 uppercase">VOICE ON</div>
                   <Maximize className="h-5 w-5 text-white/60 hover:text-white transition-colors" />
                </div>
              </div>
            </div>
          </div>

          {/* Center Play Button Overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
               <button 
                onClick={() => setIsPlaying(true)}
                className="h-24 w-24 bg-accent text-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.4)] hover:scale-105 transition-all duration-300"
               >
                 <Play className="h-10 w-10 fill-current ml-1" />
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
