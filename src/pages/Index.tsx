
import React, { useState, useEffect } from 'react';
import CardGenerator from '@/components/CardGenerator';
import CardGallery from '@/components/CardGallery';
import CardEditor from '@/components/CardEditor';
import { CardData } from '@/utils/imageUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const Index = () => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('generator');
  
  // On mobile, switch to gallery tab after generating cards
  useEffect(() => {
    if (cards.length > 0 && !isGenerating && window.innerWidth < 768) {
      setActiveTab('gallery');
    }
  }, [cards, isGenerating]);
  
  const handleCardsGenerated = (newCards: CardData[]) => {
    setCards(prev => [...prev, ...newCards]);
  };
  
  const handleSelectCard = (updatedCard: CardData) => {
    setCards(prev => 
      prev.map(card => 
        card.id === updatedCard.id ? updatedCard : card
      )
    );
  };
  
  const handleEditCard = (card: CardData) => {
    setEditingCard(card);
  };
  
  const handleSaveEditedCard = (updatedCard: CardData) => {
    setCards(prev => 
      prev.map(card => 
        card.id === updatedCard.id ? updatedCard : card
      )
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-950">
      {/* Floating elements for background decoration */}
      <div className="floating-elements">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i}
            className="floating-element"
            style={{
              width: `${Math.random() * 200 + 50}px`,
              height: `${Math.random() * 200 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.15 + 0.05,
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-dixit-primary tracking-tight mb-2">
            Dixit Dreamscape
          </h1>
          <p className="text-lg text-dixit-secondary max-w-2xl mx-auto">
            Create your own magical Dixit cards with AI-powered dreamscapes
          </p>
        </header>
        
        <Separator className="my-8 bg-dixit-primary bg-opacity-20" />
        
        <div className="lg:hidden mb-6">
          <Tabs defaultValue="generator" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full">
              <TabsTrigger value="generator" className="flex-1">Generator</TabsTrigger>
              <TabsTrigger value="gallery" className="flex-1">Gallery {cards.length > 0 && `(${cards.length})`}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="generator" className="mt-4">
              <CardGenerator 
                onCardsGenerated={handleCardsGenerated}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
              />
            </TabsContent>
            
            <TabsContent value="gallery" className="mt-4">
              <CardGallery 
                cards={cards}
                onSelectCard={handleSelectCard}
                onEditCard={handleEditCard}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="hidden lg:grid lg:grid-cols-3 gap-8">
          <div className="col-span-1">
            <CardGenerator 
              onCardsGenerated={handleCardsGenerated}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
            />
          </div>
          
          <div className="col-span-2">
            <CardGallery 
              cards={cards}
              onSelectCard={handleSelectCard}
              onEditCard={handleEditCard}
            />
          </div>
        </div>
      </div>
      
      {/* Card Editor Dialog */}
      <CardEditor 
        card={editingCard}
        onClose={() => setEditingCard(null)}
        onSave={handleSaveEditedCard}
        isOpen={!!editingCard}
      />
    </div>
  );
};

export default Index;
