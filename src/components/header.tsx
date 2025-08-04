'use client';

import { CandlestickChart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignalSettingsSheet } from './signal-settings-sheet';
import { useState } from 'react';

export function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-background border-b border-border">
        <div className="flex items-center gap-2 sm:gap-3">
          <CandlestickChart className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold text-foreground tracking-tight">SignalStream</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} aria-label="Open settings">
          <Settings className="h-5 w-5" />
        </Button>
      </header>
      <SignalSettingsSheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}
