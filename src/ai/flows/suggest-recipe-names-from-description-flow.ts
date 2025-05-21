
'use server';
/**
 * @fileOverview Suggests multiple recipe names based on a recipe description and dietary preferences.
 *
 * - suggestRecipeNamesFromDescription - A function that suggests recipe names.
 * - SuggestRecipeNamesFromDescriptionInput - The input type for the suggestRecipeNamesFromDescription function.
 * - SuggestRecipeNamesOutput - The return type for the suggestRecipeNamesFromDescription function (shared with ingredient suggestions).
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';

const SuggestRecipeNamesFromDescriptionInputSchema = z.object({
  recipeDescription: z.string().describe('A text description of the desired recipe.'),
  dietaryPreferences: z.string().optional().describe('Optional dietary preferences or restrictions.'),
});
export type SuggestRecipeNamesFromDescriptionInput = z.infer<typeof SuggestRecipeNamesFromDescriptionInputSchema>;

// Re-use SuggestRecipeNamesOutput from the ingredient-based suggestion flow
const SuggestRecipeNamesOutputSchema = z.object({
  recipeNames: z.array(z.string()).describe('A list of 3-5 suggested recipe names based on the input.'),
});
export type SuggestRecipeNamesOutput = z.infer<typeof SuggestRecipeNamesOutputSchema>;


export async function suggestRecipeNamesFromDescription(input: SuggestRecipeNamesFromDescriptionInput): Promise<SuggestRecipeNamesOutput> {
  return suggestRecipeNamesFromDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipeNamesFromDescriptionPrompt',
  input: {schema: SuggestRecipeNamesFromDescriptionInputSchema},
  output: {schema: SuggestRecipeNamesOutputSchema},
  prompt: `You are a creative culinary assistant. Based on the following recipe description and any dietary preferences, suggest 3 to 5 diverse and appealing recipe names.
Only provide the recipe names themselves, formatted as a list.

Description: {{{recipeDescription}}}
{{#if dietaryPreferences}}
Dietary Preferences: {{{dietaryPreferences}}}
{{/if}}
`,
  config: { 
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  }
});

const suggestRecipeNamesFromDescriptionFlow = ai.defineFlow(
  {
    name: 'suggestRecipeNamesFromDescriptionFlow',
    inputSchema: SuggestRecipeNamesFromDescriptionInputSchema,
    outputSchema: SuggestRecipeNamesOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
