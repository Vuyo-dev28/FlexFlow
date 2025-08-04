'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SignalCategory } from '@/types/signal';

interface SignalFiltersProps {
  categories: SignalCategory[];
  selectedCategory: SignalCategory | 'All';
  onCategoryChange: (category: SignalCategory | 'All') => void;
}

export function SignalFilters({ categories, selectedCategory, onCategoryChange }: SignalFiltersProps) {
  return (
    <div className="px-4 py-3 border-b border-border overflow-x-auto">
       <Tabs 
        value={selectedCategory} 
        onValueChange={(value) => onCategoryChange(value as SignalCategory | 'All')}
        className="w-full"
      >
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="All">All</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
