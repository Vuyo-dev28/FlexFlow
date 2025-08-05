'use server';
/**
 * @fileOverview An AI flow for analyzing a trading chart image and generating a signal.
 *
 * This file defines a flow that takes an image of a financial chart and returns a
 * trading signal (BUY/SELL) along with a rationale for the decision.
 */

import {ai} from '@/ai/genkit';
import { AnalyzeChartInput, AnalyzeChartOutput, AnalyzeChartInputSchema, AnalyzeChartOutputSchema } from '@/types/signal';

const prompt = ai.definePrompt({
  name: 'analyzeChartPrompt',
  input: {schema: AnalyzeChartInputSchema},
  output: {schema: AnalyzeChartOutputSchema},
  prompt: `
    You are an expert financial analyst who specializes in high-frequency scalping strategies with a proven 70%+ win rate.
    Your task is to analyze the provided financial chart image to identify a high-probability scalping opportunity. The chart is likely a 1-minute, 3-minute, or 5-minute timeframe.

    1.  Analyze the provided chart for short-term patterns, momentum indicators, and micro-trends suitable for scalping.
    2.  Based on your analysis, decide if there is a high-probability BUY or SELL signal.
    3.  If, and only if, a high-probability setup exists, provide a BUY or SELL signal. Otherwise, you MUST return HOLD. Your reputation is built on being selective and avoiding low-probability trades.
    4.  If the signal is BUY or SELL, determine a realistic entry price, a tight take-profit price for a quick gain, and a tight stop-loss price to manage risk. These values must be numbers.
    5.  Provide a concise, expert-level rationale for your decision in 2-4 sentences, focusing on the specific short-term indicators that signal this high-probability scalping opportunity.

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
