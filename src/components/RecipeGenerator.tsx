
'use client';

import { useState } from 'react';
import { generateNamedRecipeFromDescription, type GenerateRecipeOutput as GenerateRecipeFromDescriptionOutput, type GenerateNamedRecipeFromDescriptionInput } from '@/ai/flows/generate-named-recipe-from-description-flow';
import { suggestRecipeNamesFromDescription, type SuggestRecipeNamesFromDescriptionInput, type SuggestRecipeNamesOutput as SuggestRecipeNamesFromDescriptionOutput } from '@/ai/flows/suggest-recipe-names-from-description-flow';
import { generateNamedRecipeFromIngredients, type GenerateRecipeFromIngredientsOutput, type GenerateNamedRecipeFromIngredientsInput } from '@/ai/flows/generate-recipe-from-ingredients';
import { suggestRecipeNames, type SuggestRecipeNamesInput, type SuggestRecipeNamesOutput as SuggestRecipeNamesFromIngredientsOutput } from '@/ai/flows/suggest-recipe-names-flow';
import { generateRecipeImage, type GenerateRecipeImageInput } from '@/ai/flows/generate-recipe-image';
import { RecipeDisplay } from './RecipeDisplay';
import { RecipeFormTabs, type RecipeFormValues } from './RecipeFormTabs';
import { LoadingSpinner } from './LoadingSpinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Terminal, ArrowLeft, Lightbulb, ChefHat } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

type BaseRecipeData = GenerateRecipeFromDescriptionOutput | GenerateRecipeFromIngredientsOutput;
export type RecipeDataWithImage = BaseRecipeData & { imageDataUri?: string };

export function RecipeGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [recipeData, setRecipeData] = useState<RecipeDataWithImage | null>(null);
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
      // Keep text recipe if image fails
      setRecipeData(prevData => prevData ? { ...prevData, imageDataUri: undefined } : null); 
    } finally {
      setIsLoadingImage(false);
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
      let imageContext: string | undefined;

      if (sourceMode === 'description') {
        if (!storedDescription) throw new Error("Original description not found.");
        setSelectedRecipeNameToGenerateFromDescription(recipeName);
        const recipeInput: GenerateNamedRecipeFromDescriptionInput = {
          originalRecipeDescription: storedDescription,
          selectedRecipeName: recipeName,
          ...(storedDietaryPrefs && { dietaryPreferences: storedDietaryPrefs }),
        };
        result = await generateNamedRecipeFromDescription(recipeInput);
        imageContext = `${storedDescription.substring(0, 50)}${storedDietaryPrefs ? `, ${storedDietaryPrefs}` : ''}`;
      } else { // sourceMode === 'ingredients'
        if (!storedIngredients) throw new Error("Ingredients not found.");
        setSelectedRecipeNameToGenerateFromIngredients(recipeName);
        const recipeInput: GenerateNamedRecipeFromIngredientsInput = {
          ingredients: storedIngredients,
          selectedRecipeName: recipeName,
        };
        result = await generateNamedRecipeFromIngredients(recipeInput);
        imageContext = `made with ${storedIngredients.split(',').slice(0,3).join(', ')}`;
      }
      
      setRecipeData(result);
      toast({
        title: "Recipe Generated!",
        description: `Your recipe for "${result.recipeName}" is ready. Generating image...`,
        className: "bg-green-100 border-green-400 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300"
      });
      await handleImageGeneration(result.recipeName, imageContext);

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

  const SuggestionsDisplay = ({ names, context, onSelect, titleIcon }: { names: string[] | null, context: string | null, onSelect: (name: string) => void, titleIcon?: React.ReactNode }) => (
    <div className="mt-10 max-w-xl mx-auto text-center">
      {titleIcon || <Lightbulb className="h-12 w-12 text-primary mx-auto mb-4" />}
      <h3 className="text-2xl font-semibold mb-2 text-foreground">Recipe Ideas</h3>
      {context && <p className="mb-6 text-muted-foreground">Based on: "{context}"</p>}
      <div className="space-y-3">
        {names?.map(name => (
          <Button 
            key={name} 
            onClick={() => onSelect(name)} 
            variant="outline" 
            className="w-full justify-start py-6 text-lg shadow-sm hover:shadow-md transition-shadow"
          >
            {name}
          </Button>
        ))}
      </div>
       <Button 
        onClick={handleStartOver} 
        variant="ghost" 
        className="mt-8 text-primary hover:text-primary/80"
      >
        <ArrowLeft className="mr-2 h-5 w-5" /> Start Over With New Input
      </Button>
    </div>
  );


  return (
    <div className="container mx-auto py-10 px-4">
      {showForm && (
         <RecipeFormTabs onSubmit={handleSubmit} isLoading={isLoading || isLoadingImage} />
      )}
      
      {(isLoading || isLoadingImage) && !showDescriptionSuggestions && !showIngredientsSuggestions && (
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
          titleIcon={<ChefHat className="h-12 w-12 text-primary mx-auto mb-4" />}
        />
      )}

      {showIngredientsSuggestions && (
         <SuggestionsDisplay 
          names={suggestedRecipeNamesForIngredients}
          context={storedIngredients}
          onSelect={(name) => handleSelectRecipeName(name, 'ingredients')}
        />
      )}

      {showRecipeDisplay && (
        <div className="mt-10">
          {( (currentFormMode === 'description' && selectedRecipeNameToGenerateFromDescription) || 
             (currentFormMode === 'ingredients' && selectedRecipeNameToGenerateFromIngredients) 
           ) && (
            <Button onClick={handleBackToSuggestions} variant="outline" className="mb-6 bg-card hover:bg-accent">
              <ArrowLeft className="mr-2 h-5 w-5" /> Back to Suggestions
            </Button>
          )}
          <RecipeDisplay recipe={recipeData} isLoadingImage={isLoadingImage} />
           <Button 
            onClick={handleStartOver} 
            variant="ghost" 
            className="mt-8 text-primary hover:text-primary/80 mx-auto block"
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> Start Over With New Input
          </Button>
        </div>
      )}
    </div>
  );
}
