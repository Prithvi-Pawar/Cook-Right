
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
<<<<<<< HEAD
import '@/ai/flows/generate-recipe-image.ts';
import '@/ai/flows/suggest-recipe-names-flow.ts'; 
import '@/ai/flows/suggest-recipe-names-from-description-flow.ts'; // Added new flow for description suggestions
import '@/ai/flows/translate-recipe-flow.ts'; // Added for translation
=======
>>>>>>> 89a487b31cc278830769156c2455b0a705de82d9
