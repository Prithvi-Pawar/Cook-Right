
import type { RecipeDataWithImage } from './RecipeGenerator'; // Updated import
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ClipboardList, ListOrdered, RefreshCw, Youtube } from 'lucide-react'; // Added Youtube icon
import Image from 'next/image';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
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
              fill
              className="rounded-lg object-cover"
            />
          ) : recipe.videoId ? (
            <iframe
              className="rounded-lg"
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${recipe.videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="relative h-full w-full rounded-lg bg-slate-200 flex flex-col items-center justify-center text-center p-4 overflow-hidden">
              <Image
                src="https://images.pexels.com/photos/326281/pexels-photo-326281.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Find a video on YouTube"
                fill
                className="opacity-20 object-cover"
              />
              <div className="relative z-10 flex flex-col items-center gap-3">
                <Youtube className="h-16 w-16 text-red-500" />
                <p className="font-semibold text-neutral-700">Find a video walkthrough for this recipe!</p>
                <Link
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.recipeName + ' recipe')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: 'destructive' })}
                >
                  Search on YouTube
                </Link>
              </div>
            </div>
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
