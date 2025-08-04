import { z } from 'zod';

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

export const GenerateSignalInputSchema = z.object({
  pair: z.string().describe('The financial pair to generate a signal for, e.g., "EUR/USD".'),
  price: z.number().describe('The current live price of the financial pair.'),
});
export type GenerateSignalInput = z.infer<typeof GenerateSignalInputSchema>;

// Define the schema for the flow's output
export const GenerateSignalOutputSchema = z.object({
    type: z.enum(['BUY', 'SELL']),
    entry: z.number(),
    takeProfit: z.number(),
    stopLoss: z.number(),
    rationale: z.string(),
});

export type GeneratedSignal = z.infer<typeof GenerateSignalOutputSchema>;

export interface Signal extends GeneratedSignal {
  id: string;
  pair: FinancialPair;
  category: SignalCategory;
  timestamp: Date;
}
