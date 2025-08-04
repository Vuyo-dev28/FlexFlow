'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { ALL_PAIRS } from '@/lib/mock-data';
import type { FinancialPair } from '@/types/signal';

const API_KEY = process.env.NEXT_PUBLIC_FOREX_API_KEY;
const REFRESH_INTERVAL = 5000; // 5 seconds

interface LivePrice {
  price: number;
  direction: 'up' | 'down' | 'stable';
}

interface LivePricesState {
  [key: string]: LivePrice;
}

const LivePricesContext = createContext<{ prices: LivePricesState }>({ prices: {} });

export const useLivePrices = () => useContext(LivePricesContext);

async function fetchForexRates(pairs: FinancialPair[]) {
  const baseCurrency = 'USD';
  const currencies = new Set<string>();
  pairs.forEach(pair => {
    const [base, quote] = pair.split('/');
    if (base !== baseCurrency) currencies.add(base);
    if (quote !== baseCurrency) currencies.add(quote);
  });
  
  const url = `https://api.forexrateapi.com/v1/latest?api_key=${API_KEY}&base=${baseCurrency}&currencies=${Array.from(currencies).join(',')}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
        console.error("Failed to fetch forex rates:", response.statusText);
        return null;
    }
    const data = await response.json();
    if (!data.success) {
      console.error("Forex API error:", data.error?.info);
      return null;
    }
    return data.rates;
  } catch (error) {
    console.error("Error fetching forex rates:", error);
    return null;
  }
}

export const LivePricesProvider = ({ children }: { children: React.ReactNode }) => {
  const [prices, setPrices] = useState<LivePricesState>({});

  const forexPairs = useMemo(() => ALL_PAIRS.filter(p => p.category === 'Forex').map(p => p.pair), []);

  const updatePrices = useCallback(async () => {
    const rates = await fetchForexRates(forexPairs);
    if (!rates) return;

    setPrices(prevPrices => {
      const newPrices: LivePricesState = {};
      
      forexPairs.forEach(pair => {
        const [base, quote] = pair.split('/');
        let currentPrice: number | undefined = undefined;

        if (base === 'USD') {
            currentPrice = rates[quote];
        } else if (quote === 'USD') {
            currentPrice = 1 / rates[base];
        } else if (rates[base] && rates[quote]) {
            currentPrice = rates[quote] / rates[base];
        }
        
        if (currentPrice !== undefined) {
          const oldPrice = prevPrices[pair]?.price;
          const direction =
            !oldPrice || oldPrice === currentPrice
              ? 'stable'
              : currentPrice > oldPrice
              ? 'up'
              : 'down';
          
          newPrices[pair] = { price: currentPrice, direction };
        }
      });
      
      return { ...prevPrices, ...newPrices };
    });
  }, [forexPairs]);

  useEffect(() => {
    if (!API_KEY) {
      console.warn("Forex API key is missing. Live prices will not be available.");
      return;
    }

    updatePrices(); // Initial fetch
    const intervalId = setInterval(updatePrices, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [updatePrices]);

  return (
    <LivePricesContext.Provider value={{ prices }}>
      {children}
    </LivePricesContext.Provider>
  );
};
