
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {config} from 'dotenv';

config(); // Load environment variables

export const ai = genkit({
  plugins: [googleAI()],
  model: 'gemini-1.5-flash',
});
