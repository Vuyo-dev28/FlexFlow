'use server';
/**
 * @fileOverview A trading signal generation AI agent.
 *
 * - generateSignals - A function that handles the signal generation process for multiple pairs.
 * - GenerateSignalsInput - The input type for the generateSignals function.
 * - GenerateSignalsOutput - The return type for the generateSignals function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { FinancialPair, GeneratedSignal } from '@/types/signal';

const GenerateSignalsInputSchema = z.object({
  pairs: z.array(z.string()).describe('The financial pairs to generate signals for (e.g., ["BTC/USD", "ETH/USD"]).'),
});
export type GenerateSignalsInput = z.infer<typeof GenerateSignalsInputSchema>;

const SingleSignalSchema = z.object({
    pair: z.string().describe('The financial pair for which the signal is generated (e.g., BTC/USD).'),
    type: z.enum(['BUY', 'SELL']).describe("The type of signal, either 'BUY' or 'SELL'."),
    entry: z.number().describe('The suggested entry price for the trade.'),
    takeProfit: z.number().describe('The suggested take profit price for the trade.'),
    stopLoss: z.number().describe('The suggested stop loss price for the trade.'),
    rationale: z.string().describe('A detailed rationale for the trading signal, including technical and/or fundamental analysis (2-3 sentences).'),
});

const GenerateSignalsOutputSchema = z.object({
    signals: z.array(SingleSignalSchema),
});

export type GenerateSignalsOutput = z.infer<typeof GenerateSignalsOutputSchema>;

export async function generateSignals(input: { pairs: FinancialPair[] }): Promise<GeneratedSignal[]> {
    const result = await generateSignalFlow(input);
    
    // Create a map for quick lookup of generated signals by pair
    const signalMap = new Map(result.signals.map(s => [s.pair, s]));

    // Map input pairs to the generated signals, ensuring order and completeness
    const orderedSignals = input.pairs.map(pair => {
        const signal = signalMap.get(pair);
        if (signal) {
            return {
                type: signal.type,
                entry: signal.entry,
                takeProfit: signal.takeProfit,
                stopLoss: signal.stopLoss,
                rationale: signal.rationale,
            };
        }
        // This case should ideally not be reached if the model works as expected.
        // You might want to handle this with a default/error state.
        console.warn(`No signal generated for ${pair}`);
        // Return a default "error" signal or skip it
        return {
            type: 'SELL',
            entry: 0,
            takeProfit: 0,
            stopLoss: 0,
            rationale: `Could not generate a signal for ${pair}.`,
        } as GeneratedSignal;
    });

    return orderedSignals;
}


const prompt = ai.definePrompt({
  name: 'generateSignalPrompt',
  input: { schema: GenerateSignalsInputSchema },
  output: { schema: GenerateSignalsOutputSchema },
  prompt: `You are an expert financial analyst with 20 years of experience in technical and fundamental analysis. Your task is to generate a trading signal for each of the given financial pairs: {{#each pairs}}"{{{this}}}"{{#unless @last}}, {{/unless}}{{/each}}.

  For each pair, analyze the current market conditions, including chart patterns, indicators (like RSI, MACD, Moving Averages), support and resistance levels, and any relevant news or economic data.
  
  Based on your analysis, provide a clear 'BUY' or 'SELL' signal for each pair.
  
  Determine precise and realistic price points for the following for each pair, ensuring they are formatted as numbers with appropriate decimal places for the given pair:
  - Entry Price: The price at which to enter the trade.
  - Take Profit: A target price to close the trade in profit.
  - Stop Loss: A price to close the trade to limit potential losses.
  
  Finally, write a concise (2-3 sentences) but compelling rationale for each signal, explaining the key factors behind your decision. The rationale should be clear and easy for an intermediate trader to understand.
  
  Do not include any introductory or concluding remarks. Only provide the JSON object containing the array of signal information. The output must contain a signal for every requested pair.`,
});

const generateSignalFlow = ai.defineFlow(
  {
    name: 'generateSignalFlow',
    inputSchema: GenerateSignalsInputSchema,
    outputSchema: GenerateSignalsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
