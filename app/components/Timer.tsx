'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimerProps {
  duration: number; // Duration in seconds
  onExpire: () => void;
  isActive?: boolean;
}

const Timer: React.FC<TimerProps> = ({ 
  duration = 180, // 3 minutes default
  onExpire,
  isActive = true
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isWarning, setIsWarning] = useState(false);
  
  useEffect(() => {
    if (!isActive) return;
    
    // Calculate minutes and seconds for display
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    // Set warning state when less than 30 seconds remain
    if (timeLeft <= 30 && !isWarning) {
      setIsWarning(true);
    }
    
    // Handle timer expiration
    if (timeLeft === 0) {
      onExpire();
      return;
    }
    
    // Set up countdown interval
    const intervalId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    
    // Clean up interval on unmount or when timer stops
    return () => clearInterval(intervalId);
  }, [timeLeft, isActive, onExpire, isWarning]);
  
  // Format time for display
  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Calculate progress percentage
  const progressPercent = (timeLeft / duration) * 100;
  
  return (
    <div className="relative">
      <motion.div
        className={`font-mono text-lg font-bold p-2 rounded-md ${
          isWarning ? 'text-red-500' : 'text-[#00ff00]'
        }`}
        animate={{ scale: isWarning && timeLeft % 2 === 0 ? 1.1 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {formatTime()}
      </motion.div>
      
      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-1">
        <motion.div
          className={`h-full ${
            isWarning ? 'bg-red-500' : 'bg-[#00ff00]'
          }`}
          initial={{ width: '100%' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      {isWarning && (
        <motion.span
          className="absolute top-0 -right-6 text-xs text-red-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          exit={{ opacity: 0 }}
        >
          !
        </motion.span>
      )}
    </div>
  );
};

export default Timer; 