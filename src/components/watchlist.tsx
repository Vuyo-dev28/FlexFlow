'use client';

import { Bitcoin, Activity, BarChart, TrendingUp, Euro, Globe, Mountain, Waves, CandlestickChart, DollarSign, ArrowRightLeft } from 'lucide-react';
import type { FinancialPair } from '@/types/signal';
import { cn } from '@/lib/utils';
import { SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader } from './ui/sidebar';
import React from 'react';

interface WatchlistProps {
  pairs: FinancialPair[];
  selectedPair: FinancialPair | null;
  onSelectPair: (pair: FinancialPair | null) => void;
}

const pairIcons: Record<string, React.ElementType> = {
  'All Signals': ArrowRightLeft,
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
  'USD/JPY': DollarSign,
  'GBP/USD': Globe,
  'AUD/USD': DollarSign,
  'USD/CAD': DollarSign,
  // Metals
  'XAU/USD': Mountain,
};

const WatchlistItem: React.FC<{
  pair: FinancialPair | 'All Signals';
  selectedPair: FinancialPair | null;
  onSelectPair: (pair: FinancialPair | null) => void;
}> = ({ pair, selectedPair, onSelectPair }) => {
  const Icon = pairIcons[pair] || CandlestickChart;
  const isAllSignals = pair === 'All Signals';
  const isActive = isAllSignals ? !selectedPair : selectedPair === pair;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => onSelectPair(isAllSignals ? null : pair)}
        isActive={isActive}
        className="justify-start"
      >
        <Icon className="h-4 w-4" />
        <span className="flex-1">{pair}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export function Watchlist({ pairs, selectedPair, onSelectPair }: WatchlistProps) {
  return (
    <div className="flex flex-col h-full">
      <SidebarHeader>
        <h2 className="font-bold text-lg text-foreground">Watchlist</h2>
        <p className="text-xs text-muted-foreground">Select a pair to get a new signal</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <WatchlistItem
            pair="All Signals"
            selectedPair={selectedPair}
            onSelectPair={onSelectPair}
          />
          {pairs.map(pair => (
            <WatchlistItem
              key={pair}
              pair={pair}
              selectedPair={selectedPair}
              onSelectPair={onSelectPair}
            />
          ))}
        </SidebarMenu>
      </SidebarContent>
    </div>
  );
}
