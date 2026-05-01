"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-24 h-9 bg-border/40 rounded-full animate-pulse" />;
  }

  return (
    <div className="flex items-center gap-1 bg-border/40 p-1 rounded-full">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme("light")}
        className={`h-7 w-7 rounded-full transition-all ${
          theme === "light" ? "bg-bg shadow-sm text-accent scale-105" : "text-text-muted hover:text-text-primary"
        }`}
        title="Light Mode"
      >
        <Sun className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme("gray")}
        className={`h-7 w-7 rounded-full transition-all ${
          theme === "gray" ? "bg-bg shadow-sm text-accent scale-105" : "text-text-muted hover:text-text-primary"
        }`}
        title="Gray Mode"
      >
        <Settings2 className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme("dark")}
        className={`h-7 w-7 rounded-full transition-all ${
          theme === "dark" ? "bg-bg shadow-sm text-accent scale-105" : "text-text-muted hover:text-text-primary"
        }`}
        title="Dark Mode"
      >
        <Moon className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
