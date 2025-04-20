
import { pipeline } from "@huggingface/transformers";
import { toast } from "sonner";

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
  private model: any = null;
  
  async initialize() {
    try {
      // Use the proper pipeline type that's supported by HuggingFace transformers
      this.model = await pipeline(
        "text-to-image", 
        "stabilityai/stable-diffusion-2", 
        { device: "webgpu" }
      );
      console.log("Model loaded successfully");
    } catch (error) {
      console.error("Error loading model:", error);
      toast.error("Failed to initialize image generation model");
      throw error;
    }
  }

  async generateImage(params: GenerateImageParams): Promise<GeneratedImage> {
    if (!this.model) {
      await this.initialize();
    }

    try {
      const seed = params.seed || Math.floor(Math.random() * 1000000000);
      const cfgScale = params.CFGScale || 7.5; // Default CFG scale if not provided
      
      console.log("Generating image with params:", { 
        prompt: params.positivePrompt, 
        seed, 
        cfgScale 
      });
      
      const image = await this.model(params.positivePrompt, {
        seed: seed,
        num_inference_steps: 20,
        guidance_scale: cfgScale
      });

      // Convert the generated image to a URL
      const imageUrl = URL.createObjectURL(
        new Blob([image], { type: 'image/png' })
      );

      return {
        imageURL: imageUrl,
        positivePrompt: params.positivePrompt,
        seed: seed
      };
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error(`Failed to generate image: ${error.message}`);
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
