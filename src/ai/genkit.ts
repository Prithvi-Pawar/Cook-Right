
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {config} from 'dotenv';

config(); // Load environment variables

export const ai = genkit({
  plugins: [googleAI()],
  model: 'gemini-1.5-flash',
});
