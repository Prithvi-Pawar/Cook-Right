
'use server';
/**
 * @fileOverview A unified AI flow to generate a complete recipe from either a description or a list of ingredients.
 *
 * - generateRecipe - A function that handles the entire recipe generation process.
 * - GenerateRecipeInput - The input type for the generateRecipe function.
 * - GenerateRecipeOutput - The return type for the generateRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateRecipeInputSchema = z.object({
  // An input can be a description or ingredients, but not both.
  // This is a common pattern for a unified API endpoint.
  description: z.string().optional().describe('A text description of the desired recipe.'),
  ingredients: z.string().optional().describe('A comma-separated list of ingredients.'),
  dietaryPreferences: z.string().optional().describe('Optional dietary preferences (e.g., vegan, gluten-free).'),
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;

export const GenerateRecipeOutputSchema = z.object({
  recipeName: z.string().describe('A creative and fitting name for the generated recipe.'),
  ingredients: z.array(z.string()).describe('The list of all ingredients required for the recipe.'),
  instructions: z.array(z.string()).describe('The step-by-step instructions to prepare the recipe.'),
});
export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;


export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  if (!input.description && !input.ingredients) {
    throw new Error('Please provide either a recipe description or a list of ingredients.');
  }
  return generateRecipeFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generateRecipePrompt',
  input: {schema: GenerateRecipeInputSchema},
  output: {schema: GenerateRecipeOutputSchema},
  prompt: `You are an expert chef who creates delicious and easy-to-follow recipes.
A user has provided the following information. Your task is to generate a complete recipe, including a creative name for the dish.

{{#if description}}
The user described their desired dish as: "{{description}}"
{{/if}}

{{#if ingredients}}
The user has the following ingredients available: "{{ingredients}}"
{{/if}}

{{#if dietaryPreferences}}
Please ensure the recipe adheres to these dietary preferences: "{{dietaryPreferences}}"
{{/if}}

Based on the information provided, create a full recipe. The recipe must include:
1.  A creative and appealing 'recipeName'.
2.  A complete list of 'ingredients' as an array of strings.
3.  A series of clear, step-by-step 'instructions' as an array of strings.
`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  },
});


const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GenerateRecipeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
