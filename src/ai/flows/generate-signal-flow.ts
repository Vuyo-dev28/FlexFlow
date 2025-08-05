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

    The user's preferred trading time frame is {{{timeFrame}}}. You must tailor your trading strategy, signal, and price targets accordingly.
    - For short time frames (1m, 5m, 15m), use a scalping strategy with very tight take-profit and stop-loss levels.
    - For medium time frames (30m, 1h, 4h), use a day-trading or swing-trading strategy with wider targets.
    - For long time frames (1D), use a position-trading strategy with much wider targets.

    Only generate a signal if you identify a setup with a very high probability of success. If no such setup exists, you must wait. Your reputation depends on your selectivity.

    First, generate a realistic live price for the provided financial pair.

    Then, generate a complete trading signal based on that price and the chosen time frame strategy.
    - The 'entry' price must be extremely close to the live price you generated.
    - The 'rationale' should be a concise, expert explanation of the high-probability setup (2-3 sentences max).
    - Ensure the generated prices are realistic and correctly formatted. For example, Forex pairs like EUR/USD should have 4-5 decimal places. Crypto pairs like BTC/USD will have fewer.
    - The difference between entry, take-profit, and stop-loss should reflect the strategy for the chosen time frame.

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
