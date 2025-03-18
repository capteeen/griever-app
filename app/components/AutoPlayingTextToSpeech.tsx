'use client';

import React, { useState, useEffect, useRef } from 'react';
import { unlockAudioContext } from '../lib/audioContext';

interface AutoPlayingTextToSpeechProps {
  text: string;
  onPlayingChange?: (isPlaying: boolean) => void;
}

const AutoPlayingTextToSpeech: React.FC<AutoPlayingTextToSpeechProps> = ({ 
  text, 
  onPlayingChange
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Notify parent component of playing state changes
  useEffect(() => {
    if (onPlayingChange) {
      onPlayingChange(isPlaying && !isPaused);
    }
  }, [isPlaying, isPaused, onPlayingChange]);

  // Generate speech and play it automatically
  useEffect(() => {
    if (!text) return;
    
    const generateAndPlaySpeech = async () => {
      try {
        setIsLoading(true);
        
        // Unlock audio context for iOS/Safari
        unlockAudioContext();
        
        // Call our API to generate speech with OpenAI
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate speech');
        }
        
        const data = await response.json();
        
        if (audioRef.current) {
          // Set the audio source
          audioRef.current.src = data.audioUrl;
          
          // Ensure audio element is set up for autoplay
          audioRef.current.autoplay = true;
          audioRef.current.muted = false;
          audioRef.current.setAttribute('playsinline', '');
          
          // Preload audio
          audioRef.current.load();
          
          // Try to play the audio
          try {
            await audioRef.current.play();
          } catch (playError) {
            console.warn('Autoplay prevented by browser:', playError);
            
            // If autoplay fails, programmatically click the play button
            setTimeout(() => {
              if (buttonRef.current) {
                buttonRef.current.click();
              }
            }, 100);
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error generating speech:', error);
        setIsLoading(false);
      }
    };
    
    generateAndPlaySpeech();
    
    // Clean up on component unmount or when text changes
    return () => {
      // Capture the current value of audioRef to avoid React Hook warning
      const audioElement = audioRef.current;
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [text]);
  
  // Handle play button click
  const handlePlayClick = () => {
    if (!audioRef.current) return;
    
    if (isPlaying && !isPaused) {
      // Pause if playing
      audioRef.current.pause();
      setIsPaused(true);
    } else {
      // Play or resume
      unlockAudioContext();
      audioRef.current.play().catch(err => {
        console.warn('Play failed:', err);
      });
    }
  };
  
  // Handle stop button click
  const handleStopClick = () => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setIsPaused(false);
  };

  return (
    <div className="flex items-center space-x-2 my-2">
      <button
        ref={buttonRef}
        onClick={handlePlayClick}
        disabled={isLoading || !text}
        className={`p-2 rounded-full ${
          isLoading
            ? 'bg-[#00ff00]/20 text-[#00ff00]/50'
            : 'bg-[#00ff00]/30 text-[#00ff00] hover:bg-[#00ff00]/40'
        } transition-colors`}
        title={isPlaying ? (isPaused ? 'Resume' : 'Pause') : 'Play'}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-[#00ff00]/50 border-t-[#00ff00] rounded-full animate-spin" />
        ) : isPlaying && !isPaused ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>

      {isPlaying && (
        <button
          onClick={handleStopClick}
          className="p-2 rounded-full bg-red-500/30 text-red-500 hover:bg-red-500/40 transition-colors"
          title="Stop"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
        </button>
      )}
      
      <span className="text-xs text-[#00ff00]/70">
        {isLoading ? 'Generating voice...' : isPlaying ? (isPaused ? 'Paused' : 'Speaking...') : 'AI Voice'}
      </span>
      
      {/* The actual audio element */}
      <audio 
        ref={audioRef}
        onPlay={() => {
          setIsPlaying(true);
          setIsPaused(false);
        }}
        onPause={() => {
          setIsPaused(true);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setIsPaused(false);
        }}
        onError={() => {
          console.error('Audio error');
          setIsPlaying(false);
          setIsPaused(false);
          setIsLoading(false);
        }}
      />
    </div>
  );
};

export default AutoPlayingTextToSpeech; 