import type { Signal, SignalCategory, FinancialPair } from '@/types/signal';

export const ALL_PAIRS: { pair: FinancialPair, category: SignalCategory }[] = [
    { pair: 'BTC/USD', category: 'Crypto' },
    { pair: 'ETH/USD', category: 'Crypto' },
    { pair: 'SOL/USD', category: 'Crypto' },
    { pair: 'XRP/USD', category: 'Crypto' },
    { pair: 'ADA/USD', category: 'Crypto' },
    { pair: 'NAS100/USD', category: 'Stock Indices' },
    { pair: 'US30/USD', category: 'Stock Indices' },
    { pair: 'VIX', category: 'Volatility Indices' },
    { pair: 'EUR/USD', category: 'Forex' },
    { pair: 'GBP/JPY', category: 'Forex' },
    { pair: 'USD/JPY', category: 'Forex' },
    { pair: 'GBP/USD', category: 'Forex' },
    { pair: 'AUD/USD', category: 'Forex' },
    { pair: 'USD/CAD', category: 'Forex' },
    { pair: 'XAU/USD', category: 'Metals' },
];

export const MOCK_SIGNALS: Signal[] = [];
