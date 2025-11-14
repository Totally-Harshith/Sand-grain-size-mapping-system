'use server';

/**
 * @fileOverview Summarizes the grain analysis results, coin details, and location.
 *
 * - summarizeAnalysisResults - A function that summarizes the analysis results.
 * - SummarizeAnalysisResultsInput - The input type for the summarizeAnalysisResults function.
 * - SummarizeAnalysisResultsOutput - The return type for the summarizeAnalysisResults function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeAnalysisResultsInputSchema = z.object({
  grainSize: z.string().describe('The average grain size of the sand sample.'),
  density: z.string().describe('The density of the sand sample.'),
  coarseness: z.string().describe('The coarseness of the sand sample.'),
  gpsLocation: z.string().describe('The GPS location where the sample was taken.'),
  coinCurrency: z.string().describe('The currency of the coin used for scale.'),
  coinInPicture: z.string().describe('Details about the coin in the picture (e.g., size, denomination).'),
  locationOnBeach: z.string().describe('The specific location on the beach where the sample was taken.'),
});
export type SummarizeAnalysisResultsInput = z.infer<typeof SummarizeAnalysisResultsInputSchema>;

const SummarizeAnalysisResultsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the sand analysis results, coin details, and location.'),
});
export type SummarizeAnalysisResultsOutput = z.infer<typeof SummarizeAnalysisResultsOutputSchema>;

export async function summarizeAnalysisResults(input: SummarizeAnalysisResultsInput): Promise<SummarizeAnalysisResultsOutput> {
  return summarizeAnalysisResultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAnalysisResultsPrompt',
  input: {schema: SummarizeAnalysisResultsInputSchema},
  output: {schema: SummarizeAnalysisResultsOutputSchema},
  prompt: `You are an expert sand analysis summarizer. Given the following data about a sand sample, create a concise summary of the key findings.

Grain Size: {{{grainSize}}}
Density: {{{density}}}
Coarseness: {{{coarseness}}}
GPS Location: {{{gpsLocation}}}
Coin Currency: {{{coinCurrency}}}
Coin Details: {{{coinInPicture}}}
Location on Beach: {{{locationOnBeach}}}

Summary: `,
});

const summarizeAnalysisResultsFlow = ai.defineFlow(
  {
    name: 'summarizeAnalysisResultsFlow',
    inputSchema: SummarizeAnalysisResultsInputSchema,
    outputSchema: SummarizeAnalysisResultsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
