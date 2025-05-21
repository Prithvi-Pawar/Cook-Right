import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe';
import type { GenerateRecipeFromIngredientsOutput } from '@/ai/flows/generate-recipe-from-ingredients';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ClipboardList, ListOrdered } from 'lucide-react';
import Image from 'next/image';

type RecipeData = GenerateRecipeOutput | GenerateRecipeFromIngredientsOutput;

interface RecipeDisplayProps {
  recipe: RecipeData;
}

export function RecipeDisplay({ recipe }: RecipeDisplayProps) {
  const instructionsArray = typeof recipe.instructions === 'string'
    ? recipe.instructions.split('\\n').map(line => line.trim()).filter(line => line !== '')
    : recipe.instructions.map(line => line.trim()).filter(line => line !== '');

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-3xl font-bold text-primary">{recipe.recipeName}</CardTitle>
        <CardDescription className="text-muted-foreground pt-1">
          Discover a new favorite dish!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
           <Image
            src="https://placehold.co/600x400.png"
            alt={recipe.recipeName}
            width={600}
            height={400}
            className="rounded-lg object-cover w-full"
            data-ai-hint="food recipe"
          />
        </div>
        <Accordion type="single" collapsible defaultValue="ingredients" className="w-full mb-6">
          <AccordionItem value="ingredients">
            <AccordionTrigger className="text-xl font-semibold text-foreground hover:text-primary">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-6 w-6" />
                Ingredients
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-6 space-y-1 text-foreground/90 py-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div>
          <h3 className="flex items-center gap-2 text-xl font-semibold mb-3 text-foreground">
            <ListOrdered className="h-6 w-6" />
            Instructions
          </h3>
          <ol className="list-decimal pl-6 space-y-3 text-foreground/90">
            {instructionsArray.map((instruction, index) => (
              <li key={index} className="leading-relaxed">{instruction}</li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
