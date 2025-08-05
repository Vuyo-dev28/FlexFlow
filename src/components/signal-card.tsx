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
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Signal } from '@/types/signal';
import { cn } from '@/lib/utils';
import { useLivePrices } from '@/hooks/use-live-prices';
import { useEffect, useState } from 'react';

interface SignalCardProps {
  signal: Signal;
  onSelect: () => void;
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

function LivePriceDisplay({ pair }: { pair: string }) {
    const { livePrices, priceChanges, forexPairs } = useLivePrices();
    const [flash, setFlash] = useState<'up' | 'down' | ''>('');

    const isForex = forexPairs.includes(pair);
    const price = livePrices[pair];
    const change = priceChanges[pair] || 'neutral';

    useEffect(() => {
        if (change !== 'neutral') {
            setFlash(change);
            const timer = setTimeout(() => setFlash(''), 500); // Flash for 500ms
            return () => clearTimeout(timer);
        }
    }, [price, change]);

    if (!isForex || typeof price !== 'number') {
        return null;
    }
    
    const priceColor = change === 'up' ? 'text-green-400' : change === 'down' ? 'text-red-400' : 'text-foreground';
    const flashClass = flash === 'up' ? 'bg-green-500/20' : flash === 'down' ? 'bg-red-500/20' : '';

    return (
        <div className="flex items-center justify-center gap-2 mt-2 mb-1">
            <div className={cn('flex items-center gap-2 rounded-md p-2 transition-colors duration-500', flashClass)}>
                <span className="text-xs text-muted-foreground">Live:</span>
                <span className={cn('text-lg font-mono font-bold transition-colors', priceColor)}>
                    {price.toFixed(4)}
                </span>
                {change === 'up' && <ArrowUp className="h-4 w-4 text-green-400" />}
                {change === 'down' && <ArrowDown className="h-4 w-4 text-red-400" />}
            </div>
        </div>
    );
}


export function SignalCard({ signal, onSelect }: SignalCardProps) {
  const isBuy = signal.type === 'BUY';
  const Icon = pairIcons[signal.pair] || CandlestickChart;
  
  const formatPrice = (price: number) => {
    // Simple heuristic to format prices based on their magnitude
    if (price > 1000) return price.toFixed(2);
    if (price < 10) return price.toFixed(4);
    return price.toFixed(2);
  }

  return (
    <div
      className="flex flex-col p-3 border rounded-lg cursor-pointer bg-card/50 hover:bg-accent/50 transition-colors duration-200 group"
      onClick={onSelect}
    >
        {/* Card Header */}
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
                <Icon className="h-8 w-8 text-muted-foreground transition-colors" />
                <div>
                    <h3 className="font-bold text-base text-foreground">{signal.pair}</h3>
                    <p className="text-xs text-muted-foreground">{signal.category}</p>
                </div>
            </div>
            <div className="flex flex-col items-end gap-1">
                <Badge
                    variant="outline"
                    className={cn(
                    'text-xs font-semibold py-1 px-2',
                    isBuy ? 'border-green-500/50 text-green-400 bg-green-500/10' : 'border-red-500/50 text-red-400 bg-red-500/10'
                    )}
                >
                    {signal.type}
                </Badge>
            </div>
        </div>

        {/* Rationale */}
        <p className="text-sm text-muted-foreground mb-3 px-1 leading-snug">{signal.rationale}</p>
        
        <LivePriceDisplay pair={signal.pair} />

        {/* Price Info */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs px-1">
            <div className='text-red-400'>
                <p className="text-muted-foreground text-xs">Stop Loss</p>
                <p className="font-mono text-sm font-semibold">{formatPrice(signal.stopLoss)}</p>
            </div>
            <div className='text-foreground'>
                <p className="text-muted-foreground text-xs">Entry Price</p>
                <p className="font-mono text-sm font-semibold">{formatPrice(signal.entry)}</p>
            </div>
            <div className='text-green-400'>
                <p className="text-muted-foreground text-xs">Take Profit</p>
                <p className="font-mono text-sm font-semibold">{formatPrice(signal.takeProfit)}</p>
            </div>
        </div>
      
    </div>
  );
}
