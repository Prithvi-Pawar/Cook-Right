'use client';

import { useState } from 'react';
import { generateRecipe, type GenerateRecipeOutput, type GenerateRecipeInput } from '@/ai/flows/generate-recipe';
import { generateRecipeFromIngredients, type GenerateRecipeFromIngredientsOutput, type GenerateRecipeFromIngredientsInput } from '@/ai/flows/generate-recipe-from-ingredients';
import { RecipeDisplay } from './RecipeDisplay';
import { RecipeFormTabs, type RecipeFormValues } from './RecipeFormTabs';
import { LoadingSpinner } from './LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

type RecipeData = GenerateRecipeOutput | GenerateRecipeFromIngredientsOutput;

export function RecipeGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [recipeData, setRecipeData] = useState<RecipeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (values: RecipeFormValues, mode: 'description' | 'ingredients') => {
    setIsLoading(true);
    setRecipeData(null);
    setError(null);

    try {
      let result: RecipeData;
      if (mode === 'description') {
        // Type guard to ensure values are for description form
        const descValues = values as { recipeDescription?: string; dietaryPreferences?: string };
        if (!descValues.recipeDescription) {
          setError("Please provide a recipe description.");
          setIsLoading(false);
          return;
        }
        const input: GenerateRecipeInput = {
          recipeDescription: descValues.dietaryPreferences 
            ? `${descValues.recipeDescription} (Dietary preferences: ${descValues.dietaryPreferences})`
            : descValues.recipeDescription,
        };
        result = await generateRecipe(input);
      } else { // mode === 'ingredients'
        // Type guard to ensure values are for ingredients form
        const ingValues = values as { ingredients?: string; dietaryPreferences?: string };
        if (!ingValues.ingredients) {
          setError("Please provide a list of ingredients.");
          setIsLoading(false);
          return;
        }
        const input: GenerateRecipeFromIngredientsInput = {
          ingredients: ingValues.ingredients,
          dietaryPreferences: ingValues.dietaryPreferences || undefined,
        };
        result = await generateRecipeFromIngredients(input);
      }
      setRecipeData(result);
      toast({
        title: "Recipe Generated!",
        description: `Your recipe for "${result.recipeName}" is ready.`,
        className: "bg-green-100 border-green-400 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300"
      });
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred while generating the recipe.";
      setError(`Failed to generate recipe: ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "Error Generating Recipe",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <RecipeFormTabs onSubmit={handleSubmit} isLoading={isLoading} />
      
      {isLoading && (
        <div className="mt-10">
          <LoadingSpinner />
        </div>
      )}

      {error && !isLoading && (
        <Alert variant="destructive" className="mt-10 max-w-xl mx-auto">
          <Terminal className="h-5 w-5" />
          <AlertTitle>Oops! Something went wrong.</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {recipeData && !isLoading && (
        <div className="mt-10">
          <RecipeDisplay recipe={recipeData} />
        </div>
      )}
    </div>
  );
}
