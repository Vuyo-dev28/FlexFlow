'use server';
/**
 * @fileOverview A Genkit flow for generating trading signals.
 *
 * This file defines a flow that takes a financial pair and generates a trading signal
 * based on an AI-generated market price. It uses a tool to fetch prices.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateSignalInput,
  GenerateSignalInputSchema,
  GenerateSignalOutputSchema,
  GeneratedSignal,
} from '@/types/signal';
import {z} from 'zod';

// Schema for the AI-powered price generation
const PriceGenerationSchema = z.object({
  price: z.number().describe('The current, realistic market price for the asset.'),
});

/**
 * A tool that gets the current market price for a given financial pair using an AI model.
 */
const getMarketData = ai.defineTool(
  {
    name: 'getMarketData',
    description: 'Gets the current market price for a financial pair using an AI model.',
    inputSchema: z.object({
      pair: z.string().describe('The financial pair to get the price for (e.g., "EUR/USD", "BTC/USD").'),
    }),
    outputSchema: z.object({
      price: z.number().optional(),
      error: z.string().optional(),
    }),
  },
  async ({pair}) => {
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
 * @param input The financial pair.
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
    You are a professional financial analyst specializing in very short-term (scalping) trading strategies.
    Your task is to generate a high-probability trading signal for the given financial pair.

    First, use the getMarketData tool to get the current live price for the provided financial pair: {{{pair}}}.

    If the tool returns an error, you must stop and inform the user that you cannot provide a signal without reliable price data.

    If you receive a valid price, generate a complete trading signal based on that price.
    The strategy must be viable within a 30-minute timeframe. This means the take-profit and stop-loss levels must be very tight and reasonably close to the entry price.

    - The 'entry' price must be extremely close to the live price provided by the tool.
    - The 'rationale' should be a concise explanation of the trading idea (2-3 sentences max).
    - Ensure the generated prices are realistic and correctly formatted. For example, Forex pairs like EUR/USD should have 4-5 decimal places. Crypto pairs like BTC/USD will have fewer.
    - The difference between entry, take-profit, and stop-loss should be small and reflect a quick scalping opportunity.

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
    const { output } = await prompt(input);
    return output!;
  }
);
