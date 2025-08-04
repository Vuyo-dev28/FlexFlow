'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { SignalCard } from '@/components/signal-card';
import { SignalDetailDialog } from '@/components/signal-detail-dialog';
import { SignalFilters } from '@/components/signal-filters';
import { mockSignals } from '@/lib/mock-data';
import type { Signal, SignalCategory } from '@/types/signal';

export default function Home() {
  const [signals] = useState<Signal[]>(mockSignals);
  const [selectedCategory, setSelectedCategory] = useState<SignalCategory | 'All'>('All');
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);

  const availableCategories = useMemo(() => {
    const categories = new Set(signals.map(s => s.category));
    return Array.from(categories);
  }, [signals]);

  const filteredSignals = useMemo(() => {
    if (selectedCategory === 'All') {
      return signals;
    }
    return signals.filter(signal => signal.category === selectedCategory);
  }, [signals, selectedCategory]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <SignalFilters
          categories={availableCategories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        <div className="container mx-auto px-4 py-6">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
