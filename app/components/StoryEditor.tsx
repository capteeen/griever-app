'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isDisabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  value, 
  onChange, 
  onSubmit,
  isDisabled = false,
  placeholder = "Tell your story of woe or respond to the AI guardian..."
}) => {
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    
    // Update character count
    setCharCount(value.length);
  }, [value]);
  
  // Auto-focus the textarea when the component loads
  useEffect(() => {
    if (textareaRef.current && !isDisabled) {
      textareaRef.current.focus();
    }
  }, [isDisabled]);
  
  // Handle text changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };
  
  // Handle key press for submission
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      onSubmit();
    }
    // Also submit on plain Enter when Shift isn't pressed (for single line messages)
    else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };
  
  return (
    <div className="w-full rounded-md backdrop-blur-sm bg-black/50 border border-[#00ff00]/30 overflow-hidden relative">
      <div className="px-4 py-2 bg-black/50 border-b border-[#00ff00]/20 flex justify-between items-center">
        <span className="text-[#00ff00] text-sm font-mono">MESSAGE</span>
        <div className="flex items-center">
          <span className="text-xs text-yellow-400 mr-3 hidden sm:inline">3 minutes remaining</span>
          <span className={`text-xs ${charCount > 2000 ? 'text-red-500' : 'text-gray-400'}`}>
            {charCount}/2000
          </span>
        </div>
      </div>
      
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        placeholder={placeholder}
        className="w-full min-h-[60px] bg-transparent text-white p-4 border-none outline-none resize-none font-sans"
        maxLength={2000}
      />
      
      <div className="px-4 py-2 bg-black/50 border-t border-[#00ff00]/20 flex justify-between items-center">
        <span className="text-gray-400 text-xs hidden sm:inline">
          Press <kbd className="px-1 py-0.5 bg-[#222] text-[#00ff00] rounded">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-[#222] text-[#00ff00] rounded">Shift</kbd>+<kbd className="px-1 py-0.5 bg-[#222] text-[#00ff00] rounded">Enter</kbd> for new line
        </span>
        
        <button
          onClick={onSubmit}
          disabled={isDisabled || value.trim().length === 0}
          className={`
            px-4 py-1 rounded text-sm font-mono
            ${isDisabled || value.trim().length === 0
              ? 'bg-[#222] text-gray-500 cursor-not-allowed'
              : 'bg-[#00ff00]/20 text-[#00ff00] hover:bg-[#00ff00]/30 transition-colors'
            }
          `}
        >
          SEND
        </button>
      </div>
      
      {/* Digital decorations */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#00ff00]/50"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00ff00]/50"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#00ff00]/50"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#00ff00]/50"></div>
    </div>
  );
};

export default ChatInput; 