'use client';

import { Bitcoin, Activity, BarChart, TrendingUp, Euro, Globe, Mountain, Waves, CandlestickChart } from 'lucide-react';
import type { FinancialPair } from '@/types/signal';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from './ui/sidebar';

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
      <SidebarHeader>
        <h2 className="font-bold text-lg text-foreground">Watchlist</h2>
        <p className="text-xs text-muted-foreground">Select a pair to view signals</p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => onSelectPair(null)}
                isActive={!selectedPair}
              >
                All Signals
              </SidebarMenuButton>
            </SidebarMenuItem>
            {pairs.map(pair => {
              const Icon = pairIcons[pair] || CandlestickChart;
              return (
                <SidebarMenuItem key={pair}>
                  <SidebarMenuButton
                    onClick={() => onSelectPair(pair)}
                    isActive={selectedPair === pair}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{pair}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
        </SidebarMenu>
      </SidebarContent>
    </div>
  );
}
