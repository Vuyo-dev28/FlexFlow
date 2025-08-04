export type FinancialPair = 
  // Crypto
  'BTC/USD' | 'ETH/USD' | 'SOL/USD' | 'XRP/USD' | 'ADA/USD' | 
  // Stock Indices
  'NAS100/USD' | 'US30/USD' | 'VIX' |
  // Forex
  'EUR/USD' | 'GBP/JPY' |
  // Metals
  'XAU/USD';

export type SignalType = 'BUY' | 'SELL';

export type SignalCategory = 'Crypto' | 'Stock Indices' | 'Forex' | 'Metals' | 'Volatility Indices';

export interface GeneratedSignal {
  type: SignalType;
  entry: number;
  takeProfit: number;
  stopLoss: number;
  rationale: string;
}

export interface Signal extends GeneratedSignal {
  id: string;
  pair: FinancialPair;
  category: SignalCategory;
  timestamp: Date;
}
