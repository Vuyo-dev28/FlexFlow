'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { FinancialPair } from '@/types/signal';

interface SignalFiltersProps {
  pairs: FinancialPair[];
  selectedPair: FinancialPair | 'All';
  onPairChange: (pair: FinancialPair | 'All') => void;
}

export function SignalFilters({ pairs, selectedPair, onPairChange }: SignalFiltersProps) {
  return (
    <div className="px-4 py-3 border-b border-border">
      <Tabs value={selectedPair} onValueChange={(value) => onPairChange(value as FinancialPair | 'All')}>
        <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:grid-flow-col">
          <TabsTrigger value="All">All</TabsTrigger>
          {pairs.map(pair => (
            <TabsTrigger key={pair} value={pair}>{pair}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
