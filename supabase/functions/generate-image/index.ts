// supabase/functions/generate-image/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2';

// Standard CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Or your specific frontend domain for better security
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // Specify allowed methods
}

// The model you confirmed is working
const HUGGING_FACE_MODEL = 'black-forest-labs/FLUX.1-schnell';

serve(async (req) => {
  // Handle CORS preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 }) // 204 No Content is typical for OPTIONS
  }

  // Ensure it's a POST request
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    // --- 1. Get and validate the Hugging Face API Token ---
    const apiToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
    if (!apiToken) {
      console.error('HUGGING_FACE_ACCESS_TOKEN environment variable is not set.');
      return new Response(
        JSON.stringify({ error: 'API token not configured on server.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // --- 2. Get and validate the prompt from the request body ---
    let prompt: string;
    try {
      const body = await req.json();
      prompt = body.prompt;
      if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
        throw new Error(); // Will be caught by the immediate catch
      }
    } catch (_parseError) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body. "prompt" is required and must be a non-empty string.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Processing request for model: ${HUGGING_FACE_MODEL} with prompt: "${prompt}"`);

    // --- 3. Initialize Hugging Face Inference client ---
    const hf = new HfInference(apiToken);

    // --- 4. Call the Hugging Face API ---
    try {
      const imageBlob = await hf.textToImage({
        inputs: prompt,
        model: HUGGING_FACE_MODEL,
        // You can add other parameters here if needed, e.g., negative_prompt, guidance_scale
        // parameters: {
        //   negative_prompt: "blurry, disfigured, low quality",
        // }
      });

      // Convert the blob to a base64 string to send in JSON
      const arrayBuffer = await imageBlob.arrayBuffer();
      // Deno's standard library has a more robust base64 encoder
      const base64 = bytesToBase64(new Uint8Array(arrayBuffer));
      
      console.log(`Image generated successfully for prompt: "${prompt}"`);

      return new Response(
        JSON.stringify({ imageURL: `data:image/jpeg;base64,${base64}` }), // Assuming JPEG, adjust if model outputs PNG etc.
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );

    } catch (hfError) {
      console.error(`Hugging Face API error for model ${HUGGING_FACE_MODEL}:`, hfError);

      let errorMessage = 'Failed to generate image via Hugging Face API.';
      let errorStatus = 500; // Default to internal server error

      if (hfError instanceof HfInferenceError) {
        // HfInferenceError often includes a status code from the API
        errorMessage = hfError.message; // Use the library's error message
        if (hfError.status) { // Check if status property exists
          errorStatus = hfError.status;
          if (hfError.status === 401 || hfError.status === 403) {
            errorMessage = 'Hugging Face API authentication error. Please check the API token.';
          } else if (hfError.status === 404) {
            errorMessage = `The model (${HUGGING_FACE_MODEL}) was not found on Hugging Face.`;
          } else if (hfError.status === 503) {
            errorMessage = 'The Hugging Face model is currently loading or unavailable. Please try again shortly.';
          }
        }
      } else if (hfError instanceof Error) {
        // For other generic errors
        errorMessage = hfError.message;
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage, details: String(hfError) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: errorStatus }
      );
    }

  } catch (unexpectedError) {
    // --- 5. Catch-all for any other unexpected errors ---
    console.error('Unexpected error in Edge Function:', unexpectedError);
    return new Response(
      JSON.stringify({ error: 'An unexpected server error occurred.', details: String(unexpectedError) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})

// Helper function for Base64 encoding in Deno (more robust than String.fromCharCode approach for larger binary data)
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
