"use server";

import { summarizeAnalysisResults } from "@/ai/flows/summarize-analysis-results";
import { z } from "zod";

const analysisSchema = z.object({
  picture: z.any().refine((file) => file instanceof File && file.size > 0, {
    message: 'Sample image is required.',
  }),
  gpsLocation: z.string().min(1, "GPS location is required."),
  coinCurrency: z.string().min(1, "Coin currency is required."),
  coinInPicture: z.string().min(1, "Coin details are required."),
  locationOnBeach: z.string().min(1, "Location on beach is required."),
});

export type AnalysisData = {
  grainSize: string;
  density: string;
  coarseness: string;
};

export type AnalysisState = {
  summary?: string;
  analysisData?: AnalysisData;
  message?: string;
  errors?: {
    picture?: string[];
    gpsLocation?: string[];
    coinCurrency?: string[];
    coinInPicture?: string[];
    locationOnBeach?: string[];
  };
};

export async function analyzeSandSample(
  prevState: AnalysisState,
  formData: FormData
): Promise<AnalysisState> {

  const rawFormData = {
      picture: formData.get('picture'),
      gpsLocation: formData.get('gpsLocation'),
      coinCurrency: formData.get('coinCurrency'),
      coinInPicture: formData.get('coinInPicture'),
      locationOnBeach: formData.get('locationOnBeach'),
  };
  
  // This is a form reset if there is no picture data.
  const pictureFile = formData.get('picture');
  if (!pictureFile || !(pictureFile instanceof File) || pictureFile.size === 0) {
      // Clear out previous state on reset.
      return {};
  }
  
  try {
    const validatedFields = analysisSchema.safeParse(rawFormData);
    
    if (!validatedFields.success) {
        return {
            message: "Validation failed.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    // Simulate analysis delay, as if processing on a device like a Raspberry Pi
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // In a real application, you would get this data from your analysis device (e.g., Raspberry Pi).
    // For now, we'll continue to mock it.
    const mockAnalysisData: AnalysisData = {
      grainSize: `${(Math.random() * 0.5 + 0.2).toFixed(2)} mm`,
      density: `${(Math.random() * 1.5 + 1.2).toFixed(2)} g/cm³`,
      coarseness: ["Fine", "Medium", "Coarse"][Math.floor(Math.random() * 3)],
    };

    const summaryInput = {
      grainSize: mockAnalysisData.grainSize,
      density: mockAnalysisData.density,
      coarseness: mockAnalysisData.coarseness,
      gpsLocation: validatedFields.data.gpsLocation,
      coinCurrency: validatedFields.data.coinCurrency,
      coinInPicture: validatedFields.data.coinInPicture,
      locationOnBeach: validatedFields.data.locationOnBeach,
    };
    
    const result = await summarizeAnalysisResults(summaryInput);

    if (!result.summary) {
        return {
            ...prevState,
            message: "The AI model could not generate a summary for the provided analysis data.",
            analysisData: mockAnalysisData,
        }
    }

    return {
      summary: result.summary,
      analysisData: mockAnalysisData,
    };
  } catch (error) {
    console.error("Analysis Action Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { message: `An unexpected error occurred: ${errorMessage}` };
  }
}
