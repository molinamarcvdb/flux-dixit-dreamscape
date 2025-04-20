
import { toast } from "sonner";

export interface GenerateImageParams {
  positivePrompt: string;
  model?: string;
  numberResults?: number;
  outputFormat?: string;
  CFGScale?: number;
  scheduler?: string;
  strength?: number;
  promptWeighting?: "compel" | "sdEmbeds" | "none";
  seed?: number | null;
  lora?: string[];
}

export interface GeneratedImage {
  imageURL: string;
  positivePrompt: string;
  seed: number;
  NSFWContent?: boolean;
  taskUUID?: string;
  imageUUID?: string;
}

export class RunwareService {
  private apiKey: string | null = null;

  constructor(apiKey: string | null = null) {
    this.apiKey = apiKey;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateImage(params: GenerateImageParams): Promise<GeneratedImage> {
    if (!this.apiKey) {
      throw new Error("API key is required");
    }
    
    try {
      // Create the basic request structure
      const requestData: any[] = [
        {
          taskType: "authentication",
          apiKey: this.apiKey
        },
        {
          taskType: "imageInference",
          taskUUID: crypto.randomUUID(),
          model: params.model || "runware:100@1",
          width: 1024,
          height: 1024,
          numberResults: params.numberResults || 1,
          outputFormat: params.outputFormat || "WEBP",
          CFGScale: params.CFGScale || 1,
          scheduler: params.scheduler || "FlowMatchEulerDiscreteScheduler",
          strength: params.strength || 0.8,
          positivePrompt: params.positivePrompt,
          promptWeighting: params.promptWeighting || "none",
          lora: params.lora || [],
        }
      ];

      // Add seed if provided - now adding it directly to the second object in the array
      if (params.seed) {
        requestData[1].seed = params.seed;
      }

      const response = await fetch('https://api.runware.ai/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      
      if (!data.data || data.data.length < 1) {
        throw new Error('No image data returned');
      }

      const imageData = data.data.find(item => item.taskType === 'imageInference');
      
      if (!imageData || !imageData.imageURL) {
        throw new Error('No image URL found in response');
      }

      return {
        imageURL: imageData.imageURL,
        positivePrompt: params.positivePrompt,
        seed: imageData.seed || 0,
        NSFWContent: imageData.NSFWContent || false,
        taskUUID: imageData.taskUUID,
        imageUUID: imageData.imageUUID
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
      // Use a different seed for each image if not specified
      const modifiedParams = { 
        ...params,
        seed: params.seed || Math.floor(Math.random() * 1000000000)
      };
      
      promises.push(this.generateImage(modifiedParams));
    }
    
    try {
      // Wait for all promises to resolve
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

export const runwareService = new RunwareService();
