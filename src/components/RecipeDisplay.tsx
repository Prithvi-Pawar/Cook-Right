
import type { RecipeDataWithImage } from './RecipeGenerator'; // Updated import
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ClipboardList, ListOrdered, Image as ImageIcon, RefreshCw } from 'lucide-react'; // Added ImageIcon, RefreshCw
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton'; // Added Skeleton
import { TranslateRecipe } from './TranslateRecipe';

interface RecipeDisplayProps {
  recipe: RecipeDataWithImage;
  originalRecipe: RecipeDataWithImage | null;
  onTranslate: (language: string) => Promise<void>;
  isTranslating: boolean;
  onResetTranslation: () => void;
  isLoadingImage?: boolean;
}

export function RecipeDisplay({ recipe, originalRecipe, onTranslate, isTranslating, onResetTranslation, isLoadingImage }: RecipeDisplayProps) {
  const instructionsArray = typeof recipe.instructions === 'string'
    ? recipe.instructions.split(/\\n|\n/).map(line => line.trim()).filter(line => line !== '')
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
        <div className="mb-6 aspect-video w-full relative">
          {isLoadingImage ? (
            <Skeleton className="h-full w-full rounded-lg flex items-center justify-center">
              <RefreshCw className="h-12 w-12 text-muted-foreground animate-spin" />
            </Skeleton>
          ) : recipe.imageDataUri ? (
            <Image
              src={recipe.imageDataUri}
              alt={recipe.recipeName}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          ) : (
            <iframe
              className="rounded-lg"
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(recipe.recipeName + ' recipe Sanjeev Kapoor Khazana')}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          )}
        </div>

        <TranslateRecipe 
          onTranslate={onTranslate} 
          isTranslating={isTranslating} 
          hasBeenTranslated={!!originalRecipe}
          onResetTranslation={onResetTranslation}
        />

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
