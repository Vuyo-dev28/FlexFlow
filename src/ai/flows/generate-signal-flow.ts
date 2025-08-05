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

// Define the prompt for the AI model, which will now use the getMarketData tool
const prompt = ai.definePrompt({
  name: 'generateSignalPrompt',
  input: {schema: GenerateSignalInputSchema},
  output: {schema: GenerateSignalOutputSchema},
  prompt: `
    You are a professional financial analyst specializing in very short-term (scalping) trading strategies.
    Your task is to generate a high-probability trading signal for the given financial pair: {{{pair}}}.

    First, generate a realistic live price for the provided financial pair.

    Then, generate a complete trading signal based on that price.
    The strategy must be viable within a 30-minute timeframe. This means the take-profit and stop-loss levels must be very tight and reasonably close to the entry price.

    - The 'entry' price must be extremely close to the live price you generated.
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
    const { output } = await prompt(input, {model: 'googleai/gemini-1.5-flash-preview'});
    return output!;
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
