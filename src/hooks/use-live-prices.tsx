'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { FinancialPair } from '@/types/signal';
import { ALL_PAIRS } from '@/lib/mock-data';
import fetch from 'node-fetch';

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

const forexPairs = ALL_PAIRS.filter(p => p.category === 'Forex').map(p => p.pair);

async function fetchForexRates(): Promise<LivePrices | null> {
    const apiKey = process.env.NEXT_PUBLIC_FOREX_API_KEY;
    if (!apiKey) {
      console.warn("Forex API key not found. Live prices for Forex will not be available.");
      return null;
    }
    const apiPairs = forexPairs.map(p => p.replace('/', '')).join(',');
    const url = `https://api.forexapi.dev/v1/live?pairs=${apiPairs}&api_key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data: any = await response.json();
        
        if (data.error) {
            console.error("Forex API Error:", data.message);
            return null;
        }

        const newPrices: LivePrices = {} as LivePrices;
        forexPairs.forEach(pair => {
            const apiPair = pair.replace('/', '');
            if (data.rates[apiPair]) {
                newPrices[pair] = data.rates[apiPair].price;
            }
        });

        return newPrices;
    } catch (error) {
        console.error("Failed to fetch Forex rates:", error);
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
