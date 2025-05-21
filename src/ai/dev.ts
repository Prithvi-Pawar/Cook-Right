
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-recipe.ts';
import '@/ai/flows/generate-recipe-from-ingredients.ts';
import '@/ai/flows/summarize-recipe.ts';
import '@/ai/flows/generate-recipe-image.ts';
import '@/ai/flows/suggest-recipe-names-flow.ts'; // Added new flow for suggesting names
