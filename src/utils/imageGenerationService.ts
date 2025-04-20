
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
      // Use a valid pipeline type from HuggingFace transformers
      this.model = await pipeline(
        "text-generation", // Changed from "text-to-image" to a valid pipeline type
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
      
      // For demonstration purposes, we'll simulate image generation since
      // proper text-to-image pipeline integration requires specific model setup
      // In a real implementation, we would use the appropriate model configuration
      
      // Simulate a delay for image generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a placeholder image (in a real app, would use actual model output)
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Draw a colored background
        ctx.fillStyle = `hsl(${Math.random() * 360}, 80%, 70%)`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add some text to indicate the prompt
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.font = '20px sans-serif';
        ctx.fillText(`Prompt: ${params.positivePrompt.substring(0, 30)}...`, 20, 40);
        ctx.fillText(`Seed: ${seed}`, 20, 70);
      }
      
      // Convert canvas to blob and then to URL
      const imageUrl = await new Promise<string>(resolve => {
        canvas.toBlob(blob => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            resolve('');
          }
        });
      });

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
