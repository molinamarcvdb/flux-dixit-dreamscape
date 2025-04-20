
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { HfInference } from 'https://esm.sh/@huggingface/inference@2.3.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt } = await req.json()
    
    if (!prompt) {
      throw new Error('Prompt is required')
    }

    console.log('Generating image with prompt:', prompt)
    
    // Get the API token from environment variables
    const apiToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN')
    if (!apiToken) {
      throw new Error('HUGGING_FACE_ACCESS_TOKEN is not set')
    }
    
    const hf = new HfInference(apiToken)

    // Using a model that's known to be supported by the Hugging Face Inference API
    console.log('Using model: stabilityai/stable-diffusion-xl-base-1.0')
    
    try {
      const image = await hf.textToImage({
        inputs: prompt,
        model: 'stabilityai/stable-diffusion-xl-base-1.0',
      })

      // Convert the blob to a base64 string
      const arrayBuffer = await image.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
      
      console.log('Image generated successfully')

      return new Response(
        JSON.stringify({ imageURL: `data:image/png;base64,${base64}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (modelError) {
      console.error('Specific model error:', modelError)
      
      // Fallback to a different model if the first one fails
      console.log('Falling back to another model: runwayml/stable-diffusion-v1-5')
      
      const fallbackImage = await hf.textToImage({
        inputs: prompt,
        model: 'runwayml/stable-diffusion-v1-5',
      })
      
      const fallbackArrayBuffer = await fallbackImage.arrayBuffer()
      const fallbackBase64 = btoa(String.fromCharCode(...new Uint8Array(fallbackArrayBuffer)))
      
      console.log('Fallback image generated successfully')
      
      return new Response(
        JSON.stringify({ imageURL: `data:image/png;base64,${fallbackBase64}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Error generating image:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
