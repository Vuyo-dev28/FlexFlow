'use server';
/**
 * @fileOverview A Genkit flow for generating trading signals.
 *
 * This file defines a flow that takes a financial pair and its current price,
 * and generates a trading signal (BUY/SELL, entry, take profit, stop loss)
 * based on a short-term (30-minute) trading strategy.
 */

import {ai} from '@/ai/genkit';
import type { GeneratedSignal, FinancialPair } from '@/types/signal';
import {z} from 'zod';


// Define the schema for the flow's input
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


/**
 * An exported function that invokes the `generateSignalFlow`.
 * This is the primary entry point for using this flow from the application.
 * @param input The financial pair and its current price.
 * @returns A promise that resolves to a `GeneratedSignal`.
 */
export async function generateSignal(input: GenerateSignalInput): Promise<GeneratedSignal> {
  return generateSignalFlow(input);
}

// Define the prompt for the AI model
const prompt = ai.definePrompt({
  name: 'generateSignalPrompt',
  input: {schema: GenerateSignalInputSchema},
  output: {schema: GenerateSignalOutputSchema},
  prompt: `
    You are a professional financial analyst specializing in short-term trading strategies.
    Your task is to generate a trading signal for the given financial pair based on its current live price.

    The user will provide you with the financial pair and its current price.

    Financial Pair: {{{pair}}}
    Current Live Price: {{{price}}}

    Based on this information, generate a complete trading signal. The strategy should be viable within a 30-minute timeframe.
    This means the take-profit and stop-loss levels should be reasonably close to the entry price.

    - The 'entry' price should be very close to the provided live price.
    - The 'rationale' should be a concise explanation of the trading idea (2-3 sentences max).
    - Ensure the generated prices are realistic and correctly formatted for the given financial pair. For example, a Forex pair like EUR/USD should have prices like 1.0850.

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
