
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { SignalCard } from '@/components/signal-card';
import { SignalDetailDialog } from '@/components/signal-detail-dialog';
import { SignalFilters } from '@/components/signal-filters';
import type { Signal, SignalCategory, FinancialPair, AppSettings } from '@/types/signal';
import { Watchlist } from '@/components/watchlist';
import { MOCK_SIGNALS, ALL_PAIRS } from '@/lib/mock-data';
import { generateSignal } from '@/ai/flows/generate-signal-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ArrowRightLeft } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';

const SETTINGS_KEY = 'signalStreamSettings';

const defaultSettings: AppSettings = {
    tradingStyle: 'Day Trading',
    accountSize: 10000,
    riskPerTrade: 1,
    currency: 'USD',
    pushNotifications: true,
    emailNotifications: false,
    categories: ['Crypto', 'Stock Indices', 'Forex', 'Metals', 'Volatility Indices'],
};

export default function HomePage() {
  const [signals, setSignals] = useState<Signal[]>(MOCK_SIGNALS);
  const [selectedCategory, setSelectedCategory] = useState<SignalCategory | 'All'>('All');
  const [selectedPair, setSelectedPair] = useState<FinancialPair | null>(null);
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const { settings, setSettings, hasSettings, setHasSettings } = useSettings();

  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      setHasSettings(true);
    } else {
      setHasSettings(false);
    }
  }, [setHasSettings]);

  const handleSelectPair = useCallback(async (pair: FinancialPair | null) => {
    setSelectedPair(pair);
    setIsWatchlistOpen(false); // Close sheet on selection
    if (pair) {
      setIsLoading(true);
      try {
        const pairInfo = ALL_PAIRS.find(p => p.pair === pair);
        if (!pairInfo) {
            throw new Error(`Invalid pair selected: ${pair}`);
        }
        
        const newSignal = await generateSignal({ pair, tradingStyle: settings.tradingStyle });
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
  }, [settings.tradingStyle]);


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
        <div className="flex-1 flex flex-col">
          <div className='flex items-center justify-between px-4 py-2 border-b'>
             <SignalFilters
              categories={availableCategories}
              selectedCategory={selectedCategory}
              onCategoryChange={cat => {
                  setSelectedCategory(cat);
                  setSelectedPair(null); // Reset pair selection when category changes
              }}
              />
              <Sheet open={isWatchlistOpen} onOpenChange={setIsWatchlistOpen}>
                <SheetTrigger asChild>
                   <Button variant="ghost" size="icon">
                    <ArrowRightLeft />
                    <span className="sr-only">Open Watchlist</span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <Watchlist 
                    pairs={watchlistPairs}
                    selectedPair={selectedPair}
                    onSelectPair={handleSelectPair}
                  />
                </SheetContent>
              </Sheet>
          </div>
           
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
                        settings={settings}
                        onSelect={() => setSelectedSignal(signal)}
                    />
                    ))
                )}
            </div>
            </div>
        </div>

      <SignalDetailDialog
        signal={selectedSignal}
        settings={settings}
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
