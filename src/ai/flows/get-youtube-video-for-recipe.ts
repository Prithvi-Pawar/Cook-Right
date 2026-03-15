'use server';
/**
 * @fileOverview Searches YouTube for a recipe video and returns the video ID.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GetYoutubeVideoForRecipeInputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe to search for on YouTube.'),
});
export type GetYoutubeVideoForRecipeInput = z.infer<typeof GetYoutubeVideoForRecipeInputSchema>;

const GetYoutubeVideoForRecipeOutputSchema = z.object({
  videoId: z.string().optional().describe('The ID of the top YouTube video found.'),
});
export type GetYoutubeVideoForRecipeOutput = z.infer<typeof GetYoutubeVideoForRecipeOutputSchema>;

export async function getYoutubeVideoForRecipe(input: GetYoutubeVideoForRecipeInput): Promise<GetYoutubeVideoForRecipeOutput> { // Export the async function
  return getYoutubeVideoForRecipeFlow(input);
}

const getYoutubeVideoForRecipeFlow = ai.defineFlow(
  {
    name: 'getYoutubeVideoForRecipeFlow',
    inputSchema: GetYoutubeVideoForRecipeInputSchema,
    outputSchema: GetYoutubeVideoForRecipeOutputSchema,
  },
  async (input) => {
    const query = encodeURIComponent(`${input.recipeName} recipe`);
    // Scrape YouTube search results to avoid API key requirement and quota limits
    const url = `https://www.youtube.com/results?search_query=${query}`;

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch from YouTube:', response.status);
      return { videoId: undefined };
    }

    const html = await response.text();
    // Regex to extract the first video ID from the HTML content (YouTube IDs are 11 chars)
    const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    const videoId = match ? match[1] : undefined;

    if (!videoId) {
      console.warn(`No YouTube video found for query: ${query}`);
    }

    return { videoId };
  }
);