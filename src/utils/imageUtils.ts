
export interface CardData {
  id: string;
  imageUrl: string;
  prompt: string;
  seed: number;
  isSelected?: boolean;
}

// Helper to create a card data object
export const createCardData = (
  imageUrl: string, 
  prompt: string, 
  seed: number
): CardData => ({
  id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  imageUrl,
  prompt,
  seed,
  isSelected: false
});

// Function to download all cards as a zip file
export const downloadCards = async (cards: CardData[]) => {
  try {
    // This is a placeholder - in a real app, we'd want to use JSZip
    // For now, we'll just let users download individual cards
    alert('Downloading all cards as a zip file is not implemented yet');
  } catch (error) {
    console.error('Error downloading cards:', error);
  }
};

// Function to download a single card
export const downloadCard = async (card: CardData) => {
  try {
    const link = document.createElement('a');
    link.href = card.imageUrl;
    link.download = `dixit-card-${card.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading card:', error);
  }
};
