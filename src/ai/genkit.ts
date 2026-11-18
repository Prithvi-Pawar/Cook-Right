
import {genkit} from 'genkit';
import openAICompatible, {
  compatOaiModelRef,
  defineCompatOpenAIModel,
} from '@genkit-ai/compat-oai';

export const ai = genkit({
  plugins: [
    openAICompatible({
      name: 'nvidia',
      apiKey: process.env.NVIDIA_API_KEY,
      baseURL: 'https://integrate.api.nvidia.com/v1',
      fetch: async (url, init) => {
        const response = await fetch(url, init);
        if (!response.ok) {
          let responseBody = '';
          try {
            responseBody = await response.clone().text();
          } catch (error) {
            responseBody = `Unable to read NVIDIA error response: ${
              error instanceof Error ? error.message : 'unknown error'
            }`;
          }

          console.error('NVIDIA NIM request failed', {
            status: response.status,
            statusText: response.statusText,
            requestId:
              response.headers.get('x-request-id') ??
              response.headers.get('request-id') ??
              response.headers.get('nvcf-reqid'),
            responseBody: responseBody.slice(0, 1000),
          });
        }
        return response;
      },
      resolver: (client, actionType, actionName) => {
        if (actionType !== 'model') {
          return undefined;
        }

        return defineCompatOpenAIModel({
          name: `nvidia/${actionName}`,
          client,
          modelRef: compatOaiModelRef({name: actionName}),
        });
      },
    }),
  ],
  model: 'nvidia/nvidia/nemotron-3.5-lightning-30b-a3b',
});
