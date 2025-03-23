'use client';

import React, { useState } from 'react';
import { quantumExplanations } from './explanations';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuantumPopupProps {
  isOpen: boolean;
  onClose: () => void;
  concept: 'hom' | 'mzi';
}

export const QuantumPopup: React.FC<QuantumPopupProps> = ({ isOpen, onClose, concept }) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const explanation = quantumExplanations[concept];

  if (!isOpen || !explanation) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose}>
      <div 
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                   bg-white/10 backdrop-blur-md rounded-xl p-6 max-w-2xl w-[90%] 
                   shadow-lg border border-white/20"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">{explanation.title}</h2>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="text-white/90">
          <p className="font-medium mb-4">{explanation.summary}</p>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFullContent(!showFullContent)}
            className={cn(
              "border-purple-500 text-purple-100 bg-purple-500/20",
              "hover:bg-purple-600/30 hover:text-purple-50 hover:border-purple-400",
              "transition-all duration-200 shadow-[0_0_10px_-3px_rgba(168,85,247,0.4)]",
              "hover:shadow-[0_0_12px_-2px_rgba(168,85,247,0.5)]"
            )}
          >
            {showFullContent ? 'Show Less' : 'Read More'}
          </Button>
          
          {showFullContent && (
            <div className="mt-4 pt-4 border-t border-white/10 whitespace-pre-wrap">
              {explanation.fullContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
