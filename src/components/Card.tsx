
import React from 'react';
import { CardData } from '@/utils/imageUtils';
import { cn } from '@/lib/utils';

interface CardProps {
  card: CardData;
  onClick?: (card: CardData) => void;
  onEdit?: (card: CardData) => void;
  className?: string;
}

const Card: React.FC<CardProps> = ({ card, onClick, onEdit, className }) => {
  return (
    <div 
      className={cn(
        "dixit-card group cursor-pointer transition-all duration-300 ease-in-out",
        card.isSelected && "dixit-card-selected",
        className
      )}
      onClick={() => onClick && onClick(card)}
    >
      <div className="dixit-card-inner">
        <img 
          src={card.imageUrl} 
          alt={card.prompt}
          loading="lazy"
          className="object-cover transition-transform duration-300"
        />
        
        {/* Edit button overlaid on the card */}
        {onEdit && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="bg-dixit-primary text-white p-2 rounded-full shadow-lg hover:bg-dixit-secondary transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(card);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {/* Card seed badge */}
      <div className="absolute top-2 left-2 bg-dixit-dark bg-opacity-50 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
        Seed: {card.seed}
      </div>
    </div>
  );
};

export default Card;
