
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { imageGenerationService, GeneratedImage } from '@/utils/imageGenerationService';
import { CardData, createCardData } from '@/utils/imageUtils';

interface CardGeneratorProps {
  onCardsGenerated: (cards: CardData[]) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
}

const CardGenerator: React.FC<CardGeneratorProps> = ({ 
  onCardsGenerated, 
  isGenerating, 
  setIsGenerating 
}) => {
  const [prompt, setPrompt] = useState('');
  const [cardCount, setCardCount] = useState(3);
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    
    try {
      setIsGenerating(true);
      toast.info(`Generating ${cardCount} Dixit cards...`);
      
      const params = {
        positivePrompt: prompt,
      };
      
      const generatedImages = await imageGenerationService.generateImages(params, cardCount);
      
      if (generatedImages.length === 0) {
        toast.error('Failed to generate any images');
        return;
      }
      
      const cards: CardData[] = generatedImages.map(img => 
        createCardData(img.imageURL, img.positivePrompt, img.seed)
      );
      
      onCardsGenerated(cards);
      toast.success(`Successfully generated ${cards.length} Dixit cards`);
    } catch (error) {
      console.error('Error in card generation:', error);
      toast.error(`Error generating cards: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Card className="w-full bg-white dark:bg-gray-800 shadow-lg border-dixit-primary border-opacity-20">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-dixit-primary">Dixit Card Generator</CardTitle>
        <CardDescription>Create your own dreamlike Dixit cards using AI</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Card Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="Describe your Dixit card (e.g. 'A mystical forest with floating lanterns and a hidden path')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] border-dixit-secondary"
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="card-count">Number of Cards: {cardCount}</Label>
          </div>
          <Slider
            id="card-count"
            min={1}
            max={10}
            step={1}
            value={[cardCount]}
            onValueChange={(value) => setCardCount(value[0])}
            className="py-4"
          />
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleGenerate} 
          disabled={isGenerating} 
          className="w-full bg-gradient-to-r from-dixit-secondary to-dixit-primary hover:from-dixit-primary hover:to-dixit-secondary text-white"
        >
          {isGenerating ? 'Generating...' : 'Generate Dixit Cards'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CardGenerator;
