'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimerProps {
  initialSeconds: number;
  onComplete?: () => void;
}

const Timer: React.FC<TimerProps> = ({ initialSeconds, onComplete }) => {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const [isWarning, setIsWarning] = useState(false);
  
  useEffect(() => {
    if (!isRunning || remainingSeconds <= 0) {
      if (remainingSeconds <= 0 && onComplete) {
        onComplete();
      }
      return;
    }
    
    // Set warning state when less than 30 seconds remain
    if (remainingSeconds <= 30 && !isWarning) {
      setIsWarning(true);
    }
    
    const timerId = setTimeout(() => {
      setRemainingSeconds(seconds => Math.max(0, seconds - 1));
    }, 1000);
    
    return () => clearTimeout(timerId);
  }, [remainingSeconds, isRunning, onComplete, isWarning]);
  
  // Format time as mm:ss
  const formatTime = () => {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const progressPercent = (remainingSeconds / initialSeconds) * 100;
  
  return (
    <div className="relative">
      <motion.div
        className={`font-mono text-lg font-bold p-2 rounded-md ${
          isWarning ? 'text-red-500' : 'text-[#00ff00]'
        }`}
        animate={{ scale: isWarning && remainingSeconds % 2 === 0 ? 1.1 : 1 }}
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