'use client';

import { useState } from 'react';
import Link from 'next/link';
import { generateNamedRecipeFromDescription, type GenerateRecipeOutput as GenerateRecipeFromDescriptionOutput, type GenerateNamedRecipeFromDescriptionInput } from '@/ai/flows/generate-named-recipe-from-description-flow';
import { suggestRecipeNamesFromDescription, type SuggestRecipeNamesFromDescriptionInput, type SuggestRecipeNamesOutput as SuggestRecipeNamesFromDescriptionOutput } from '@/ai/flows/suggest-recipe-names-from-description-flow';
import { generateNamedRecipeFromIngredients, type GenerateRecipeFromIngredientsOutput, type GenerateNamedRecipeFromIngredientsInput } from '@/ai/flows/generate-recipe-from-ingredients';
import { suggestRecipeNames, type SuggestRecipeNamesInput, type SuggestRecipeNamesOutput as SuggestRecipeNamesFromIngredientsOutput } from '@/ai/flows/suggest-recipe-names-flow';
import { getYoutubeVideoForRecipe } from '@/ai/flows/get-youtube-video-for-recipe';
import { translateRecipe, type TranslateRecipeInput, type TranslateRecipeOutput } from '@/ai/flows/translate-recipe-flow';
import { RecipeDisplay } from './RecipeDisplay';
import { RecipeFormTabs, type RecipeFormValues } from './RecipeFormTabs';
import { LoadingSpinner } from './LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal, ArrowLeft, Lightbulb, ChefHat, Youtube } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

type BaseRecipeData = GenerateRecipeFromDescriptionOutput | GenerateRecipeFromIngredientsOutput;
export type RecipeDataWithImage = BaseRecipeData & { imageDataUri?: string; videoId?: string };

