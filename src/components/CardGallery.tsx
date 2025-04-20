
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Card from '@/components/Card';
import { CardData, downloadCard, downloadCards } from '@/utils/imageUtils';
import { cn } from '@/lib/utils';

interface CardGalleryProps {
  cards: CardData[];
  onSelectCard: (card: CardData) => void;
  onEditCard: (card: CardData) => void;
  className?: string;
}

const CardGallery: React.FC<CardGalleryProps> = ({ 
  cards, 
  onSelectCard, 
  onEditCard,
  className 
}) => {
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());
  
  const handleCardClick = (card: CardData) => {
    const newSelectedIds = new Set(selectedCardIds);
    
    if (newSelectedIds.has(card.id)) {
      newSelectedIds.delete(card.id);
    } else {
      newSelectedIds.add(card.id);
    }
    
    setSelectedCardIds(newSelectedIds);
    
    // Create a new card object with updated selection status
    const updatedCard = {
      ...card,
      isSelected: !card.isSelected
    };
    
    onSelectCard(updatedCard);
  };
  
  const handleDownloadSelected = () => {
    const selectedCards = cards.filter(card => selectedCardIds.has(card.id));
    if (selectedCards.length === 1) {
      downloadCard(selectedCards[0]);
    } else if (selectedCards.length > 1) {
      downloadCards(selectedCards);
    }
  };
  
  const handleSelectAll = () => {
    if (selectedCardIds.size === cards.length) {
      // Deselect all
      setSelectedCardIds(new Set());
      
      // Update all cards
      cards.forEach(card => {
        onSelectCard({
          ...card,
          isSelected: false
        });
      });
    } else {
      // Select all
      const allIds = new Set(cards.map(card => card.id));
      setSelectedCardIds(allIds);
      
      // Update all cards
      cards.forEach(card => {
        onSelectCard({
          ...card,
          isSelected: true
        });
      });
    }
  };
  
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-dixit-primary">Your Dixit Cards</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSelectAll}
            className="border-dixit-secondary text-dixit-secondary hover:bg-dixit-secondary hover:text-white"
          >
            {selectedCardIds.size === cards.length ? 'Deselect All' : 'Select All'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownloadSelected}
            disabled={selectedCardIds.size === 0}
            className="border-dixit-primary text-dixit-primary hover:bg-dixit-primary hover:text-white"
          >
            Download {selectedCardIds.size > 0 ? `(${selectedCardIds.size})` : ''}
          </Button>
        </div>
      </div>
      
      {cards.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8 bg-muted/10 rounded-lg border border-dashed border-muted">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">No cards generated yet</p>
            <p className="text-sm text-muted-foreground">Use the generator to create dreamlike Dixit cards</p>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-4">
            {cards.map(card => (
              <Card
                key={card.id}
                card={card}
                onClick={handleCardClick}
                onEdit={onEditCard}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default CardGallery;
