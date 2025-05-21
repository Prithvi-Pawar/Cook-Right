
'use client';

import { useState } from 'react';
import { generateRecipe, type GenerateRecipeOutput, type GenerateRecipeInput } from '@/ai/flows/generate-recipe';
import { generateNamedRecipeFromIngredients, type GenerateRecipeFromIngredientsOutput, type GenerateNamedRecipeFromIngredientsInput } from '@/ai/flows/generate-recipe-from-ingredients'; // Updated import
import { suggestRecipeNames, type SuggestRecipeNamesInput, type SuggestRecipeNamesOutput } from '@/ai/flows/suggest-recipe-names-flow'; // New import
import { generateRecipeImage, type GenerateRecipeImageInput } from '@/ai/flows/generate-recipe-image';
import { RecipeDisplay } from './RecipeDisplay';
import { RecipeFormTabs, type RecipeFormValues } from './RecipeFormTabs';
import { LoadingSpinner } from './LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Terminal, ArrowLeft, Lightbulb } from 'lucide-react'; // Added ArrowLeft, Lightbulb
import { useToast } from "@/hooks/use-toast";

type BaseRecipeData = GenerateRecipeOutput | GenerateRecipeFromIngredientsOutput;
export type RecipeDataWithImage = BaseRecipeData & { imageDataUri?: string };

