// src/server/generateImageHandler.ts
import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';

dotenv.config(); // Load variables from .env file

const apiToken = process.env.HUGGING_FACE_ACCESS_TOKEN;

if (!apiToken) {
    throw new Error('HUGGING_FACE_ACCESS_TOKEN is not set in .env file');
}

const hf = new HfInference(apiToken);

// Define a function to handle the request
export async function handleGenerateImageRequest(req: Request): Promise<Response> {
    try {
        // Ensure it's a POST request (or handle other methods if needed)
        if (req.method !== 'POST') {
             return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
        }

        const { prompt } = await req.json(); // Assuming Request type from Node or polyfill

        if (!prompt) {
            throw new Error('Prompt is required');
        }

        console.log('Generating image locally with prompt:', prompt);

        // Use the same model logic as your Supabase function
        let imageBlob: Blob;
        try {
            console.log('Using model: stabilityai/stable-diffusion-xl-base-1.0');
            imageBlob = await hf.textToImage({
                inputs: prompt,
                model: 'stabilityai/stable-diffusion-xl-base-1.0',
            });
        } catch (modelError: any) {
            console.error('Specific model error:', modelError);
            console.log('Falling back to another model: runwayml/stable-diffusion-v1-5');
            imageBlob = await hf.textToImage({
                inputs: prompt,
                model: 'runwayml/stable-diffusion-v1-5',
            });
        }

        const arrayBuffer = await imageBlob.arrayBuffer();
        // btoa is available globally in Node.js 16+
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        const imageURL = `data:image/png;base64,${base64}`;

        console.log('Local image generated successfully');

        return new Response(
            JSON.stringify({ imageURL }),
            { headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('Error in local image generation handler:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
