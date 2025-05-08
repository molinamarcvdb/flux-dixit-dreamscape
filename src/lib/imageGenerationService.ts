// src/lib/imageGenerationService.ts
// Remove: import { supabase } from '@/integrations/supabase/client';

const API_ENDPOINT = import.meta.env.VITE_HF_API_ENDPOINT || '/api/generate-image'; // Use env variable or default

async function generateSingleImage(positivePrompt: string, seed: number): Promise<{ imageURL: string }> {
  console.log('Generating image with params:', { positivePrompt, seed });

  try {
    const response = await fetch(API_ENDPOINT, { // Use fetch and the local endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: positivePrompt, seed }) // 'seed' might not be used by local handler, but send if needed
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('API Error Response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();

    if (!data.imageURL) {
        throw new Error('Invalid response structure from API');
    }

    return { imageURL: data.imageURL };

  } catch (error) {
    console.error('Error generating image locally:', error); // Updated log message
    // Re-throw the error so Promise.allSettled can catch it
    throw error;
  }
}

// Keep the generateImages function as it was, it calls generateSingleImage
export async function generateImages(positivePrompt: string): Promise<string[]> {
    const MAX_IMAGES_TO_GENERATE = 10; // Or your desired number
    console.log(`Generating ${MAX_IMAGES_TO_GENERATE} images for prompt: "${positivePrompt}"`);

    const numImagesToGenerate = Math.min(MAX_IMAGES_TO_GENERATE);

    const promises = Array.from({ length: numImagesToGenerate }).map(() => {
        const seed = Math.floor(Math.random() * 1000000000); // Generate random seed
        // Call the updated generateSingleImage which now fetches locally
        return generateSingleImage(positivePrompt, seed);
    });

    const results = await Promise.allSettled(promises);

    const successfulURLs = results
        .filter((result): result is PromiseFulfilledResult<{ imageURL: string }> => result.status === 'fulfilled')
        .map(result => result.value.imageURL);

    const failedCount = results.length - successfulURLs.length;
    if (failedCount > 0) {
        console.warn(`${failedCount} image(s) failed to generate.`);
    }

    console.log(`Successfully generated ${successfulURLs.length} images.`);
    return successfulURLs;
}
