
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-recipe.ts';
import '@/ai/flows/generate-recipe-from-ingredients.ts';
import '@/ai/flows/summarize-recipe.ts';
import '@/ai/flows/generate-recipe-image.ts'; // Added new flow
