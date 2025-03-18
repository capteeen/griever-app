'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import TextToSpeech from './TextToSpeech';
import AutoPlayingTextToSpeech from './AutoPlayingTextToSpeech';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatMessageProps {
  message: Message;
  isLatest: boolean;
  onSpeakingChange?: (speaking: boolean) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isLatest,
  onSpeakingChange 
}) => {
  const isAI = message.role === 'assistant';
  
  // Handle speech state changes from the TextToSpeech component
  const handleSpeechStateChange = (isPlaying: boolean) => {
    if (onSpeakingChange) {
      onSpeakingChange(isPlaying);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-full flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}
    >
      <div 
        className={`max-w-[80%] ${
          isAI 
            ? 'bg-[#111]/80 border-l-2 border-[#00ff00]' 
            : 'bg-[#222]/80 border-r-2 border-white/30'
        } backdrop-blur-sm rounded-md overflow-hidden`}
      >
        {/* Message header */}
        <div 
          className={`px-4 py-2 text-xs font-bold ${
            isAI ? 'text-[#00ff00]' : 'text-white'
          } flex items-center justify-between border-b border-white/10`}
        >
          {isAI ? 'AI GUARDIAN' : 'YOU'}
          
          {/* Add speech for AI messages using the auto-playing component */}
          {isAI && (
            <AutoPlayingTextToSpeech 
              text={message.content} 
              onPlayingChange={handleSpeechStateChange}
            />
          )}
        </div>
        
        {/* Message body */}
        <div className="p-4 text-white whitespace-pre-wrap">
          {message.content}
        </div>
        
        {/* Timestamp */}
        <div className="px-4 py-1 text-[9px] text-gray-400 bg-black/30">
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage; 