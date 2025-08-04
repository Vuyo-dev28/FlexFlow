'use client';

import {
  ArrowUpRight,
  ArrowDownLeft,
  Bitcoin,
  CandlestickChart,
  DollarSign,
  Euro,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Signal } from '@/types/signal';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface SignalCardProps {
  signal: Signal;
  onSelect: () => void;
}

const pairIcons: Record<string, React.ElementType> = {
  'BTC/USD': Bitcoin,
  'ETH/USD': TrendingUp,
  'SOL/USD': CandlestickChart,
  'XRP/USD': DollarSign,
  'ADA/USD': Euro,
};

export function SignalCard({ signal, onSelect }: SignalCardProps) {
  const isBuy = signal.type === 'BUY';
  const Icon = pairIcons[signal.pair] || CandlestickChart;
  const timeAgo = formatDistanceToNow(signal.timestamp, { addSuffix: true });

  return (
    <Card
      className="flex flex-col cursor-pointer hover:border-primary/50 transition-colors duration-300 group"
      onClick={onSelect}
    >
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Icon className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
            <CardTitle className="text-xl">{signal.pair}</CardTitle>
          </div>
          <Badge
            variant="outline"
            className={cn(
              'text-sm',
              isBuy ? 'border-accent text-accent' : 'border-destructive text-destructive'
            )}
          >
            {signal.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Entry Price</span>
            <span className="font-mono text-foreground">{signal.entry.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Take Profit</span>
            <span className="font-mono text-green-500">{signal.takeProfit.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Stop Loss</span>
            <span className="font-mono text-red-500">{signal.stopLoss.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-xs text-muted-foreground">
        <span>{timeAgo}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>View Details</span>
          {isBuy ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownLeft className="h-3 w-3" />
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
