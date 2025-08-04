'use client';

import { CandlestickChart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SignalSettingsSheet } from './signal-settings-sheet';
import { useState } from 'react';

export function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3">
          <CandlestickChart className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground tracking-tight">SignalStream</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)} aria-label="Open settings">
          <Settings className="h-6 w-6" />
        </Button>
      </header>
      <SignalSettingsSheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}