export function RecipeGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [recipeData, setRecipeData] = useState<RecipeDataWithImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [currentFormMode, setCurrentFormMode] = useState<'description' | 'ingredients' | null>(null);
  const [storedIngredients, setStoredIngredients] = useState<string | null>(null);
  const [suggestedRecipeNames, setSuggestedRecipeNames] = useState<string[] | null>(null);
  const [selectedRecipeNameToGenerate, setSelectedRecipeNameToGenerate] = useState<string | null>(null);


  const handleImageGeneration = async (recipeName: string, additionalContext?: string) => {
    setIsLoadingImage(true);
    try {
      const imageInput: GenerateRecipeImageInput = { 
        recipeName,
        additionalContext
      };
      const imageResult = await generateRecipeImage(imageInput);
      setRecipeData(prevData => prevData ? { ...prevData, imageDataUri: imageResult.imageDataUri } : null);
      toast({
        title: "Image Generated!",
        description: `Image for "${recipeName}" is ready.`,
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
      setRecipeData(prevData => prevData ? { ...prevData, imageDataUri: undefined } : null); // Keep text recipe
    } finally {
      setIsLoadingImage(false);
    }
  };

  const handleSubmit = async (values: RecipeFormValues, mode: 'description' | 'ingredients') => {
    setIsLoading(true);
    setIsLoadingImage(false);
    setRecipeData(null);
    setError(null);
    setSuggestedRecipeNames(null);
    setSelectedRecipeNameToGenerate(null);
    setCurrentFormMode(mode);
    setStoredIngredients(null);

    try {
      if (mode === 'description') {
        const descValues = values as { _formType: 'description', recipeDescription?: string; dietaryPreferences?: string };
        if (!descValues.recipeDescription) throw new Error("Please provide a recipe description.");
        
        const recipeInput: GenerateRecipeInput = {
          recipeDescription: descValues.dietaryPreferences 
            ? `${descValues.recipeDescription} (Dietary preferences: ${descValues.dietaryPreferences})`
            : descValues.recipeDescription,
        };
        const result = await generateRecipe(recipeInput);
        setRecipeData(result);
        toast({
          title: "Recipe Generated!",
          description: `Your recipe for "${result.recipeName}" is ready. Generating image...`,
          className: "bg-green-100 border-green-400 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300"
        });
        await handleImageGeneration(result.recipeName, descValues.recipeDescription.substring(0,100));

      } else { // mode === 'ingredients'
        const ingValues = values as { _formType: 'ingredients', ingredients?: string };
        if (!ingValues.ingredients) throw new Error("Please provide a list of ingredients.");
        
        setStoredIngredients(ingValues.ingredients); // Store ingredients for later
        const suggestionsResult = await suggestRecipeNames({ ingredients: ingValues.ingredients });
        if (suggestionsResult.recipeNames && suggestionsResult.recipeNames.length > 0) {
          setSuggestedRecipeNames(suggestionsResult.recipeNames);
          toast({
            title: "Suggestions Ready!",
            description: "Pick a recipe name to see the full details.",
          });
        } else {
          throw new Error("Could not generate any recipe suggestions from the ingredients provided.");
        }
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
      setError(`Operation failed: ${errorMessage}`);
      toast({ variant: "destructive", title: "Operation Failed", description: errorMessage });
    } finally {
      setIsLoading(false); // Primary loading stops, image loading might continue or start
    }
  };

  const handleSelectRecipeName = async (recipeName: string) => {
    if (!storedIngredients) {
      setError("Ingredients not found. Please submit ingredients again.");
      toast({ variant: "destructive", title: "Error", description: "Ingredients not found." });
      return;
    }
    setIsLoading(true);
    setIsLoadingImage(false);
    setRecipeData(null);
    setError(null);
    setSelectedRecipeNameToGenerate(recipeName);

    try {
      const recipeInput: GenerateNamedRecipeFromIngredientsInput = {
        ingredients: storedIngredients,
        selectedRecipeName: recipeName,
      };
      const result = await generateNamedRecipeFromIngredients(recipeInput);
      setRecipeData(result);
      toast({
        title: "Recipe Generated!",
        description: `Your recipe for "${result.recipeName}" is ready. Generating image...`,
        className: "bg-green-100 border-green-400 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300"
      });
      await handleImageGeneration(result.recipeName, `made with ${storedIngredients.split(',').slice(0,3).join(', ')}`);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred while generating the specific recipe.";
      setError(`Failed to generate recipe: ${errorMessage}`);
      toast({ variant: "destructive", title: "Error Generating Recipe", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSuggestions = () => {
    setRecipeData(null);
    setSelectedRecipeNameToGenerate(null);
    setError(null);
    // Keep suggestedRecipeNames and storedIngredients
  };

  const showForm = !isLoading && !recipeData && !suggestedRecipeNames;
  const showSuggestions = currentFormMode === 'ingredients' && suggestedRecipeNames && !recipeData && !isLoading;
  const showRecipeDisplay = recipeData && !isLoading; // Image might still be loading

  return (
    <div className="container mx-auto py-10 px-4">
      {showForm && (
         <RecipeFormTabs onSubmit={handleSubmit} isLoading={isLoading || isLoadingImage} />
      )}
      
      {(isLoading || isLoadingImage) && !showSuggestions && ( // Don't show main spinner if showing suggestions list
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

      {showSuggestions && (
        <div className="mt-10 max-w-xl mx-auto text-center">
          <Lightbulb className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2 text-foreground">Recipe Ideas</h3>
          {storedIngredients && <p className="mb-6 text-muted-foreground">Based on: "{storedIngredients}"</p>}
          <div className="space-y-3">
            {suggestedRecipeNames?.map(name => (
              <Button 
                key={name} 
                onClick={() => handleSelectRecipeName(name)} 
                variant="outline" 
                className="w-full justify-start py-6 text-lg shadow-sm hover:shadow-md transition-shadow"
              >
                {name}
              </Button>
            ))}
          </div>
           <Button 
            onClick={() => {
              setSuggestedRecipeNames(null);
              setStoredIngredients(null);
              setCurrentFormMode(null);
              setError(null);
            }} 
            variant="ghost" 
            className="mt-8 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> Start Over
          </Button>
        </div>
      )}

      {showRecipeDisplay && (
        <div className="mt-10">
          {currentFormMode === 'ingredients' && selectedRecipeNameToGenerate && (
            <Button onClick={handleBackToSuggestions} variant="outline" className="mb-6 bg-card hover:bg-accent">
              <ArrowLeft className="mr-2 h-5 w-5" /> Back to Suggestions
            </Button>
          )}
          <RecipeDisplay recipe={recipeData} isLoadingImage={isLoadingImage} />
        </div>
      )}
    </div>
  );
}
