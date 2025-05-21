
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles } from 'lucide-react';

const descriptionFormSchema = z.object({
  recipeDescription: z.string().min(10, { message: 'Please describe the recipe in at least 10 characters.' }),
  dietaryPreferences: z.string().optional(),
});

const ingredientsFormSchema = z.object({
  ingredients: z.string().min(3, { message: 'Please list at least one ingredient.' }),
  // dietaryPreferences field removed as per request
});

export type RecipeFormValues = 
  | (z.infer<typeof descriptionFormSchema> & { _formType: 'description' })
  | (z.infer<typeof ingredientsFormSchema> & { _formType: 'ingredients' });

interface RecipeFormTabsProps {
  onSubmit: (values: RecipeFormValues, mode: 'description' | 'ingredients') => void;
  isLoading: boolean;
}

export function RecipeFormTabs({ onSubmit, isLoading }: RecipeFormTabsProps) {
  const descriptionForm = useForm<z.infer<typeof descriptionFormSchema>>({
    resolver: zodResolver(descriptionFormSchema),
    defaultValues: {
      recipeDescription: '',
      dietaryPreferences: '',
    },
  });

  const ingredientsForm = useForm<z.infer<typeof ingredientsFormSchema>>({
    resolver: zodResolver(ingredientsFormSchema),
    defaultValues: {
      ingredients: '',
    },
  });

  const handleDescriptionSubmit = (values: z.infer<typeof descriptionFormSchema>) => {
    onSubmit({...values, _formType: 'description'}, 'description');
  };

  const handleIngredientsSubmit = (values: z.infer<typeof ingredientsFormSchema>) => {
    onSubmit({...values, _formType: 'ingredients'}, 'ingredients');
  };

  return (
    <Tabs defaultValue="description" className="w-full max-w-xl mx-auto">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="description">Describe a Recipe</TabsTrigger>
        <TabsTrigger value="ingredients">Use My Ingredients</TabsTrigger>
      </TabsList>
      <TabsContent value="description">
        <Form {...descriptionForm}>
          <form onSubmit={descriptionForm.handleSubmit(handleDescriptionSubmit)} className="space-y-6 p-6 bg-card text-card-foreground rounded-lg shadow-lg">
            <FormField
              control={descriptionForm.control}
              name="recipeDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">What kind of recipe are you looking for?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., A hearty vegan pasta dish with mushrooms and spinach, perfect for a weeknight."
                      className="min-h-[100px] resize-none bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={descriptionForm.control}
              name="dietaryPreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Any dietary preferences or restrictions?</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., vegetarian, gluten-free, dairy-free" {...field} className="bg-background" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              <Sparkles className="mr-2 h-5 w-5" />
              {isLoading ? 'Generating...' : 'Generate Recipe'}
            </Button>
          </form>
        </Form>
      </TabsContent>
      <TabsContent value="ingredients">
        <Form {...ingredientsForm}>
          <form onSubmit={ingredientsForm.handleSubmit(handleIngredientsSubmit)} className="space-y-6 p-6 bg-card text-card-foreground rounded-lg shadow-lg">
            <FormField
              control={ingredientsForm.control}
              name="ingredients"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">What ingredients do you have on hand?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., chicken breast, broccoli, soy sauce, rice, garlic"
                      className="min-h-[100px] resize-none bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* dietaryPreferences field removed from this form */}
            <Button type="submit" disabled={isLoading} className="w-full">
              <Sparkles className="mr-2 h-5 w-5" />
              {isLoading ? 'Generating...' : 'Generate Recipe'}
            </Button>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
}
