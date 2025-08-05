'use server';
/**
 * @fileOverview An AI flow for analyzing a trading chart image and generating a signal.
 *
 * This file defines a flow that takes an image of a financial chart and returns a
 * trading signal (BUY/SELL) along with a rationale for the decision.
 */

import {ai} from '@/ai/genkit';
import { AnalyzeChartInput, AnalyzeChartOutput } from '@/types/signal';
import { AnalyzeChartInputSchema, AnalyzeChartOutputSchema } from '@/types/signal';

const prompt = ai.definePrompt({
  name: 'analyzeChartPrompt',
  input: {schema: AnalyzeChartInputSchema},
  output: {schema: AnalyzeChartOutputSchema},
  prompt: `
    You are an expert financial analyst who specializes in technical analysis from chart images.
    Your task is to analyze the provided financial chart image and generate a clear trading signal.

    1.  Analyze the provided chart for patterns, indicators, and trends.
    2.  Based on your analysis, decide whether the signal is a BUY or a SELL. If the signals are mixed or unclear, you can return HOLD.
    3.  If the signal is BUY or SELL, determine a realistic entry price, take-profit price, and stop-loss price based on the chart. These values should be numbers.
    4.  Provide a concise, expert-level rationale for your decision in 2-4 sentences. Mention the key patterns or indicators that led to your conclusion (e.g., "head and shoulders pattern," "bullish divergence on the RSI," "breaking below the 50-day moving average").

    Chart Image: {{media url=chartImageUri}}

    Generate the signal, rationale, and price points now.
  `
});

const analyzeChartFlow = ai.defineFlow(
  {
    name: 'analyzeChartFlow',
    inputSchema: AnalyzeChartInputSchema,
    outputSchema: AnalyzeChartOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input, {model: 'googleai/gemini-2.5-pro'});
    return output!;
  }
);


/**
 * An exported function that invokes the `analyzeChartFlow`.
 * This is the primary entry point for using this flow from the application.
 * @param input The chart image data URI.
 * @returns A promise that resolves to an `AnalyzeChartOutput`.
 */
export async function analyzeChart(input: AnalyzeChartInput): Promise<AnalyzeChartOutput> {
  return analyzeChartFlow(input);
}
