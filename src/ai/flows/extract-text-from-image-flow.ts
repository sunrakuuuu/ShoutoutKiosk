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
      prompt: `Perform a literal OCR on this image: {{media url=imageDataUri}}`,
      system: `You are a highly specialized Optical Character Recognition (OCR) engine. Your one and only task is to analyze an image and transcribe the text within it, verbatim.

- You MUST return ONLY the text you see in the image.
- Do NOT correct spelling.
- Do NOT correct grammar.
- Do NOT add any extra words, explanations, introductory phrases, or pleasantries.
- If the image contains no text, you MUST return an empty string for the 'extractedText' field.
- Your output must be a direct, literal, and unenhanced transcription of the image's text content.`,
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
