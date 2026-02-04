'use server';
/**
 * @fileOverview An AI flow to stylize a user's message.
 *
 * - stylizeMessage - A function that rewrites a message in a given style.
 * - StylizeMessageInput - The input type for the stylizeMessage function.
 * - StylizeMessageOutput - The return type for the stylizeMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StylizeMessageInputSchema = z.object({
  message: z.string().describe('The original message to be stylized.'),
  style: z.enum(['poetic', 'witty']).describe('The style to apply to the message.'),
});
export type StylizeMessageInput = z.infer<typeof StylizeMessageInputSchema>;

const StylizeMessageOutputSchema = z.object({
  stylizedMessage: z.string().describe('The rewritten, stylized message.'),
});
export type StylizeMessageOutput = z.infer<typeof StylizeMessageOutputSchema>;

export async function stylizeMessage(input: StylizeMessageInput): Promise<StylizeMessageOutput> {
  return stylizeMessageFlow(input);
}

const stylizeMessageFlow = ai.defineFlow(
  {
    name: 'stylizeMessageFlow',
    inputSchema: StylizeMessageInputSchema,
    outputSchema: StylizeMessageOutputSchema,
  },
  async ({ message, style }) => {
    let systemPrompt = '';
    if (style === 'poetic') {
      systemPrompt = "You are a romantic poet. Rewrite the provided message to be more poetic, flowery, and heartfelt. Keep the core meaning but express it in a beautiful, lyrical way.";
    } else { // witty
      systemPrompt = "You are a witty and charming comedian. Rewrite the provided message to be funnier, more clever, and playful. Keep the core sentiment but inject humor and wit.";
    }

    const { output } = await ai.generate({
      prompt: `Original message: "${message}"`,
      system: systemPrompt,
      model: ai.model,
      output: {
          schema: StylizeMessageOutputSchema,
      }
    });

    if (!output) {
      throw new Error("AI failed to generate a stylized message.");
    }
    return output;
  }
);
