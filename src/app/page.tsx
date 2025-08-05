'use client';

import { useState, useMemo, useCallback } from 'react';
import { Header } from '@/components/header';
import { SignalCard } from '@/components/signal-card';
import { SignalDetailDialog } from '@/components/signal-detail-dialog';
import { SignalFilters } from '@/components/signal-filters';
import type { Signal, SignalCategory, FinancialPair } from '@/types/signal';
import { Watchlist } from '@/components/watchlist';
import { MOCK_SIGNALS, ALL_PAIRS } from '@/lib/mock-data';
import { generateSignal } from '@/ai/flows/generate-signal-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { LivePricesProvider, useLivePrices } from '@/hooks/use-live-prices';

function HomePageContent() {
  const [signals, setSignals] = useState<Signal[]>(MOCK_SIGNALS);
  const [selectedCategory, setSelectedCategory] = useState<SignalCategory | 'All'>('All');
  const [selectedPair, setSelectedPair] = useState<FinancialPair | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { livePrices, priceChanges } = useLivePrices();


  const handleSelectPair = useCallback(async (pair: FinancialPair | null) => {
    setSelectedPair(pair);
    if (pair) {
      setIsLoading(true);
      try {
        const pairInfo = ALL_PAIRS.find(p => p.pair === pair);
        if (!pairInfo) {
            throw new Error(`Invalid pair selected: ${pair}`);
        }
        
        const newSignal = await generateSignal({ pair });
        const signalWithMetadata: Signal = {
          ...newSignal,
          id: `ai-${pair}-${new Date().getTime()}`,
          pair: pair,
          category: pairInfo.category,
          timestamp: new Date(),
        };
        // Replace existing signal for the pair or add the new one
        setSignals(prevSignals => [
          signalWithMetadata,
          ...prevSignals.filter(s => s.pair !== pair)
        ]);
      } catch (error) {
        console.error("Error generating signal:", error);
        // Optionally, show a toast notification to the user
      } finally {
        setIsLoading(false);
      }
    }
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
    <>
        <div className="flex-1 hidden md:flex md:flex-col border-r">
            <Watchlist 
              pairs={watchlistPairs}
              selectedPair={selectedPair}
              onSelectPair={handleSelectPair}
              livePrices={livePrices}
              priceChanges={priceChanges}
            />
        </div>
        <div className="flex-1 flex flex-col">
            <SignalFilters
            categories={availableCategories}
            selectedCategory={selectedCategory}
            onCategoryChange={cat => {
                setSelectedCategory(cat);
                setSelectedPair(null); // Reset pair selection when category changes
            }}
            />
            <div className="flex-1 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {isLoading && selectedPair ? (
                    Array.from({ length: 1 }).map((_, index) => (
                        <div key={index} className="flex flex-col space-y-3">
                            <Skeleton className="h-[125px] w-full rounded-xl" />
                        </div>
                    ))
                ) : (
                    filteredSignals.map(signal => (
                    <SignalCard
                        key={signal.id}
                        signal={signal}
                        onSelect={() => setSelectedSignal(signal)}
                        livePrice={livePrices[signal.pair]}
                        priceChange={priceChanges[signal.pair]}
                    />
                    ))
                )}
            </div>
            </div>
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
    </>
  );
}


export default function HomePage() {
    return (
        <LivePricesProvider>
           <HomePageContent />
        </LivePricesProvider>
    )
}
