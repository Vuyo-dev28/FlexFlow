'use client';

import { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/header';
import { SignalCard } from '@/components/signal-card';
import { SignalDetailDialog } from '@/components/signal-detail-dialog';
import { SignalFilters } from '@/components/signal-filters';
import type { Signal, SignalCategory, FinancialPair } from '@/types/signal';
import { generateSignals } from '@/ai/flows/generate-signal-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { Watchlist } from '@/components/watchlist';
import { Separator } from '@/components/ui/separator';

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
  const [selectedPair, setSelectedPair] = useState<FinancialPair | null>(null);
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
    return ['All', ...Array.from(categories)] as (SignalCategory | 'All')[];
  }, []);

  const filteredSignals = useMemo(() => {
    let categoryFiltered = signals;
    if (selectedCategory !== 'All') {
        categoryFiltered = signals.filter(signal => signal.category === selectedCategory);
    }
    
    if (selectedPair) {
        return categoryFiltered.filter(signal => signal.pair === selectedPair);
    }

    return categoryFiltered;
  }, [signals, selectedCategory, selectedPair]);
  
  const watchlistPairs = useMemo(() => {
    if (selectedCategory === 'All') {
      return ALL_PAIRS.map(p => p.pair);
    }
    return ALL_PAIRS.filter(p => p.category === selectedCategory).map(p => p.pair);
  }, [selectedCategory]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-sm">
      <Header />
      <div className="flex flex-1">
        <main className="flex-1 flex flex-col">
            <SignalFilters
              categories={availableCategories}
              selectedCategory={selectedCategory}
              onCategoryChange={cat => {
                setSelectedCategory(cat);
                setSelectedPair(null); // Reset pair selection when category changes
              }}
            />
             <div className="flex-1 p-4">
              {loading ? (
                <div className="flex flex-col gap-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                      <CardSkeleton key={index} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
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
        <aside className="hidden lg:block w-80 border-l border-border">
          <Watchlist 
            pairs={watchlistPairs}
            selectedPair={selectedPair}
            onSelectPair={setSelectedPair}
          />
        </aside>
      </div>

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
        <div className="flex items-center space-x-4 p-4 border rounded-lg bg-card/50">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-4 w-4/5" />
            </div>
        </div>
    )
}