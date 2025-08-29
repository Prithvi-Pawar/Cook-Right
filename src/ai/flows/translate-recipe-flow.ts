
'use server';
/**
 * @fileOverview Translates a recipe to a specified language.
 *
 * - translateRecipe - A function that handles the recipe translation.
 * - TranslateRecipeInput - The input type for the translateRecipe function.
 * - TranslateRecipeOutput - The return type for the translateRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateRecipeInputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe to translate.'),
  ingredients: z.array(z.string()).describe('The list of ingredients to translate.'),
  instructions: z.array(z.string()).describe('The list of instructions to translate.'),
  targetLanguage: z.string().describe('The language to translate the recipe into (e.g., "Spanish", "French").'),
});
export type TranslateRecipeInput = z.infer<typeof TranslateRecipeInputSchema>;

const TranslateRecipeOutputSchema = z.object({
  recipeName: z.string().describe('The translated name of the recipe.'),
  ingredients: z.array(z.string()).describe('The translated list of ingredients.'),
  instructions: z.array(z.string()).describe('The translated list of instructions.'),
});
export type TranslateRecipeOutput = z.infer<typeof TranslateRecipeOutputSchema>;

export async function translateRecipe(input: TranslateRecipeInput): Promise<TranslateRecipeOutput> {
  return translateRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateRecipePrompt',
  input: {schema: TranslateRecipeInputSchema},
  output: {schema: TranslateRecipeOutputSchema},
  prompt: `You are a professional translator specializing in culinary content.
Translate the following recipe into {{targetLanguage}}.
Maintain the original structure and formatting (arrays for ingredients and instructions).

Original Recipe Name:
{{recipeName}}

Original Ingredients:
{{#each ingredients}}
- {{this}}
{{/each}}

Original Instructions:
{{#each instructions}}
- {{this}}
{{/each}}

Translate every part of the recipe (name, ingredients, and instructions) accurately into {{targetLanguage}}.
`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
});

const translateRecipeFlow = ai.defineFlow(
  {
    name: 'translateRecipeFlow',
    inputSchema: TranslateRecipeInputSchema,
    outputSchema: TranslateRecipeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
