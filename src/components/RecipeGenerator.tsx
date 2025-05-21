
'use client';

import { useState } from 'react';
import { generateRecipe, type GenerateRecipeOutput, type GenerateRecipeInput } from '@/ai/flows/generate-recipe';
import { generateRecipeFromIngredients, type GenerateRecipeFromIngredientsOutput, type GenerateRecipeFromIngredientsInput } from '@/ai/flows/generate-recipe-from-ingredients';
import { generateRecipeImage, type GenerateRecipeImageInput, type GenerateRecipeImageOutput } from '@/ai/flows/generate-recipe-image';
import { RecipeDisplay } from './RecipeDisplay';
import { RecipeFormTabs, type RecipeFormValues } from './RecipeFormTabs';
import { LoadingSpinner } from './LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Image as ImageIcon } from 'lucide-react'; // Added ImageIcon
import { useToast } from "@/hooks/use-toast";

type BaseRecipeData = GenerateRecipeOutput | GenerateRecipeFromIngredientsOutput;
export type RecipeDataWithImage = BaseRecipeData & { imageDataUri?: string };

export function RecipeGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [recipeData, setRecipeData] = useState<RecipeDataWithImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (values: RecipeFormValues, mode: 'description' | 'ingredients') => {
    setIsLoading(true);
    setIsLoadingImage(false); // Reset image loading state
    setRecipeData(null);
    setError(null);

    try {
      let result: BaseRecipeData;
      let additionalContextForImage: string | undefined;

      if (mode === 'description') {
        const descValues = values as { _formType: 'description', recipeDescription?: string; dietaryPreferences?: string };
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
        additionalContextForImage = descValues.recipeDescription.substring(0, 100); // Use part of description
      } else { // mode === 'ingredients'
        const ingValues = values as { _formType: 'ingredients', ingredients?: string };
        if (!ingValues.ingredients) {
          setError("Please provide a list of ingredients.");
          setIsLoading(false);
          return;
        }
        const input: GenerateRecipeFromIngredientsInput = {
          ingredients: ingValues.ingredients,
          // No dietaryPreferences here
        };
        result = await generateRecipeFromIngredients(input);
        additionalContextForImage = `made with ${ingValues.ingredients.split(',').slice(0,3).join(', ')}`; // Use some ingredients
      }
      
      setRecipeData(result); // Set initial recipe data (without image)
      toast({
        title: "Recipe Generated!",
        description: `Your recipe for "${result.recipeName}" is ready. Generating image...`,
        className: "bg-green-100 border-green-400 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300"
      });

      // Now generate image
      setIsLoadingImage(true);
      try {
        const imageInput: GenerateRecipeImageInput = { 
          recipeName: result.recipeName,
          additionalContext: additionalContextForImage
        };
        const imageResult = await generateRecipeImage(imageInput);
        setRecipeData(prevData => prevData ? { ...prevData, imageDataUri: imageResult.imageDataUri } : null);
        toast({
          title: "Image Generated!",
          description: `Image for "${result.recipeName}" is ready.`,
          className: "bg-blue-100 border-blue-400 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300"
        });
      } catch (imgErr) {
        console.error("Image generation failed:", imgErr);
        const imageErrorMessage = imgErr instanceof Error ? imgErr.message : "Could not generate an image for the recipe.";
        toast({
          variant: "destructive",
          title: "Image Generation Failed",
          description: imageErrorMessage,
        });
        // Keep the text recipe data even if image fails
        setRecipeData(prevData => prevData ? { ...prevData, imageDataUri: undefined } : null);
      } finally {
        setIsLoadingImage(false);
      }

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
      <RecipeFormTabs onSubmit={handleSubmit} isLoading={isLoading || isLoadingImage} />
      
      {(isLoading || isLoadingImage) && (
        <div className="mt-10">
          <LoadingSpinner />
           {isLoadingImage && !isLoading && <p className="text-center text-foreground/80 mt-2">Generating recipe image...</p>}
        </div>
      )}

      {error && !isLoading && !isLoadingImage && (
        <Alert variant="destructive" className="mt-10 max-w-xl mx-auto">
          <Terminal className="h-5 w-5" />
          <AlertTitle>Oops! Something went wrong.</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {recipeData && !isLoading && ( // Display recipe even if image is still loading
        <div className="mt-10">
          <RecipeDisplay recipe={recipeData} isLoadingImage={isLoadingImage} />
        </div>
      )}
    </div>
  );
}