export function RecipeGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [recipeData, setRecipeData] = useState<RecipeDataWithImage | null>(null);
  const [originalRecipe, setOriginalRecipe] = useState<RecipeDataWithImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [currentFormMode, setCurrentFormMode] = useState<'description' | 'ingredients' | null>(null);
  
  // State for "description" flow
  const [storedDescription, setStoredDescription] = useState<string | null>(null);
  const [storedDietaryPrefs, setStoredDietaryPrefs] = useState<string | null>(null);
  const [suggestedRecipeNamesForDescription, setSuggestedRecipeNamesForDescription] = useState<string[] | null>(null);
  const [selectedRecipeNameToGenerateFromDescription, setSelectedRecipeNameToGenerateFromDescription] = useState<string | null>(null);

  // State for "ingredients" flow
  const [storedIngredients, setStoredIngredients] = useState<string | null>(null);
  const [suggestedRecipeNamesForIngredients, setSuggestedRecipeNamesForIngredients] = useState<string[] | null>(null);
  const [selectedRecipeNameToGenerateFromIngredients, setSelectedRecipeNameToGenerateFromIngredients] = useState<string | null>(null);


  const handleTranslateRecipe = async (language: string) => {
    if (!recipeData) return;

    setIsTranslating(true);
    setError(null);
    try {
      // If we haven't translated before, store the current recipe as the original
      if (!originalRecipe) {
        setOriginalRecipe(recipeData);
      }

      const recipeToTranslate = originalRecipe || recipeData;

      const instructionsArray = typeof recipeToTranslate.instructions === 'string'
        ? recipeToTranslate.instructions.split(/\\n|\n/).map(line => line.trim()).filter(line => line)
        : recipeToTranslate.instructions.map(line => line.trim()).filter(line => line);
      
      const translationInput: TranslateRecipeInput = {
        recipeName: recipeToTranslate.recipeName,
        ingredients: recipeToTranslate.ingredients,
        instructions: instructionsArray,
        targetLanguage: language,
      };

      const translatedResult = await translateRecipe(translationInput);

      setRecipeData(prevData => ({
        ...(prevData as RecipeDataWithImage),
        recipeName: translatedResult.recipeName,
        ingredients: translatedResult.ingredients,
        instructions: translatedResult.instructions,
      }));

      toast({
        title: "Recipe Translated!",
        description: `The recipe has been translated to ${language}.`,
      });

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred during translation.";
      setError(`Translation failed: ${errorMessage}`);
      toast({ variant: "destructive", title: "Translation Failed", description: errorMessage });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleResetTranslation = () => {
    if (originalRecipe) {
      setRecipeData(originalRecipe);
      setOriginalRecipe(null);
      toast({
        title: "Translation Reset",
        description: "The recipe has been reverted to its original language.",
      });
    }
  };

  const resetAllSuggestionsAndSelections = () => {
    setSuggestedRecipeNamesForDescription(null);
    setSelectedRecipeNameToGenerateFromDescription(null);
    setStoredDescription(null);
    setStoredDietaryPrefs(null);
    
    setSuggestedRecipeNamesForIngredients(null);
    setSelectedRecipeNameToGenerateFromIngredients(null);
    setStoredIngredients(null);

    setOriginalRecipe(null);
  }

  const handleSubmit = async (values: RecipeFormValues, mode: 'description' | 'ingredients') => {
    setIsLoading(true);
    setIsLoadingImage(false);
    setRecipeData(null);
    setError(null);
    resetAllSuggestionsAndSelections();
    setCurrentFormMode(mode);

    try {
      if (mode === 'description') {
        const descValues = values as { _formType: 'description', recipeDescription?: string; dietaryPreferences?: string };
        if (!descValues.recipeDescription) throw new Error("Please provide a recipe description.");
        
        setStoredDescription(descValues.recipeDescription);
        setStoredDietaryPrefs(descValues.dietaryPreferences || null);

        const suggestionInput: SuggestRecipeNamesFromDescriptionInput = {
          recipeDescription: descValues.recipeDescription,
          ...(descValues.dietaryPreferences && { dietaryPreferences: descValues.dietaryPreferences }),
        };
        const suggestionsResult = await suggestRecipeNamesFromDescription(suggestionInput);

        if (suggestionsResult.recipeNames && suggestionsResult.recipeNames.length > 0) {
          setSuggestedRecipeNamesForDescription(suggestionsResult.recipeNames);
          toast({
            title: "Suggestions Ready!",
            description: "Pick a recipe name to see the full details.",
          });
        } else {
          throw new Error("Could not generate any recipe suggestions from the description provided.");
        }

      } else { // mode === 'ingredients'
        const ingValues = values as { _formType: 'ingredients', ingredients?: string };
        if (!ingValues.ingredients) throw new Error("Please provide a list of ingredients.");
        
        setStoredIngredients(ingValues.ingredients);
        const suggestionsInput: SuggestRecipeNamesInput = { ingredients: ingValues.ingredients };
        const suggestionsResult = await suggestRecipeNames(suggestionsInput);

        if (suggestionsResult.recipeNames && suggestionsResult.recipeNames.length > 0) {
          setSuggestedRecipeNamesForIngredients(suggestionsResult.recipeNames);
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
      setIsLoading(false);
    }
  };

  const handleSelectRecipeName = async (recipeName: string, sourceMode: 'description' | 'ingredients') => {
    setIsLoading(true);
    setIsLoadingImage(false);
    setRecipeData(null);
    setError(null);

    try {
      let result: BaseRecipeData;

      if (sourceMode === 'description') {
        if (!storedDescription) throw new Error("Original description not found.");
        setSelectedRecipeNameToGenerateFromDescription(recipeName);
        const recipeInput: GenerateNamedRecipeFromDescriptionInput = {
          originalRecipeDescription: storedDescription,
          selectedRecipeName: recipeName,
          ...(storedDietaryPrefs && { dietaryPreferences: storedDietaryPrefs }),
        };
        result = await generateNamedRecipeFromDescription(recipeInput);
      } else { // sourceMode === 'ingredients'
        if (!storedIngredients) throw new Error("Ingredients not found.");
        setSelectedRecipeNameToGenerateFromIngredients(recipeName);
        const recipeInput: GenerateNamedRecipeFromIngredientsInput = {
          ingredients: storedIngredients,
          selectedRecipeName: recipeName,
        };
        result = await generateNamedRecipeFromIngredients(recipeInput);
      }
      
      setRecipeData(result);
      toast({
        title: "Recipe Generated!",
        description: `Your recipe for "${result.recipeName}" is ready.`,
        className: "bg-green-100 border-green-400 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300"
      });

      // Asynchronously fetch the YouTube video without blocking the UI
      getYoutubeVideoForRecipe({ recipeName: result.recipeName })
        .then(videoResult => {
          if (videoResult.videoId) {
            setRecipeData(prevData => prevData ? { ...prevData, videoId: videoResult.videoId } : null);
          }
        })
        .catch(videoError => console.error("Failed to fetch YouTube video:", videoError));

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
    setSelectedRecipeNameToGenerateFromDescription(null);
    setSelectedRecipeNameToGenerateFromIngredients(null);
    setError(null);
    setOriginalRecipe(null);
    // Keep stored inputs and suggested names
  };
  
  const handleStartOver = () => {
    setRecipeData(null);
    setError(null);
    setCurrentFormMode(null);
    resetAllSuggestionsAndSelections();
  }

  const showForm = !isLoading && !recipeData && !suggestedRecipeNamesForDescription && !suggestedRecipeNamesForIngredients;
  
  const showDescriptionSuggestions = currentFormMode === 'description' && suggestedRecipeNamesForDescription && !recipeData && !isLoading;
  const showIngredientsSuggestions = currentFormMode === 'ingredients' && suggestedRecipeNamesForIngredients && !recipeData && !isLoading;
  
  const showRecipeDisplay = recipeData && !isLoading;

  const SuggestionsDisplay = ({ names, context, onSelect, titleIcon, description }: { names: string[] | null, context: string | null, onSelect: (name: string) => void, titleIcon?: React.ReactNode, description?: string }) => (
    <Card className="mt-10 max-w-xl mx-auto text-center shadow-lg border-primary/20">
        <CardHeader>
          <div className="w-full flex justify-center mb-4">
            {titleIcon || <Lightbulb className="h-12 w-12 text-primary" />}
          </div>
          <CardTitle className="text-2xl font-semibold text-foreground">{description}</CardTitle>
          <CardDescription>Based on: "{context}"</CardDescription>
          <p className="text-sm text-muted-foreground pt-2">Here are a few recipe names our AI chef came up with. Select one to see the full recipe!</p>
        </CardHeader>
        <CardContent className="space-y-3 p-6 pt-2">
            {names?.map(name => (
            <Button 
                key={name} 
                onClick={() => onSelect(name)} 
                variant="outline" 
                className="w-full justify-center text-center py-6 text-base shadow-sm rounded-lg bg-background text-foreground border-border hover:bg-muted/50"
            >
                {name}
            </Button>
            ))}
            <Button 
              onClick={handleStartOver} 
              variant="ghost" 
              className="mt-8 text-primary hover:text-primary/80 mx-auto block flex items-center"
            >
              <ArrowLeft className="mr-2 h-5 w-5" /> Start Over With New Input
            </Button>
        </CardContent>
    </Card>
  );


  return (
    <div className="container mx-auto py-10 px-4">
      {showForm && (
         <RecipeFormTabs onSubmit={handleSubmit} isLoading={isLoading || isLoadingImage} />
      )}
      
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
          <Button onClick={handleStartOver} variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-5 w-5" /> Try Again
          </Button>
        </Alert>
      )}

      {showDescriptionSuggestions && (
        <SuggestionsDisplay 
          names={suggestedRecipeNamesForDescription}
          context={storedDescription ? `${storedDescription}${storedDietaryPrefs ? ` (${storedDietaryPrefs})` : ''}` : null}
          onSelect={(name) => handleSelectRecipeName(name, 'description')}
          titleIcon={<ChefHat className="h-12 w-12 text-primary" />}
          description="Recipe Ideas from Your Description"
        />
      )}

      {showIngredientsSuggestions && (
         <SuggestionsDisplay 
          names={suggestedRecipeNamesForIngredients}
          context={storedIngredients}
          onSelect={(name) => handleSelectRecipeName(name, 'ingredients')}
          titleIcon={<Lightbulb className="h-12 w-12 text-primary" />}
          description="Recipe Ideas from Your Ingredients"
        />
      )}

      {showRecipeDisplay && (
        <div className="mt-10">
          <div className="mb-6 flex flex-col md:flex-row w-full items-center justify-between gap-4">
            <Button onClick={handleBackToSuggestions} variant="outline" className="bg-card hover:bg-accent w-full md:w-auto">
              <ArrowLeft className="mr-2 h-5 w-5" /> Back to Suggestions
            </Button>
            {recipeData?.recipeName && (
              <Link
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(recipeData.recipeName + ' recipe')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${buttonVariants({ variant: 'destructive' })} w-full md:w-auto`}
              >
                <Youtube className="mr-2 h-5 w-5" />
                Search on YouTube
              </Link>
            )}
          </div>

          <RecipeDisplay 
            recipe={recipeData} 
            isLoadingImage={isLoadingImage}
            originalRecipe={originalRecipe}
            onTranslate={handleTranslateRecipe}
            isTranslating={isTranslating}
            onResetTranslation={handleResetTranslation}
          />
           <Button 
            onClick={handleStartOver} 
            variant="ghost" 
            className="mt-8 text-primary hover:text-primary/80 mx-auto block flex items-center"
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> Start Over With New Input
          </Button>
        </div>
      )}
    </div>
  );
}
