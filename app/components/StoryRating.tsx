'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { StoryRating as StoryRatingType } from '@/app/lib/types';

interface StoryRatingProps {
  rating: StoryRatingType;
}

const StoryRating: React.FC<StoryRatingProps> = ({ rating }) => {
  const { authenticity, emotionalImpact, total, worthy } = rating;
  
  // Determine color based on worthiness
  const getWorthyColor = () => {
    if (worthy === 'YES') return 'text-green-500';
    if (worthy === 'MAYBE') return 'text-yellow-500';
    return 'text-red-500';
  };
  
  return (
    <motion.div
      className="bg-black/70 backdrop-blur-md border border-[#00ff00]/30 rounded-lg p-6 w-full max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-[#00ff00] font-mono text-xl mb-4 text-center">AI EVALUATION</h2>
      
      <div className="mb-4 text-center">
        <p className="text-white/80 text-sm italic">"{rating.storyExcerpt}..."</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col items-center">
          <div className="text-[#00ff00]/70 text-xs mb-1 font-mono">AUTHENTICITY</div>
          <div className="font-mono text-2xl font-bold text-white">
            {authenticity}<span className="text-white/50 text-sm">/10</span>
          </div>
          <div className="w-full h-2 bg-black/50 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-[#00ff00]" 
              style={{ width: `${authenticity * 10}%` }}
            />
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="text-[#00ff00]/70 text-xs mb-1 font-mono">EMOTIONAL IMPACT</div>
          <div className="font-mono text-2xl font-bold text-white">
            {emotionalImpact}<span className="text-white/50 text-sm">/10</span>
          </div>
          <div className="w-full h-2 bg-black/50 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-[#00ff00]" 
              style={{ width: `${emotionalImpact * 10}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center border-t border-[#00ff00]/20 pt-4">
        <div className="text-[#00ff00]/70 text-xs mb-1 font-mono">TOTAL SCORE</div>
        <div className="font-mono text-3xl font-bold text-white">
          {total}<span className="text-white/50 text-sm">/20</span>
        </div>
        <div className="w-full h-2 bg-black/50 rounded-full mt-2 mb-4 overflow-hidden">
          <div 
            className="h-full bg-[#00ff00]" 
            style={{ width: `${total * 5}%` }}
          />
        </div>
        
        <div className="text-center mt-2">
          <span className="text-white/80 text-sm mr-2">Verdict:</span>
          <span className={`text-lg font-bold font-mono ${getWorthyColor()}`}>
            {worthy}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default StoryRating; 