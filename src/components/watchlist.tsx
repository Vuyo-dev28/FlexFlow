'use client';

import { Bitcoin, Activity, BarChart, TrendingUp, Euro, Globe, Mountain, Waves, CandlestickChart } from 'lucide-react';
import type { FinancialPair } from '@/types/signal';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WatchlistProps {
  pairs: FinancialPair[];
  selectedPair: FinancialPair | null;
  onSelectPair: (pair: FinancialPair | null) => void;
}

const pairIcons: Record<string, React.ElementType> = {
  // Crypto
  'BTC/USD': Bitcoin,
  'ETH/USD': TrendingUp,
  'SOL/USD': CandlestickChart,
  'XRP/USD': Waves,
  'ADA/USD': CandlestickChart,
  // Stock Indices
  'NAS100/USD': Activity,
  'US30/USD': BarChart,
  'VIX': TrendingUp,
  // Forex
  'EUR/USD': Euro,
  'GBP/JPY': Globe,
  // Metals
  'XAU/USD': Mountain,
};

export function Watchlist({ pairs, selectedPair, onSelectPair }: WatchlistProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h2 className="font-bold text-lg text-foreground">Watchlist</h2>
        <p className="text-xs text-muted-foreground">Select a pair to view signals</p>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
            <Button
                variant="ghost"
                onClick={() => onSelectPair(null)}
                className={cn(
                    "w-full justify-start text-left mb-1",
                    !selectedPair && "bg-accent"
                )}
            >
                All Signals
            </Button>
            {pairs.map(pair => {
            const Icon = pairIcons[pair] || CandlestickChart;
            return (
              <Button
                key={pair}
                variant="ghost"
                onClick={() => onSelectPair(pair)}
                className={cn(
                  "w-full justify-start text-left",
                  selectedPair === pair && "bg-accent"
                )}
              >
                <Icon className="h-4 w-4 mr-2" />
                <span>{pair}</span>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
