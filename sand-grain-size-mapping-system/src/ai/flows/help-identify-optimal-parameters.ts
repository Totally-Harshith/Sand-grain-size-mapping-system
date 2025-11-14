'use server';

/**
 * @fileOverview This file defines a Genkit flow to help users identify optimal parameters
 * (coin currency, coin size, location on beach) for sand grain analysis.
 *
 * - helpIdentifyOptimalParameters - A function that provides guidance on selecting optimal parameters.
 * - OptimalParametersInput - The input type for the helpIdentifyOptimalParameters function.
 * - OptimalParametersOutput - The return type for the helpIdentifyOptimalParameters function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimalParametersInputSchema = z.object({
  location: z
    .string()
    .describe('The GPS coordinates of the beach location.'),
  sampleImageDataBase64: z
    .string()
    .describe(
      "A sand sample image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    )
    .optional(),
});
export type OptimalParametersInput = z.infer<typeof OptimalParametersInputSchema>;

const OptimalParametersOutputSchema = z.object({
  coinCurrencyRecommendation: z
    .string()
    .describe('Recommended coin currency for analysis based on location.'),
  coinSizeRecommendation: z
    .string()
    .describe('Recommended coin size for accurate grain size comparison.'),
  locationOnBeachRecommendation: z
    .string()
    .describe(
      'Guidance on selecting an appropriate location on the beach for sampling.'
    ),
});
export type OptimalParametersOutput = z.infer<typeof OptimalParametersOutputSchema>;

export async function helpIdentifyOptimalParameters(
  input: OptimalParametersInput
): Promise<OptimalParametersOutput> {
  return helpIdentifyOptimalParametersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimalParametersPrompt',
  input: {schema: OptimalParametersInputSchema},
  output: {schema: OptimalParametersOutputSchema},
  prompt: `Based on the user's location ({{
    location
  }}) and optionally, the sand sample image ({{#if sampleImageDataBase64}}available{{else}}not available{{/if}}),
  provide recommendations for the following parameters to improve the accuracy of sand grain analysis:

  - Coin Currency: Recommend a coin currency that is commonly available in the user's location.
  - Coin Size: Suggest an appropriate coin size to use as a reference for grain size comparison in the sample image.
  - Location on Beach: Provide guidance on selecting an ideal location on the beach for collecting sand samples (e.g., avoid areas with excessive debris or moisture).

  Ensure that the recommendations are clear, concise, and actionable for the user.`, // Ensure recommendations are actionable.
});

const helpIdentifyOptimalParametersFlow = ai.defineFlow(
  {
    name: 'helpIdentifyOptimalParametersFlow',
    inputSchema: OptimalParametersInputSchema,
    outputSchema: OptimalParametersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

