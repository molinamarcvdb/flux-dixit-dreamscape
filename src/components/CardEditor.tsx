
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { CardData } from '@/utils/imageUtils';
import { imageGenerationService } from '@/utils/imageGenerationService';

interface CardEditorProps {
  card: CardData | null;
  onClose: () => void;
  onSave: (updatedCard: CardData) => void;
  isOpen: boolean;
}

const CardEditor: React.FC<CardEditorProps> = ({ card, onClose, onSave, isOpen }) => {
  const [activeTab, setActiveTab] = useState('regenerate');
  const [newPrompt, setNewPrompt] = useState('');
  const [cfgScale, setCfgScale] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inpaintMask, setInpaintMask] = useState<string | null>(null);
  const [inpaintPrompt, setInpaintPrompt] = useState('');
  
  // Reset state when card changes
  React.useEffect(() => {
    if (card) {
      setNewPrompt(card.prompt);
      setInpaintPrompt('');
      setInpaintMask(null);
    }
  }, [card]);
  
  const handleRegenerateCard = async () => {
    if (!card) return;
    
    try {
      setIsProcessing(true);
      
      const params = {
        positivePrompt: newPrompt,
        CFGScale: cfgScale,
        seed: Math.floor(Math.random() * 1000000000), // Use random seed
      };
      
      toast.info('Regenerating card...');
      
      const generatedImage = await imageGenerationService.generateImage(params);
      
      if (!generatedImage.imageURL) {
        throw new Error('Failed to generate image');
      }
      
      const updatedCard: CardData = {
        ...card,
        imageUrl: generatedImage.imageURL,
        prompt: newPrompt,
        seed: generatedImage.seed,
      };
      
      onSave(updatedCard);
      toast.success('Card regenerated successfully');
      onClose();
    } catch (error) {
      console.error('Error regenerating card:', error);
      toast.error(`Failed to regenerate card: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // This would be a placeholder for inpainting functionality
  // In a real app, this would need a canvas for selecting the inpainting area
  const handleInpaint = () => {
    toast.info('Inpainting functionality would be implemented here in a complete version');
    
    // For now, just show a message
    toast('This feature would allow you to select areas of the image to edit');
  };
  
  if (!card) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-dixit-primary">Edit Dixit Card</DialogTitle>
          <DialogDescription>
            Modify your card by regenerating with a new prompt or using inpainting to edit specific areas.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="flex flex-col space-y-4">
            <div className="rounded-lg overflow-hidden border border-muted h-80">
              <img 
                src={card.imageUrl} 
                alt={card.prompt} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>Seed:</strong> {card.seed}</p>
              <p><strong>Original Prompt:</strong> {card.prompt}</p>
            </div>
          </div>
          
          <div>
            <Tabs defaultValue="regenerate" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="regenerate" className="flex-1">Regenerate</TabsTrigger>
                <TabsTrigger value="inpaint" className="flex-1">Inpaint</TabsTrigger>
              </TabsList>
              
              <TabsContent value="regenerate" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="new-prompt">New Prompt</Label>
                  <Textarea
                    id="new-prompt"
                    placeholder="Enter new prompt for the card"
                    value={newPrompt}
                    onChange={(e) => setNewPrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="cfg-scale">Creativity Level: {cfgScale.toFixed(1)}</Label>
                  </div>
                  <Slider
                    id="cfg-scale"
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={[cfgScale]}
                    onValueChange={(value) => setCfgScale(value[0])}
                    className="py-4"
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower values create more creative, imaginative results
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="inpaint" className="space-y-4 pt-4">
                <div className="rounded-lg border border-dashed border-muted p-4 flex items-center justify-center h-48 bg-muted/10">
                  <div className="text-center space-y-2">
                    <p>Inpainting would allow you to mask specific areas of the image</p>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={handleInpaint}
                      className="border-dixit-secondary text-dixit-secondary hover:bg-dixit-secondary hover:text-white"
                    >
                      Simulate Inpainting
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="inpaint-prompt">Inpainting Prompt</Label>
                  <Textarea
                    id="inpaint-prompt"
                    placeholder="Describe what should appear in the masked area"
                    value={inpaintPrompt}
                    onChange={(e) => setInpaintPrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={activeTab === 'regenerate' ? handleRegenerateCard : handleInpaint}
            disabled={isProcessing}
            className="bg-gradient-to-r from-dixit-secondary to-dixit-primary hover:from-dixit-primary hover:to-dixit-secondary text-white"
          >
            {isProcessing ? 'Processing...' : activeTab === 'regenerate' ? 'Regenerate Card' : 'Apply Inpainting'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CardEditor;
