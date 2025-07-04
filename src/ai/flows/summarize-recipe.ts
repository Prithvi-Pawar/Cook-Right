// This is an autogenerated file from Firebase Studio.
'use server';

/**
 * @fileOverview Summarizes a recipe given its details.
 *
 * - summarizeRecipe - A function that summarizes the recipe.
 * - SummarizeRecipeInput - The input type for the summarizeRecipe function.
 * - SummarizeRecipeOutput - The return type for the summarizeRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeRecipeInputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe.'),
  ingredients: z.string().describe('A list of the ingredients for the recipe.'),
  instructions: z.string().describe('The instructions for the recipe.'),
});
export type SummarizeRecipeInput = z.infer<typeof SummarizeRecipeInputSchema>;

const SummarizeRecipeOutputSchema = z.object({
  summary: z.string().describe('A short summary of the recipe.'),
});
export type SummarizeRecipeOutput = z.infer<typeof SummarizeRecipeOutputSchema>;

export async function summarizeRecipe(input: SummarizeRecipeInput): Promise<SummarizeRecipeOutput> {
  return summarizeRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeRecipePrompt',
  input: {schema: SummarizeRecipeInputSchema},
  output: {schema: SummarizeRecipeOutputSchema},
  prompt: `Summarize the following recipe in a single sentence.\n\nRecipe Name: {{{recipeName}}}\nIngredients: {{{ingredients}}}\nInstructions: {{{instructions}}}`,
});

const summarizeRecipeFlow = ai.defineFlow(
  {
    name: 'summarizeRecipeFlow',
    inputSchema: SummarizeRecipeInputSchema,
    outputSchema: SummarizeRecipeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
