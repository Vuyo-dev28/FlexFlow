
'use client';

import {
    Bitcoin,
    CandlestickChart,
    DollarSign,
    Euro,
    TrendingUp,
    Activity,
    BarChart,
    Globe,
    Mountain,
    Waves,
    Search,
    Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { FinancialPair, SignalCategory } from '@/types/signal';
import { cn } from '@/lib/utils';
import React, { useMemo, useState } from 'react';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { ALL_PAIRS } from '@/lib/mock-data';
import { SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Separator } from './ui/separator';

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
  'USD/JPY': DollarSign,
  'GBP/USD': Globe,
  'AUD/USD': DollarSign,
  'USD/CAD': DollarSign,
  // Metals
  'XAU/USD': Mountain,
};


export function Watchlist({ pairs, selectedPair, onSelectPair }: WatchlistProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPairs = useMemo(() => {
        return ALL_PAIRS.filter(p => p.pair.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm]);

    const categorizedPairs = useMemo(() => {
        return filteredPairs.reduce((acc, curr) => {
            if (!acc[curr.category]) {
                acc[curr.category] = [];
            }
            acc[curr.category].push(curr.pair);
            return acc;
        }, {} as Record<SignalCategory, FinancialPair[]>);
    }, [filteredPairs]);

    return (
        <div className="flex flex-col h-full">
            <SheetHeader className='p-4'>
                <SheetTitle>Watchlist</SheetTitle>
                <SheetDescription>Select a financial pair to generate a signal.</SheetDescription>
            </SheetHeader>
            <div className="p-4 pt-0">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search pairs..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <Separator />
            <ScrollArea className="flex-1">
                <div className='p-4'>
                {Object.entries(categorizedPairs).map(([category, pairs]) => (
                    <div key={category} className="mb-4">
                        <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">{category}</h3>
                        <div className="flex flex-col gap-1">
                            {pairs.map(pair => {
                                const Icon = pairIcons[pair] || CandlestickChart;
                                const isSelected = selectedPair === pair;
                                return (
                                    <button
                                        key={pair}
                                        onClick={() => onSelectPair(pair)}
                                        className={cn(
                                            "flex items-center gap-3 w-full p-2 rounded-md text-sm text-left transition-colors",
                                            isSelected ? "bg-primary/10 text-primary font-semibold" : "hover:bg-accent"
                                        )}
                                    >
                                        <Icon className="h-5 w-5 text-muted-foreground" />
                                        <span className="flex-1">{pair}</span>
                                        {isSelected && <Check className="h-5 w-5 text-primary" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
                </div>
            </ScrollArea>
        </div>
    );
}

