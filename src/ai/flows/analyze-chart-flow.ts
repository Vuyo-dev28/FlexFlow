'use server';
/**
 * @fileOverview An AI flow for analyzing a trading chart image and generating a signal.
 *
 * This file defines a flow that takes an image of a financial chart and returns a
 * trading signal (BUY/SELL) along with a rationale for the decision.
 */

import { ai } from '@/ai/genkit';
import { AnalyzeChartInput, AnalyzeChartOutput, AnalyzeChartInputSchema, AnalyzeChartOutputSchema } from '@/types/signal';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Define the prompt with schema validation
const prompt = ai.definePrompt({
  name: 'analyzeChartPrompt',
  input: { schema: AnalyzeChartInputSchema },
  output: {
    schema: z.object({
      type: AnalyzeChartOutputSchema.shape.type,
      rationale: AnalyzeChartOutputSchema.shape.rationale,
      entry: AnalyzeChartOutputSchema.shape.entry,
      takeProfit: AnalyzeChartOutputSchema.shape.takeProfit,
      stopLoss: AnalyzeChartOutputSchema.shape.stopLoss,
    }),
  },
  prompt: `
    You are an expert financial analyst who specializes in multi-timeframe trading strategies with a proven 70%+ win rate.
    Your task is to analyze the provided financial chart image to identify a high-probability trading opportunity.

    The user has specified that this chart is for the {{{timeFrame}}} time frame. You must tailor your analysis and strategy to this time frame.
    - For short time frames (1m, 3m, 5m, 15m), focus on scalping opportunities, micro-trends, and momentum indicators.
    - For medium time frames (1h, 4h), focus on swing trading setups, support/resistance levels, and pattern recognition.
    - For long time frames (1D), focus on position trading, major trend analysis, and macroeconomic factors.

    1. Analyze the provided chart based on the specified {{{timeFrame}}} for relevant patterns, indicators, and trends.
    2. Based on your analysis, decide if there is a high-probability BUY or SELL signal.
    3. If, and only if, a high-probability setup exists, provide a BUY or SELL signal. Otherwise, you MUST return HOLD. Your reputation is built on being selective and avoiding low-probability trades.
    4. If the signal is BUY or SELL, determine a realistic entry price, a take-profit price, and a stop-loss price, all of which must be appropriate for the strategy corresponding to the {{{timeFrame}}}. These values must be numbers.
    5. Provide a concise, expert-level rationale for your decision in 2-4 sentences, focusing on the specific indicators that signal this high-probability opportunity for the given time frame.

    Chart Image: {{media url=chartImageUri}}

    Generate the signal, rationale, and price points now.
  `,
});

// Define the AI flow using the correct model ID
const analyzeChartFlow = ai.defineFlow(
  {
    name: 'analyzeChartFlow',
    inputSchema: AnalyzeChartInputSchema,
    outputSchema: AnalyzeChartOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input, {
      model: 'models/gemini-pro-vision',
    });

    return {
      ...output!,
      id: uuidv4(),
      chartImageUri: input.chartImageUri,
    };
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
