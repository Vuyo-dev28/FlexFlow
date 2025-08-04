'use client';

import { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/header';
import { SignalCard } from '@/components/signal-card';
import { SignalDetailDialog } from '@/components/signal-detail-dialog';
import { SignalFilters } from '@/components/signal-filters';
import type { Signal, SignalCategory, FinancialPair } from '@/types/signal';
import { generateSignals } from '@/ai/flows/generate-signal-flow';
import { Skeleton } from '@/components/ui/skeleton';

const ALL_PAIRS: { pair: FinancialPair, category: SignalCategory }[] = [
    { pair: 'BTC/USD', category: 'Crypto' },
    { pair: 'ETH/USD', category: 'Crypto' },
    { pair: 'SOL/USD', category: 'Crypto' },
    { pair: 'XRP/USD', category: 'Crypto' },
    { pair: 'ADA/USD', category: 'Crypto' },
    { pair: 'NAS100/USD', category: 'Stock Indices' },
    { pair: 'US30/USD', category: 'Stock Indices' },
    { pair: 'VIX', category: 'Volatility Indices' },
    { pair: 'EUR/USD', category: 'Forex' },
    { pair: 'GBP/JPY', category: 'Forex' },
    { pair: 'XAU/USD', category: 'Metals' },
];

export default function Home() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<SignalCategory | 'All'>('All');
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);

  useEffect(() => {
    async function fetchSignals() {
      setLoading(true);
      try {
        const pairsToFetch = ALL_PAIRS.map(p => p.pair);
        const generatedSignals = await generateSignals({ pairs: pairsToFetch });
        
        const allSignals = generatedSignals.map((generated, index) => {
          const { pair, category } = ALL_PAIRS[index];
          return {
            ...generated,
            id: crypto.randomUUID(),
            timestamp: new Date(),
            pair,
            category,
          } as Signal;
        });

        setSignals(allSignals);
      } catch (error) {
        console.error("Failed to generate signals", error);
        // Optionally, set some error state to show in the UI
      } finally {
        setLoading(false);
      }
    }

    fetchSignals();
  }, []);


  const availableCategories = useMemo(() => {
    const categories = new Set(ALL_PAIRS.map(s => s.category));
    return Array.from(categories);
  }, []);

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
          {loading ? (
             <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 12 }).map((_, index) => (
                    <CardSkeleton key={index} />
                ))}
             </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredSignals.map(signal => (
                <SignalCard
                    key={signal.id}
                    signal={signal}
                    onSelect={() => setSelectedSignal(signal)}
                />
                ))}
            </div>
          )}
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


function CardSkeleton() {
    return (
        <div className="flex flex-col space-y-3 p-4 border rounded-lg bg-card">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex flex-col gap-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-12" />
                    </div>
                </div>
                <Skeleton className="h-6 w-12 rounded-full" />
            </div>
            <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                </div>
            </div>
            <div className="flex justify-between items-center pt-2">
                 <Skeleton className="h-3 w-24" />
            </div>
        </div>
    )
}
