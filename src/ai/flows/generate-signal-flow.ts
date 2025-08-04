'use server';
/**
 * @fileOverview A trading signal generation AI agent.
 *
 * - generateSignal - A function that handles the signal generation process.
 * - GenerateSignalInput - The input type for the generateSignal function.
 * - GenerateSignalOutput - The return type for the generateSignal function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { FinancialPair, GeneratedSignal } from '@/types/signal';

const GenerateSignalInputSchema = z.object({
  pair: z.string().describe('The financial pair to generate a signal for (e.g., BTC/USD).'),
});
export type GenerateSignalInput = z.infer<typeof GenerateSignalInputSchema>;


const GenerateSignalOutputSchema = z.object({
    type: z.enum(['BUY', 'SELL']).describe("The type of signal, either 'BUY' or 'SELL'."),
    entry: z.number().describe('The suggested entry price for the trade.'),
    takeProfit: z.number().describe('The suggested take profit price for the trade.'),
    stopLoss: z.number().describe('The suggested stop loss price for the trade.'),
    rationale: z.string().describe('A detailed rationale for the trading signal, including technical and/or fundamental analysis (2-3 sentences).'),
});

export type GenerateSignalOutput = z.infer<typeof GenerateSignalOutputSchema>;

export async function generateSignal(input: { pair: FinancialPair }): Promise<GeneratedSignal> {
    const signal = await generateSignalFlow(input);
    // Ensure the output matches the GeneratedSignal type.
    return {
        type: signal.type,
        entry: signal.entry,
        takeProfit: signal.takeProfit,
        stopLoss: signal.stopLoss,
        rationale: signal.rationale,
    };
}


const prompt = ai.definePrompt({
  name: 'generateSignalPrompt',
  input: { schema: GenerateSignalInputSchema },
  output: { schema: GenerateSignalOutputSchema },
  prompt: `You are an expert financial analyst with 20 years of experience in technical and fundamental analysis. Your task is to generate a trading signal for the given financial pair: {{{pair}}}.

  Analyze the current market conditions, including chart patterns, indicators (like RSI, MACD, Moving Averages), support and resistance levels, and any relevant news or economic data.
  
  Based on your analysis, provide a clear 'BUY' or 'SELL' signal.
  
  Determine precise and realistic price points for the following, ensuring they are formatted as numbers with appropriate decimal places for the given pair:
  - Entry Price: The price at which to enter the trade.
  - Take Profit: A target price to close the trade in profit.
  - Stop Loss: A price to close the trade to limit potential losses.
  
  Finally, write a concise (2-3 sentences) but compelling rationale explaining the key factors behind your decision. The rationale should be clear and easy for an intermediate trader to understand.
  
  Do not include any introductory or concluding remarks. Only provide the JSON object with the signal information.`,
});

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
