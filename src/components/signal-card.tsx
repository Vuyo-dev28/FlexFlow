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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Signal } from '@/types/signal';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';

interface LivePriceDisplayProps {
  price: number;
  change: 'up' | 'down' | 'none';
  formatPrice: (price: number) => string;
}

const LivePriceDisplay: React.FC<LivePriceDisplayProps> = ({ price, change, formatPrice }) => {
  const [flash, setFlash] = useState<'up' | 'down' | 'none'>('none');

  useEffect(() => {
    if (change !== 'none') {
      setFlash(change);
      const timer = setTimeout(() => setFlash('none'), 500); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [price, change]);

  return (
    <div className={cn(
        "transition-colors duration-500 rounded-md px-2 py-0.5",
        flash === 'up' && 'bg-green-500/20',
        flash === 'down' && 'bg-red-500/20'
    )}>
      <span className={cn(
        "font-mono text-xs",
        change === 'up' && 'text-green-400',
        change === 'down' && 'text-red-400',
        change === 'none' && 'text-muted-foreground'
      )}>
        {formatPrice(price)}
      </span>
    </div>
  );
};


interface SignalCardProps {
  signal: Signal;
  onSelect: () => void;
  livePrice?: number;
  priceChange?: 'up' | 'down' | 'none';
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

export function SignalCard({ signal, onSelect, livePrice, priceChange }: SignalCardProps) {
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
                {livePrice && priceChange && (
                    <LivePriceDisplay price={livePrice} change={priceChange} formatPrice={formatPrice} />
                )}
            </div>
        </div>

        {/* Rationale */}
        <p className="text-sm text-muted-foreground mb-3 px-1 leading-snug">{signal.rationale}</p>
        
        {/* Price Info */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs px-1 mt-auto">
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
