'use server';
/**
 * @fileOverview An AI flow to extract handwritten text from an image.
 *
 * - extractTextFromImage - A function that performs OCR on an image.
 * - ExtractTextFromImageInput - The input type for the extractTextFromImage function.
 * - ExtractTextFromImageOutput - The return type for the extractTextFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTextFromImageInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "An image of a handwritten note, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractTextFromImageInput = z.infer<typeof ExtractTextFromImageInputSchema>;

const ExtractTextFromImageOutputSchema = z.object({
  extractedText: z.string().describe('The text extracted from the image.'),
});
export type ExtractTextFromImageOutput = z.infer<typeof ExtractTextFromImageOutputSchema>;

export async function extractTextFromImage(input: ExtractTextFromImageInput): Promise<ExtractTextFromImageOutput> {
  return extractTextFromImageFlow(input);
}

const extractTextFromImageFlow = ai.defineFlow(
  {
    name: 'extractTextFromImageFlow',
    inputSchema: ExtractTextFromImageInputSchema,
    outputSchema: ExtractTextFromImageOutputSchema,
  },
  async ({ imageDataUri }) => {
    
    const { output } = await ai.generate({
      prompt: `You are an Optical Character Recognition (OCR) specialist. Your task is to accurately extract any handwritten text from the provided image. Focus only on the text content. If no text is found, return an empty string.

Image of note: {{media url=imageDataUri}}`,
      model: ai.model, // Gemini 2.5 Flash is multimodal
      output: {
          schema: ExtractTextFromImageOutputSchema,
      }
    });

    if (!output) {
      throw new Error("AI failed to extract text from the image.");
    }
    return output;
  }
);
