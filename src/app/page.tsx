'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { SignalCard } from '@/components/signal-card';
import { SignalDetailDialog } from '@/components/signal-detail-dialog';
import { SignalFilters } from '@/components/signal-filters';
import { mockSignals } from '@/lib/mock-data';
import type { Signal, FinancialPair } from '@/types/signal';

export default function Home() {
  const [signals] = useState<Signal[]>(mockSignals);
  const [selectedPair, setSelectedPair] = useState<FinancialPair | 'All'>('All');
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);

  const availablePairs = useMemo(() => {
    const pairs = new Set(signals.map(s => s.pair));
    return Array.from(pairs);
  }, [signals]);

  const filteredSignals = useMemo(() => {
    if (selectedPair === 'All') {
      return signals;
    }
    return signals.filter(signal => signal.pair === selectedPair);
  }, [signals, selectedPair]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <SignalFilters
          pairs={availablePairs}
          selectedPair={selectedPair}
          onPairChange={setSelectedPair}
        />
        <div className="container mx-auto px-4 py-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredSignals.map(signal => (
              <SignalCard
                key={signal.id}
                signal={signal}
                onSelect={() => setSelectedSignal(signal)}
              />
            ))}
          </div>
        </div>
      </main>
      <SignalDetailDialog
        signal={selectedSignal}
        open={!!selectedSignal}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedSignal(null);
          }
        }}
      />
    </div>
  );
}
