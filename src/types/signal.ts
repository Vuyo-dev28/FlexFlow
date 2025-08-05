import { z } from 'zod';

export type FinancialPair = 
  // Crypto
  'BTC/USD' | 'ETH/USD' | 'SOL/USD' | 'XRP/USD' | 'ADA/USD' | 
  // Stock Indices
  'NAS100/USD' | 'US30/USD' | 'VIX' |
  // Forex
  'EUR/USD' | 'GBP/JPY' | 'USD/JPY' | 'GBP/USD' | 'AUD/USD' | 'USD/CAD' |
  // Metals
  'XAU/USD';

export type SignalType = 'BUY' | 'SELL';

export type SignalCategory = 'Crypto' | 'Stock Indices' | 'Forex' | 'Metals' | 'Volatility Indices';

// Schema for generating a signal for a pair
export const GenerateSignalInputSchema = z.object({
  pair: z.string().describe('The financial pair to generate a signal for, e.g., "EUR/USD".'),
});
export type GenerateSignalInput = z.infer<typeof GenerateSignalInputSchema>;

// Schema for the output of the generated signal
export const GenerateSignalOutputSchema = z.object({
    type: z.enum(['BUY', 'SELL']),
    entry: z.number(),
    takeProfit: z.number(),
    stopLoss: z.number(),
    rationale: z.string(),
});
export type GeneratedSignal = z.infer<typeof GenerateSignalOutputSchema>;


// Schema for analyzing a chart image
export const AnalyzeChartInputSchema = z.object({
  chartImageUri: z
    .string()
    .describe(
      "A data URI of the chart image to be analyzed. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeChartInput = z.infer<typeof AnalyzeChartInputSchema>;

// Schema for the output of the chart analysis
export const AnalyzeChartOutputSchema = z.object({
  type: z.enum(['BUY', 'SELL', 'HOLD']).describe("The trading signal: BUY, SELL, or HOLD if uncertain."),
  rationale: z
    .string()
    .describe('A detailed rationale for the generated trading signal, based on the chart analysis.'),
});
export type AnalyzeChartOutput = z.infer<typeof AnalyzeChartOutputSchema>;


// The full signal object used in the application
export interface Signal extends GeneratedSignal {
  id: string;
  pair: FinancialPair;
  category: SignalCategory;
  timestamp: Date;
}
