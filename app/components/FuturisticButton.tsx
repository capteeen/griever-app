'use client';

import React, { useState } from 'react';

interface FuturisticButtonProps {
  text: string;
  onClick: () => void;
}

const FuturisticButton: React.FC<FuturisticButtonProps> = ({ text, onClick }) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  
  return (
    <button
      className={`
        relative overflow-hidden
        py-4 px-8 min-w-[280px]
        font-mono font-bold text-xl
        border-2
        transition-all duration-300
        ${isPressed 
          ? 'bg-[#00ff00] text-black border-[#00ff00] shadow-[0_0_20px_rgba(0,255,0,0.7)]' 
          : isHovering 
            ? 'bg-transparent text-[#00ff00] border-[#00ff00] shadow-[0_0_15px_rgba(0,255,0,0.5)]' 
            : 'bg-transparent text-[#00ff00] border-[#00ff00]/50 shadow-[0_0_10px_rgba(0,255,0,0.3)]'
        }
        flex items-center justify-center
        group
      `}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={onClick}
    >
      <span className="relative z-10">{text}</span>
      
      {/* Button animation effects */}
      <div className={`
        absolute top-0 left-0 w-full h-full 
        before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-[#00ff00]/20
        group-hover:before:transition-all group-hover:before:duration-500 group-hover:before:left-0
      `} />
      
      {/* Corner accents */}
      <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#00ff00]"></span>
      <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00ff00]"></span>
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#00ff00]"></span>
      <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#00ff00]"></span>
    </button>
  );
};

export default FuturisticButton; 