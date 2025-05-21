
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-named-recipe-from-description-flow.ts'; // Renamed and refactored
import '@/ai/flows/generate-recipe-from-ingredients.ts';
import '@/ai/flows/summarize-recipe.ts';
import '@/ai/flows/generate-recipe-image.ts';
import '@/ai/flows/suggest-recipe-names-flow.ts'; 
import '@/ai/flows/suggest-recipe-names-from-description-flow.ts'; // Added new flow for description suggestions
