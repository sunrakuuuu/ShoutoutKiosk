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
      prompt: `{{media url=imageDataUri}}`,
      system: `You are an expert Optical Character Recognition (OCR) system. Your sole purpose is to look at an image and transcribe the text within it.
- Transcribe the text exactly as you see it. Do not correct any spelling or grammar.
- Do not add any commentary, interpretation, or extra text that is not in the image.
- If there is no text in the image, return an empty string for the 'extractedText' field.`,
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
