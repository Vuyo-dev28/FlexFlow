'use server';
/**
 * @fileOverview An AI flow for analyzing a trading chart image and generating a signal.
 *
 * This file defines a flow that takes an image of a financial chart and returns a
 * trading signal (BUY/SELL) along with a rationale for the decision.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Define the schema for the flow's input
export const AnalyzeChartInputSchema = z.object({
  chartImageUri: z
    .string()
    .describe(
      "A data URI of the chart image to be analyzed. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeChartInput = z.infer<typeof AnalyzeChartInputSchema>;

// Define the schema for the flow's output
export const AnalyzeChartOutputSchema = z.object({
  type: z.enum(['BUY', 'SELL', 'HOLD']).describe("The trading signal: BUY, SELL, or HOLD if uncertain."),
  rationale: z
    .string()
    .describe('A detailed rationale for the generated trading signal, based on the chart analysis.'),
});
export type AnalyzeChartOutput = z.infer<typeof AnalyzeChartOutputSchema>;

const prompt = ai.definePrompt({
  name: 'analyzeChartPrompt',
  input: {schema: AnalyzeChartInputSchema},
  output: {schema: AnalyzeChartOutputSchema},
  prompt: `
    You are an expert financial analyst who specializes in technical analysis from chart images.
    Your task is to analyze the provided financial chart image and generate a clear trading signal (BUY or SELL).

    Analyze the provided chart for patterns, indicators, and trends.
    Based on your analysis, decide whether the signal is a BUY or a SELL. If the signals are mixed or unclear, you can return HOLD.
    Provide a concise, expert-level rationale for your decision in 2-4 sentences. Mention the key patterns or indicators that led to your conclusion (e.g., "head and shoulders pattern," "bullish divergence on the RSI," "breaking below the 50-day moving average").

    Chart Image: {{media url=chartImageUri}}

    Generate the signal and rationale now.
  `,
  config: {
    model: 'googleai/gemini-1.5-flash-preview',
  }
});

const analyzeChartFlow = ai.defineFlow(
  {
    name: 'analyzeChartFlow',
    inputSchema: AnalyzeChartInputSchema,
    outputSchema: AnalyzeChartOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
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