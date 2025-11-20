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
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.warn('YOUTUBE_API_KEY is not set. Skipping video search.');
      return { videoId: undefined };
    }

    const query = encodeURIComponent(`${input.recipeName} recipe`);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error('Failed to fetch from YouTube API:', await response.text());
      return { videoId: undefined };
    }

    const data = await response.json();
    const videoId = data.items?.[0]?.id?.videoId;

    return { videoId };
  }
);