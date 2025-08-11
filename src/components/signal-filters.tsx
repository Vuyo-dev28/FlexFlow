
'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SignalCategory } from '@/types/signal';

interface SignalFiltersProps {
  categories: (SignalCategory | 'All')[];
  selectedCategory: SignalCategory | 'All';
  onCategoryChange: (category: SignalCategory | 'All') => void;
}

export function SignalFilters({ categories, selectedCategory, onCategoryChange }: SignalFiltersProps) {
  return (
    <div className="overflow-x-auto">
       <Tabs 
        value={selectedCategory} 
        onValueChange={(value) => onCategoryChange(value as SignalCategory | 'All')}
      >
        <TabsList>
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

    