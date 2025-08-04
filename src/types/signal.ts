export type FinancialPair = 'BTC/USD' | 'ETH/USD' | 'SOL/USD' | 'XRP/USD' | 'ADA/USD';

export type SignalType = 'BUY' | 'SELL';

export interface Signal {
  id: string;
  pair: FinancialPair;
  type: SignalType;
  timestamp: Date;
  entry: number;
  takeProfit: number;
  stopLoss: number;
  rationale: string;
}
