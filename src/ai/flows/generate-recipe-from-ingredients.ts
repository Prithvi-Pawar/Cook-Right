
'use server';
/**
 * @fileOverview A recipe generation AI agent based on available ingredients and a chosen recipe name.
 *
 * - generateNamedRecipeFromIngredients - A function that handles the recipe generation process.
 * - GenerateNamedRecipeFromIngredientsInput - The input type for the generateNamedRecipeFromIngredients function.
 * - GenerateRecipeFromIngredientsOutput - The return type for the generateNamedRecipeFromIngredients function.
 */

import {ai}from '@/ai/genkit';
import {z}from 'genkit';

const GenerateNamedRecipeFromIngredientsInputSchema = z.object({
  ingredients: z
    .string()
    .describe('A comma-separated list of ingredients available.'),
  selectedRecipeName: z.string().describe('The specific recipe name chosen by the user to generate.'),
});
export type GenerateNamedRecipeFromIngredientsInput = z.infer<
  typeof GenerateNamedRecipeFromIngredientsInputSchema
>;

const GenerateRecipeFromIngredientsOutputSchema = z.object({
  recipeName: z.string().describe('The name of the generated recipe. This should match the selectedRecipeName input.'),
  ingredients: z.array(z.string()).describe('The ingredients required for the recipe.'),
  instructions: z.string().describe('Step-by-step instructions for preparing the recipe.'),
});
export type GenerateRecipeFromIngredientsOutput = z.infer<
  typeof GenerateRecipeFromIngredientsOutputSchema
>;

export async function generateNamedRecipeFromIngredients(
  input: GenerateNamedRecipeFromIngredientsInput
): Promise<GenerateRecipeFromIngredientsOutput> {
  return generateNamedRecipeFromIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNamedRecipeFromIngredientsPrompt',
  input: {schema: GenerateNamedRecipeFromIngredientsInputSchema},
  output: {schema: GenerateRecipeFromIngredientsOutputSchema},
  prompt: `You are a professional chef. Generate the full recipe (ingredients list and instructions) for the dish named "{{selectedRecipeName}}", using primarily the available ingredients listed below.
Ensure the generated recipeName in the output matches the "{{selectedRecipeName}}" input.

Available Ingredients: {{{ingredients}}}
Recipe to Generate: {{{selectedRecipeName}}}

Output Format Guidance:
Recipe Name: Make sure this matches exactly: "{{selectedRecipeName}}"
Ingredients: Provide a list of ingredients specifically needed for THIS recipe.
Instructions: Provide clear, step-by-step instructions.
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

const generateNamedRecipeFromIngredientsFlow = ai.defineFlow(
  {
    name: 'generateNamedRecipeFromIngredientsFlow',
    inputSchema: GenerateNamedRecipeFromIngredientsInputSchema,
    outputSchema: GenerateRecipeFromIngredientsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure the output recipeName matches the input selectedRecipeName, crucial for consistency
    if (output && output.recipeName !== input.selectedRecipeName) {
      output.recipeName = input.selectedRecipeName;
    }
    return output!;
  }
);
