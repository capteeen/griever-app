'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const PrizeDisplay: React.FC = () => {
  const [isGlitching, setIsGlitching] = useState(false);
  
  useEffect(() => {
    // Create a random glitch effect every few seconds
    const glitchInterval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, 5000);
    
    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center p-6 backdrop-blur-sm rounded-xl border border-[#00ff00]/30 bg-black/50 shadow-[0_0_15px_rgba(0,255,0,0.3)]">
      <div className="flex items-center mb-4">
        <Image 
          src="/crypto-icon.svg"
          alt="Cryptocurrency Icon"
          width={40}
          height={40}
          className="mr-2"
        />
        <h2 className="text-2xl font-bold text-[#00ff00] font-mono">PRIZE POOL</h2>
      </div>
      
      <div className={`text-5xl font-bold text-white font-mono transition-all duration-100 ${isGlitching ? 'skew-x-3 text-[#ff00ff]' : ''}`}>
        $15,000
      </div>
      
      <p className="mt-4 text-[#00ff00]/80 text-center max-w-xs">
        Can you convince the AI guardian with your tale of woe?
      </p>
    </div>
  );
};

export default PrizeDisplay; 