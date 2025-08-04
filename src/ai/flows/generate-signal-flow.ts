'use server';
/**
 * @fileOverview A Genkit flow for generating trading signals.
 *
 * This file defines a flow that takes a financial pair and generates a trading signal
 * based on live market data. It uses a tool to fetch prices, which combines a
 * real-time Forex API with AI-generated prices for other assets.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateSignalInput,
  GenerateSignalInputSchema,
  GenerateSignalOutputSchema,
  GeneratedSignal,
  FinancialPair,
  SignalCategory,
} from '@/types/signal';
import {z} from 'zod';
import {ALL_PAIRS} from '@/lib/mock-data';

const API_KEY = process.env.FOREX_API_KEY;

// Schema for the AI-powered price generation
const PriceGenerationSchema = z.object({
  price: z.number().describe('The current, realistic market price for the asset.'),
});

/**
 * A tool that fetches the current market price for a given financial pair.
 * It uses a live API for Forex pairs and an AI model for other asset classes.
 */
const getMarketData = ai.defineTool(
  {
    name: 'getMarketData',
    description: 'Gets the current market price for a financial pair. Uses a live API for Forex and AI for others.',
    inputSchema: z.object({
      pair: z.string().describe('The financial pair to get the price for (e.g., "EUR/USD", "BTC/USD").'),
    }),
    outputSchema: z.object({
      price: z.number().optional(),
      error: z.string().optional(),
    }),
  },
  async ({pair}) => {
    const pairInfo = ALL_PAIRS.find(p => p.pair === pair);
    if (!pairInfo) {
      return {error: `Pair not found: ${pair}`};
    }

    // Use live Forex API for currency pairs
    if (pairInfo.category === 'Forex') {
      if (!API_KEY) {
        return {error: 'Forex API key is not configured.'};
      }
      try {
        const currencies = new Set<string>();
        const [base, quote] = pair.split('/');
        if (base !== 'USD') currencies.add(base);
        if (quote !== 'USD') currencies.add(quote);

        const url = `https://api.forexrateapi.com/v1/latest?api_key=${API_KEY}&base=USD&currencies=${Array.from(currencies).join(',')}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        if (!data.success) {
          throw new Error(`Forex API error: ${data.error?.info || JSON.stringify(data.error)}`);
        }

        let currentPrice: number | undefined;
        if (base === 'USD') currentPrice = 1 / data.rates[quote];
        else if (quote === 'USD') currentPrice = data.rates[base];
        else if (data.rates[base] && data.rates[quote]) currentPrice = data.rates[base] / data.rates[quote];

        if (currentPrice !== undefined) {
          return {price: currentPrice};
        } else {
          return {error: `Could not determine price for ${pair}`};
        }
      } catch (e: any) {
        return {error: `Failed to fetch Forex data: ${e.message}`};
      }
    }

    // Use AI to generate prices for other asset classes
    try {
      const {output} = await ai.generate({
        model: 'googleai/gemini-1.5-flash-preview',
        output: {schema: PriceGenerationSchema},
        prompt: `You are a financial data provider. What is the current, realistic market price of ${pair}? Provide the price only.`,
      });
      return {price: output!.price};
    } catch (e: any) {
      return {error: `Failed to generate price with AI: ${e.message}`};
    }
  }
);


/**
 * An exported function that invokes the `generateSignalFlow`.
 * This is the primary entry point for using this flow from the application.
 * @param input The financial pair (price is ignored, will be fetched by the tool).
 * @returns A promise that resolves to a `GeneratedSignal`.
 */
export async function generateSignal(input: GenerateSignalInput): Promise<GeneratedSignal> {
  return generateSignalFlow(input);
}

// Define the prompt for the AI model, which will now use the getMarketData tool
const prompt = ai.definePrompt({
  name: 'generateSignalPrompt',
  input: {schema: GenerateSignalInputSchema},
  output: {schema: GenerateSignalOutputSchema},
  tools: [getMarketData],
  prompt: `
    You are a professional financial analyst specializing in short-term trading strategies.
    Your task is to generate a trading signal for the given financial pair.

    First, use the getMarketData tool to get the current live price for the provided financial pair: {{{pair}}}.

    If the tool returns an error, you must stop and inform the user that you cannot provide a signal without reliable price data.

    If you receive a valid price, generate a complete trading signal based on that price.
    The strategy should be viable within a 30-minute timeframe.
    This means the take-profit and stop-loss levels should be reasonably close to the entry price.

    - The 'entry' price should be very close to the provided live price from the tool.
    - The 'rationale' should be a concise explanation of the trading idea (2-3 sentences max).
    - Ensure the generated prices are realistic and correctly formatted for the given financial pair, considering its asset class (e.g., Forex, Crypto, Metals).

    Generate the signal now.
  `,
});

// Define the main Genkit flow
const generateSignalFlow = ai.defineFlow(
  {
    name: 'generateSignalFlow',
    inputSchema: GenerateSignalInputSchema,
    outputSchema: GenerateSignalOutputSchema,
  },
  async (input) => {
    // Note: The input 'price' is ignored, as the prompt now uses the tool to fetch it.
    const {output} = await prompt(input);
    return output!;
  }
);
