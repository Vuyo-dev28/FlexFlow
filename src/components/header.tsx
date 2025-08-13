
'use client';

import { CandlestickChart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignalSettingsSheet } from './signal-settings-sheet';
import { useState, useEffect } from 'react';
import { SidebarTrigger } from './ui/sidebar';
import { useSettings } from '@/hooks/use-settings';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { hasSettings } = useSettings();

  useEffect(() => {
    if (hasSettings === false) { // Explicitly check for false
      setIsSettingsOpen(true);
    }
  }, [hasSettings]);

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-background border-b border-border">
        <div className="flex items-center gap-2 sm:gap-3">
          <SidebarTrigger />
        </div>
         <div className="flex items-center gap-2">
            <CandlestickChart className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold text-foreground tracking-tight">FlexFlow</h1>
          </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} aria-label="Open settings">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <SignalSettingsSheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}
