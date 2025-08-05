'use client';

import { useState, useEffect, createContext, useContext, useMemo, useCallback } from 'react';
import type { FinancialPair } from '@/types/signal';
import { MOCK_SIGNALS } from '@/lib/mock-data';

const FOREX_API_URL = 'https://api.forexrateapi.com/v1/latest';
const UPDATE_INTERVAL = 1000; // 1 second

interface LivePrices {
  [key: string]: number;
}

interface PriceChanges {
  [key: string]: 'up' | 'down' | 'neutral';
}

interface LivePricesContextType {
  livePrices: LivePrices;
  priceChanges: PriceChanges;
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  forexPairs: FinancialPair[];
}

const LivePricesContext = createContext<LivePricesContextType | undefined>(undefined);

async function fetchForexRates(apiKey: string, base: string, currencies: string): Promise<LivePrices | null> {
  if (!apiKey) return null;
  try {
    const response = await fetch(`${FOREX_API_URL}?api_key=${apiKey}&base=${base}&currencies=${currencies}`);
    const data = await response.json();
    if (!data.success) {
      console.error("Forex API error:", data.error ? JSON.stringify(data.error) : 'Could not fetch live price.');
      return null;
    }
    return data.rates;
  } catch (error) {
    console.error("Failed to fetch forex rates:", error);
    return null;
  }
}

export function LivePricesProvider({ children }: { children: React.ReactNode }) {
  const [livePrices, setLivePrices] = useState<LivePrices>({});
  const [priceChanges, setPriceChanges] = useState<PriceChanges>({});
  const [apiKey, setApiKey] = useState<string | null>(process.env.NEXT_PUBLIC_FOREX_API_KEY || null);

  const forexPairs = useMemo(() => 
    MOCK_SIGNALS.filter(s => s.category === 'Forex').map(s => s.pair) as FinancialPair[],
    []
  );

  const updatePrices = useCallback(async () => {
    if (!apiKey) return;

    // Correctly get all bases and currencies for the API call.
    const bases = Array.from(new Set(forexPairs.map(p => p.substring(0, 3))));
    const allCurrencies = Array.from(new Set(forexPairs.flatMap(p => [p.substring(0,3), p.substring(4,7)])));
    
    try {
      // We can only have one base, so we'll use the first one. This is a limitation of the free API.
      // For a real app, we might need multiple calls or a more advanced API.
      const base = bases[0] || 'USD';
      const currenciesToFetch = allCurrencies.filter(c => c !== base).join(',');

      const rates = await fetchForexRates(apiKey, base, currenciesToFetch);

      if (rates) {
        // Add the base rate
        rates[base] = 1.0;
        
        setLivePrices(prevPrices => {
          const newPriceChanges: PriceChanges = {};
          const updatedPrices = { ...prevPrices };

          forexPairs.forEach(pair => {
            const pairBase = pair.substring(0, 3);
            const pairTarget = pair.substring(4, 7);

            if (rates[pairBase] && rates[pairTarget]) {
              // Calculate the cross-rate
              const newPrice = rates[pairTarget] / rates[pairBase];
              const oldPrice = prevPrices[pair];
              updatedPrices[pair] = newPrice;

              if (oldPrice) {
                if (newPrice > oldPrice) newPriceChanges[pair] = 'up';
                else if (newPrice < oldPrice) newPriceChanges[pair] = 'down';
                else newPriceChanges[pair] = 'neutral';
              } else {
                newPriceChanges[pair] = 'neutral';
              }
            }
          });

          setPriceChanges(prevChanges => ({ ...prevChanges, ...newPriceChanges }));
          return updatedPrices;
        });
      }
    } catch (error) {
      console.error('Error updating prices:', error);
    }
  }, [apiKey, forexPairs]);


  useEffect(() => {
    if (apiKey) {
      updatePrices(); // Initial fetch
      const intervalId = setInterval(updatePrices, UPDATE_INTERVAL);
      return () => clearInterval(intervalId);
    }
  }, [apiKey, updatePrices]);

  const contextValue = {
    livePrices,
    priceChanges,
    apiKey,
    setApiKey,
    forexPairs
  };

  return (
    <LivePricesContext.Provider value={contextValue}>
      {children}
    </LivePricesContext.Provider>
  );
}

export const useLivePrices = () => {
  const context = useContext(LivePricesContext);
  if (context === undefined) {
    throw new Error('useLivePrices must be used within a LivePricesProvider');
  }
  return context;
};
