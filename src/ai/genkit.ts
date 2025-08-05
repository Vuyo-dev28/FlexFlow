/**
 * @fileoverview This file initializes the Genkit AI plugin with the Google AI provider.
 * It configures a global `ai` object that can be used throughout the application
 * to interact with generative models.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1',
    }),
  ],
  logLevel: 'debug',
  enableTracing: true,
});
