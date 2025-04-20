
import { supabase } from "@/integrations/supabase/client";

export interface GenerateImageParams {
  positivePrompt: string;
  numberResults?: number;
  seed?: number | null;
  CFGScale?: number;
}

export interface GeneratedImage {
  imageURL: string;
  positivePrompt: string;
  seed: number;
}

export class ImageGenerationService {
  async generateImage(params: GenerateImageParams): Promise<GeneratedImage> {
    try {
      console.log("Generating image with params:", params);
      
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt: params.positivePrompt }
      });
      
      if (error) throw error;
      if (!data.imageURL) throw new Error('No image URL returned');
      
      return {
        imageURL: data.imageURL,
        positivePrompt: params.positivePrompt,
        seed: params.seed || Math.floor(Math.random() * 1000000000)
      };
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }

  async generateImages(params: GenerateImageParams, count: number): Promise<GeneratedImage[]> {
    const images: GeneratedImage[] = [];
    const promises: Promise<GeneratedImage>[] = [];
    
    for (let i = 0; i < count; i++) {
      const modifiedParams = { 
        ...params,
        seed: params.seed || Math.floor(Math.random() * 1000000000)
      };
      
      promises.push(this.generateImage(modifiedParams));
    }
    
    try {
      const results = await Promise.allSettled(promises);
      
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          images.push(result.value);
        } else {
          console.error('Failed to generate one image:', result.reason);
        }
      });
      
      return images;
    } catch (error) {
      console.error('Error generating multiple images:', error);
      throw error;
    }
  }
}

export const imageGenerationService = new ImageGenerationService();
