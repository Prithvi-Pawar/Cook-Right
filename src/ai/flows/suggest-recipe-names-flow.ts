
'use server';
/**
 * @fileOverview Suggests multiple recipe names based on available ingredients.
 *
 * - suggestRecipeNames - A function that suggests recipe names.
 * - SuggestRecipeNamesInput - The input type for the suggestRecipeNames function.
 * - SuggestRecipeNamesOutput - The return type for the suggestRecipeNames function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRecipeNamesInputSchema = z.object({
  ingredients: z.string().describe('A comma-separated list of ingredients available.'),
});
export type SuggestRecipeNamesInput = z.infer<typeof SuggestRecipeNamesInputSchema>;

const SuggestRecipeNamesOutputSchema = z.object({
  recipeNames: z.array(z.string()).describe('A list of 3-5 suggested recipe names based on the ingredients.'),
});
export type SuggestRecipeNamesOutput = z.infer<typeof SuggestRecipeNamesOutputSchema>;

export async function suggestRecipeNames(input: SuggestRecipeNamesInput): Promise<SuggestRecipeNamesOutput> {
  return suggestRecipeNamesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipeNamesPrompt',
  input: {schema: SuggestRecipeNamesInputSchema},
  output: {schema: SuggestRecipeNamesOutputSchema},
  prompt: `You are a creative chef. Based on the following ingredients, suggest 3 to 5 diverse recipe names.
Only provide the recipe names themselves, formatted as a list.

Ingredients: {{{ingredients}}}
`,
  config: { // Added safety settings as good practice
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  }
});

const suggestRecipeNamesFlow = ai.defineFlow(
  {
    name: 'suggestRecipeNamesFlow',
    inputSchema: SuggestRecipeNamesInputSchema,
    outputSchema: SuggestRecipeNamesOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
