
'use server';
/**
 * @fileOverview Generates an image for a given recipe.
 *
 * - generateRecipeImage - A function that generates an image for a recipe.
 * - GenerateRecipeImageInput - The input type for the generateRecipeImage function.
 * - GenerateRecipeImageOutput - The return type for the generateRecipeImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateRecipeImageInputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe for which to generate an image.'),
  additionalContext: z.string().optional().describe('Optional additional context, like main ingredients or style, to guide image generation.'),
});
export type GenerateRecipeImageInput = z.infer<typeof GenerateRecipeImageInputSchema>;

const GenerateRecipeImageOutputSchema = z.object({
  imageDataUri: z.string().describe("The generated image as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateRecipeImageOutput = z.infer<typeof GenerateRecipeImageOutputSchema>;

export async function generateRecipeImage(input: GenerateRecipeImageInput): Promise<GenerateRecipeImageOutput> {
  return generateRecipeImageFlow(input);
}

const generateRecipeImageFlow = ai.defineFlow(
  {
    name: 'generateRecipeImageFlow',
    inputSchema: GenerateRecipeImageInputSchema,
    outputSchema: GenerateRecipeImageOutputSchema,
  },
  async (input) => {
    const promptText = `Generate a vibrant, appetizing, high-quality photograph of a dish called "${input.recipeName}". ${input.additionalContext ? `It is known for being ${input.additionalContext}.` : ''} The image should be suitable for a recipe website. Focus on making the food look delicious and well-presented.`;
    
    const { media } = await ai.generate({
<<<<<<< HEAD
      model: 'googleai/gemini-pro-vision', // Use a model available on the free tier
=======
      model: 'googleai/imagen-4.0-fast-generate-001', // IMPORTANT: Specific model for image generation
>>>>>>> fb688ea (Can you use this API in this app - AIzaSyDmogwuAOnhmluRdokNEyG0Cy9e8qcXU)
      prompt: promptText,
      config: {
         safetySettings: [ // Added safety settings as good practice
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed or returned no media URL.');
    }

    return { imageDataUri: media.url };
  }
);
