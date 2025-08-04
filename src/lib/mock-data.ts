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
    { pair: 'XAU/USD', category: 'Metals' },
];

export const MOCK_SIGNALS: Signal[] = [
  {
    id: '1',
    pair: 'BTC/USD',
    category: 'Crypto',
    timestamp: new Date(),
    type: 'BUY',
    entry: 68500.00,
    takeProfit: 69200.00,
    stopLoss: 68100.00,
    rationale: 'Strong momentum suggests a potential breakout above the current resistance level.'
  },
  {
    id: '2',
    pair: 'ETH/USD',
    category: 'Crypto',
    timestamp: new Date(),
    type: 'SELL',
    entry: 3600.00,
    takeProfit: 3550.00,
    stopLoss: 3625.00,
    rationale: 'Price is showing weakness after hitting a key resistance zone.'
  },
  {
    id: '3',
    pair: 'EUR/USD',
    category: 'Forex',
    timestamp: new Date(),
    type: 'BUY',
    entry: 1.0850,
    takeProfit: 1.0880,
    stopLoss: 1.0835,
    rationale: 'Bullish divergence on the RSI indicates potential for a short-term reversal.'
  },
  {
    id: '4',
    pair: 'XAU/USD',
    category: 'Metals',
    timestamp: new Date(),
    type: 'SELL',
    entry: 2350.00,
    takeProfit: 2335.00,
    stopLoss: 2358.00,
    rationale: 'Gold is overbought and facing resistance from the upper Bollinger Band.'
  },
    {
    id: '5',
    pair: 'NAS100/USD',
    category: 'Stock Indices',
    timestamp: new Date(),
    type: 'BUY',
    entry: 18650.50,
    takeProfit: 18750.00,
    stopLoss: 18600.00,
    rationale: 'Positive market sentiment and strong earnings reports are driving the index higher.'
  },
  {
    id: '6',
    pair: 'GBP/JPY',
    category: 'Forex',
    timestamp: new Date(),
    type: 'SELL',
    entry: 201.50,
    takeProfit: 200.80,
    stopLoss: 201.90,
    rationale: 'A bearish engulfing pattern has formed on the 4-hour chart, signaling a potential downtrend.'
  },
  {
    id: '7',
    pair: 'US30/USD',
    category: 'Stock Indices',
    timestamp: new Date(),
    type: 'BUY',
    entry: 39800.00,
    takeProfit: 39950.00,
    stopLoss: 39720.00,
    rationale: 'The index has found strong support at the 50-day moving average.'
  },
    {
    id: '8',
    pair: 'SOL/USD',
    category: 'Crypto',
    timestamp: new Date(),
    type: 'BUY',
    entry: 165.00,
    takeProfit: 170.00,
    stopLoss: 162.50,
    rationale: 'A bullish pennant formation suggests a continuation of the recent uptrend.'
  },
];
