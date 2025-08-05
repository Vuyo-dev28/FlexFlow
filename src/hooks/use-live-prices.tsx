'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { FinancialPair } from '@/types/signal';
import { ALL_PAIRS } from '@/lib/mock-data';

type PriceChanges = Record<FinancialPair, 'up' | 'down' | 'none'>;
type LivePrices = Record<FinancialPair, number>;

interface LivePricesContextType {
  livePrices: LivePrices;
  priceChanges: PriceChanges;
}

const LivePricesContext = createContext<LivePricesContextType>({
  livePrices: {} as LivePrices,
  priceChanges: {} as PriceChanges,
});

export const useLivePrices = () => useContext(LivePricesContext);

const REFRESH_INTERVAL = 1000; // 1 second

async function fetchForexRates(): Promise<LivePrices | null> {
    try {
        const response = await fetch('/api/forex');
        if (!response.ok) {
            const errorData = await response.json();
            console.error("API route error:", errorData.error);
            return null;
        }
        const data = await response.json();
        return data.prices;
    } catch (error) {
        console.error("Failed to fetch from internal API route:", error);
        return null;
    }
}

export const LivePricesProvider = ({ children }: { children: ReactNode }) => {
  const [livePrices, setLivePrices] = useState<LivePrices>({} as LivePrices);
  const [priceChanges, setPriceChanges] = useState<PriceChanges>({} as PriceChanges);

  useEffect(() => {
    const updatePrices = async () => {
      const newPrices = await fetchForexRates();

      if (newPrices) {
        setPriceChanges(prevChanges => {
          const newChanges: PriceChanges = { ...prevChanges };
          for (const pair in newPrices) {
            const p = pair as FinancialPair;
            const oldPrice = livePrices[p];
            const newPrice = newPrices[p];
            if (oldPrice && newPrice) {
              if (newPrice > oldPrice) newChanges[p] = 'up';
              else if (newPrice < oldPrice) newChanges[p] = 'down';
              else newChanges[p] = 'none';
            } else {
              newChanges[p] = 'none';
            }
          }
          return newChanges;
        });
        setLivePrices(prevPrices => ({...prevPrices, ...newPrices}));
      }
    };

    const intervalId = setInterval(updatePrices, REFRESH_INTERVAL);

    // Initial fetch
    updatePrices();

    return () => clearInterval(intervalId);
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const value = { livePrices, priceChanges };

  return (
    <LivePricesContext.Provider value={value}>
      {children}
    </LivePricesContext.Provider>
  );
};
