
import { config } from 'dotenv';
config();

// Main unified flow
import '@/ai/flows/generate-recipe.ts';

// Supporting flows
import '@/ai/flows/translate-recipe-flow.ts';

// Legacy or specialized flows (can be removed if the new UI doesn't use them)
import '@/ai/flows/generate-named-recipe-from-description-flow.ts';
import '@/ai/flows/generate-recipe-from-ingredients.ts';
import '@/ai/flows/suggest-recipe-names-flow.ts';
import '@/ai/flows/suggest-recipe-names-from-description-flow.ts';
import '@/ai/flows/summarize-recipe.ts';
