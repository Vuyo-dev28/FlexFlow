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

export const timeFrames = ['1m', '3m', '5m', '15m', '1h', '4h', '1D'] as const;
export type TimeFrame = (typeof timeFrames)[number];

// Schema for generating a signal for a pair
export const GenerateSignalInputSchema = z.object({
  pair: z.string().describe('The financial pair to generate a signal for, e.g., "EUR/USD".'),
  timeFrame: z.enum(timeFrames).describe('The trading time frame to base the strategy on.'),
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
export type GenerateSignalOutput = z.infer<typeof GenerateSignalOutputSchema>;


// Schema for analyzing a chart image
export const AnalyzeChartInputSchema = z.object({
  chartImageUri: z
    .string()
    .describe(
      "A data URI of the chart image to be analyzed. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  timeFrame: z.enum(timeFrames).describe('The trading time frame the chart represents.'),
});
export type AnalyzeChartInput = z.infer<typeof AnalyzeChartInputSchema>;

// Schema for the output of the chart analysis
export const AnalyzeChartOutputSchema = z.object({
  id: z.string().describe('A unique identifier for this analysis result.'),
  chartImageUri: z.string().describe('The data URI of the analyzed chart image.'),
  type: z.enum(['BUY', 'SELL', 'HOLD']).describe("The trading signal: BUY, SELL, or HOLD if uncertain."),
  rationale: z
    .string()
    .describe('A detailed rationale for the generated trading signal, based on the chart analysis.'),
  entry: z.number().optional().describe('The suggested entry price for the trade. Required if type is BUY or SELL.'),
  takeProfit: z.number().optional().describe('The suggested take-profit price. Required if type is BUY or SELL.'),
  stopLoss: z.number().optional().describe('The suggested stop-loss price. Required if type is BUY or SELL.'),
});
export type AnalyzeChartOutput = z.infer<typeof AnalyzeChartOutputSchema>;


// The full signal object used in the application
export interface Signal extends GenerateSignalOutput {
  id: string;
  pair: FinancialPair;
  category: SignalCategory;
  timestamp: Date;
}
