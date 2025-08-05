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
  GenerateSignalOutput,
  GenerateSignalInputSchema,
  GenerateSignalOutputSchema,
} from '@/types/signal';


// Define the prompt for the AI model
const prompt = ai.definePrompt({
  name: 'generateSignalPrompt',
  input: {schema: GenerateSignalInputSchema},
  output: {schema: GenerateSignalOutputSchema},
  prompt: `
    You are a professional financial analyst and expert trader with a documented 70%+ win rate.
    Your task is to generate a high-probability trading signal for the given financial pair: {{{pair}}}.

    The user's preferred trading style is {{{tradingStyle}}}. You must tailor your trading strategy, signal, and price targets accordingly.
    - For 'Scalping', use very tight take-profit and stop-loss levels, focusing on 1m-5m chart patterns.
    - For 'Day Trading', use wider targets and focus on 15m-1h chart patterns and intraday trends.
    - For 'Swing Trading', use even wider targets, focusing on 4h-1D chart patterns, support/resistance, and multi-day trends.
    - For 'Position Trading', use very wide targets, focusing on 1D-1W chart patterns and macroeconomic factors.

    Only generate a signal if you identify a setup with a very high probability of success. If no such setup exists, you must wait. Your reputation depends on your selectivity.

    First, generate a realistic live price for the provided financial pair.

    Then, generate a complete trading signal based on that price and the chosen trading style.
    - The 'entry' price must be extremely close to the live price you generated.
    - The 'rationale' should be a concise, expert explanation of the high-probability setup (2-3 sentences max).
    - Ensure the generated prices are realistic and correctly formatted. For example, Forex pairs like EUR/USD should have 4-5 decimal places. Crypto pairs like BTC/USD will have fewer.
    - The difference between entry, take-profit, and stop-loss should reflect the strategy for the chosen trading style.

    Generate the high-probability signal now.
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
    const { output } = await prompt(input, {model: 'googleai/gemini-2.5-flash'});
    return output!;
  }
);

/**
 * An exported function that invokes the `generateSignalFlow`.
 * This is the primary entry point for using this flow from the application.
 * @param input The financial pair.
 * @returns A promise that resolves to a `GeneratedSignal`.
 */
export async function generateSignal(input: GenerateSignalInput): Promise<GenerateSignalOutput> {
  return generateSignalFlow(input);
}
