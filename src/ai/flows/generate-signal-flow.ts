'use server';
/**
 * @fileOverview A trading signal generation AI agent.
 *
 * - generateSignals - A function that handles the signal generation process for multiple pairs.
 * - GenerateSignalsInput - The input type for the generateSignals function.
 * - GenerateSignalsOutput - The return type for the generateSignals function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { FinancialPair, GeneratedSignal } from '@/types/signal';

const GenerateSignalsInputSchema = z.object({
  pairs: z.array(z.string()).describe('The financial pairs to generate signals for (e.g., ["BTC/USD", "ETH/USD"]).'),
});
export type GenerateSignalsInput = z.infer<typeof GenerateSignalsInputSchema>;

const SingleSignalSchema = z.object({
    pair: z.string().describe('The financial pair for which the signal is generated (e.g., BTC/USD).'),
    type: z.enum(['BUY', 'SELL']).describe("The type of signal, either 'BUY' or 'SELL'."),
    entry: z.number().describe('The suggested entry price for the trade.'),
    takeProfit: z.number().describe('The suggested take profit price for the trade.'),
    stopLoss: z.number().describe('The suggested stop loss price for the trade.'),
    rationale: z.string().describe('A detailed rationale for the trading signal, including technical and/or fundamental analysis (2-3 sentences).'),
});

const GenerateSignalsOutputSchema = z.object({
    signals: z.array(SingleSignalSchema),
});

export type GenerateSignalsOutput = z.infer<typeof GenerateSignalsOutputSchema>;


const getMarketDataTool = ai.defineTool(
    {
      name: 'getMarketData',
      description: 'Get the current market price for a list of financial pairs.',
      inputSchema: z.object({
        pairs: z.array(z.string()).describe('The financial pairs to fetch data for.'),
      }),
      outputSchema: z.object({
        results: z.array(
          z.object({
            pair: z.string(),
            price: z.number().optional(),
            error: z.string().optional(),
          })
        ),
      }),
    },
    async ({ pairs }) => {
      // In a real application, this would fetch from a live data source.
      // For now, we'll use a fixed set of realistic prices.
      console.log(`Fetching market data for: ${pairs.join(', ')}`);
      const results = pairs.map(pair => {
        let price;
        switch (pair) {
          case 'BTC/USD': price = 68000.50; break;
          case 'ETH/USD': price = 3500.20; break;
          case 'SOL/USD': price = 150.75; break;
          case 'XRP/USD': price = 0.52; break;
          case 'ADA/USD': price = 0.45; break;
          case 'NAS100/USD': price = 19500.00; break;
          case 'US30/USD': price = 39000.00; break;
          case 'VIX': price = 13.5; break;
          case 'EUR/USD': price = 1.0850; break;
          case 'GBP/JPY': price = 200.50; break;
          case 'XAU/USD': price = 2350.80; break;
          default: return { pair, error: 'Unknown pair' };
        }
        return { pair, price };
      });
      return { results };
    }
);

export async function generateSignals(input: { pairs: FinancialPair[] }): Promise<GeneratedSignal[]> {
    let result: GenerateSignalsOutput;
    try {
        result = await generateSignalFlow({ pairs: input.pairs as string[] });
    } catch(e) {
        console.error("Failed to call generateSignalFlow", e);
        // Fallback to generating empty signals if the flow fails
        return input.pairs.map(pair => ({
            type: 'SELL',
            entry: 0,
            takeProfit: 0,
            stopLoss: 0,
            rationale: `Could not generate a signal for ${pair} due to an internal error.`,
        }));
    }
    
    // Create a map for quick lookup of generated signals by pair
    const signalMap = new Map(result.signals.map(s => [s.pair, s]));

    // Map input pairs to the generated signals, ensuring order and completeness
    const orderedSignals = input.pairs.map(pair => {
        const signal = signalMap.get(pair);
        if (signal) {
            return {
                type: signal.type,
                entry: signal.entry,
                takeProfit: signal.takeProfit,
                stopLoss: signal.stopLoss,
                rationale: signal.rationale,
            };
        }
        // This case handles pairs the model might have failed to generate a signal for.
        console.warn(`No signal generated for ${pair}`);
        return {
            type: 'SELL',
            entry: 0,
            takeProfit: 0,
            stopLoss: 0,
            rationale: `Could not generate a signal for ${pair}.`,
        } as GeneratedSignal;
    });

    return orderedSignals;
}


const prompt = ai.definePrompt({
  name: 'generateSignalPrompt',
  input: { schema: GenerateSignalsInputSchema },
  output: { schema: GenerateSignalsOutputSchema },
  tools: [getMarketDataTool],
  prompt: `You are an expert financial analyst with 20 years of experience in technical and fundamental analysis, specializing in short-term trades.

Your task is to generate a trading signal for each of the given financial pairs: {{#each pairs}}"{{{this}}}"{{#unless @last}}, {{/unless}}{{/each}}.
The signal should be for a trade expected to be executed within a 30-MINUTE TIMEFRAME.

First, you MUST use the 'getMarketData' tool to fetch the current market prices for all requested pairs. This is a mandatory first step.

Based on the live data from the tool and your market analysis, provide a clear 'BUY' or 'SELL' signal for each pair.

Then, determine precise and realistic price points for the following, ensuring they are formatted as numbers with appropriate decimal places for the given asset. The Take Profit and Stop Loss should be very tight, suitable for a 30-minute trade.
- Entry Price: The price at which to enter the trade. This should be very close to the current market price returned by the tool.
- Take Profit: A realistic target price to close the trade in profit, based on recent volatility within a 30-minute chart.
- Stop Loss: A sensible price to close the trade and limit losses, based on recent support/resistance within a 30-minute chart.

For example, for XAU/USD, if the current price is 2350.80, the entry, TP, and SL should be values like 2351.00, 2355.50, and 2348.00, not values like 3358.4.

Finally, write a concise (2-3 sentences) but compelling rationale for each signal, explaining the key factors behind your decision.

Do not include any introductory or concluding remarks. The output must contain a signal for every requested pair. If the tool returns an error for a pair, you should indicate that in the rationale and not generate a signal for it.`,
});

const generateSignalFlow = ai.defineFlow(
  {
    name: 'generateSignalFlow',
    inputSchema: GenerateSignalsInputSchema,
    outputSchema: GenerateSignalsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
