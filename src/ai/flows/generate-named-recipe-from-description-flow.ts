
'use server';
/**
 * @fileOverview Generates a full recipe based on an original description, dietary preferences, and a selected recipe name.
 *
 * - generateNamedRecipeFromDescription - A function that generates the recipe.
 * - GenerateNamedRecipeFromDescriptionInput - The input type for the generateNamedRecipeFromDescription function.
 * - GenerateRecipeOutput - The return type for the generateNamedRecipeFromDescription function.
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';

const GenerateNamedRecipeFromDescriptionInputSchema = z.object({
  originalRecipeDescription: z.string().describe('The original text description of the desired recipe.'),
  selectedRecipeName: z.string().describe('The specific recipe name chosen by the user.'),
  dietaryPreferences: z.string().optional().describe('Optional dietary preferences or restrictions to apply.'),
});
export type GenerateNamedRecipeFromDescriptionInput = z.infer<typeof GenerateNamedRecipeFromDescriptionInputSchema>;

const GenerateRecipeOutputSchema = z.object({
  recipeName: z.string().describe('The name of the generated recipe. This should match the selectedRecipeName input.'),
  ingredients: z.array(z.string()).describe('The list of ingredients required for the recipe.'),
  instructions: z.array(z.string()).describe('The step-by-step instructions for the recipe.'),
});
export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

export async function generateNamedRecipeFromDescription(input: GenerateNamedRecipeFromDescriptionInput): Promise<GenerateRecipeOutput> {
  return generateNamedRecipeFromDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNamedRecipeFromDescriptionPrompt',
  input: {schema: GenerateNamedRecipeFromDescriptionInputSchema},
  output: {schema: GenerateRecipeOutputSchema},
  prompt: `You are a world-class chef. Generate the full recipe (ingredients list and step-by-step instructions) for the dish named "{{selectedRecipeName}}".
This recipe should be based on the original user request: "{{originalRecipeDescription}}".
{{#if dietaryPreferences}}
Ensure it adheres to the following dietary preferences: "{{dietaryPreferences}}".
{{/if}}
Ensure the generated recipeName in the output matches the "{{selectedRecipeName}}" input.

Original Request: {{{originalRecipeDescription}}}
Recipe to Generate: {{{selectedRecipeName}}}
{{#if dietaryPreferences}}
Dietary Preferences: {{{dietaryPreferences}}}
{{/if}}

Output Format Guidance:
Recipe Name: Make sure this matches exactly: "{{selectedRecipeName}}"
Ingredients: Provide a list of ingredients specifically needed for THIS recipe.
Instructions: Provide clear, step-by-step instructions as an array of strings.
  `,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
    ],
  },
});

const generateNamedRecipeFromDescriptionFlow = ai.defineFlow(
  {
    name: 'generateNamedRecipeFromDescriptionFlow',
    inputSchema: GenerateNamedRecipeFromDescriptionInputSchema,
    outputSchema: GenerateRecipeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (output && output.recipeName !== input.selectedRecipeName) {
      output.recipeName = input.selectedRecipeName;
    }
    return output!;
  }
);

