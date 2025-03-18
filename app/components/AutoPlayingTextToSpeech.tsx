'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { unlockAudioContext } from '../lib/audioContext';

interface AutoPlayingTextToSpeechProps {
  text: string;
  onPlayingChange?: (isPlaying: boolean) => void;
  autoplay?: boolean;
}

const AutoPlayingTextToSpeech: React.FC<AutoPlayingTextToSpeechProps> = ({ 
  text, 
  onPlayingChange,
  autoplay = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Notify parent component of playing state changes
  useEffect(() => {
    if (onPlayingChange) {
      onPlayingChange(isPlaying && !isPaused);
    }
  }, [isPlaying, isPaused, onPlayingChange]);

  // Clean up function with proper ref handling
  const cleanupAudio = useCallback(() => {
    // Store ref in a variable to avoid React hooks exhaustive-deps warning
    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
    }
  }, []);

  // Generate speech but don't auto-play it, just prepare it
  useEffect(() => {
    if (!text) return;
    
    setErrorMessage(null);
    setIsAudioReady(false);
    
    const generateSpeech = async () => {
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
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.message || `Failed to generate speech: ${response.status}`);
        }
        
        // Get the audio blob directly from the response
        const audioBlob = await response.blob();
        
        if (!audioBlob || audioBlob.size === 0) {
          throw new Error('Empty audio response received');
        }
        
        // Create an object URL from the blob
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          // Set the audio source to the blob URL
          audioRef.current.src = audioUrl;
          
          // Configure audio element but don't autoplay yet
          audioRef.current.autoplay = false; // We'll control this manually
          audioRef.current.muted = false;
          audioRef.current.setAttribute('playsinline', '');
          
          // Preload audio
          audioRef.current.load();
          
          setIsAudioReady(true);
          
          // Only try autoplay if specified and not the first text
          if (autoplay) {
            try {
              await audioRef.current.play();
            } catch (playError) {
              console.warn('Autoplay prevented by browser:', playError);
              // Don't try to automatically click the button
              // Let user click manually for first interaction
            }
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error generating speech:', error);
        setErrorMessage(error instanceof Error ? error.message : 'Failed to generate speech');
        setIsLoading(false);
      }
    };
    
    generateSpeech();
    
    // Clean up on component unmount or when text changes
    return () => {
      cleanupAudio();
      // Revoke any object URLs we created to prevent memory leaks
      if (audioRef.current?.src && audioRef.current.src.startsWith('blob:')) {
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, [text, cleanupAudio, autoplay]);
  
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
        setErrorMessage('Failed to play audio: ' + (err instanceof Error ? err.message : 'Unknown error'));
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
        disabled={isLoading || !text || !isAudioReady}
        className={`p-2 rounded-full ${
          isLoading || !isAudioReady
            ? 'bg-[#00ff00]/20 text-[#00ff00]/50'
            : 'bg-[#00ff00]/30 text-[#00ff00] hover:bg-[#00ff00]/40'
        } transition-colors ${!isAudioReady && !isLoading ? 'animate-pulse' : ''}`}
        title={isPlaying ? (isPaused ? 'Resume' : 'Pause') : (isAudioReady ? 'Play' : 'Preparing audio...')}
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
        {isLoading ? 'Generating voice...' : 
         errorMessage ? <span className="text-red-400">{errorMessage}</span> : 
         !isAudioReady ? 'Preparing audio...' :
         isPlaying ? (isPaused ? 'Paused' : 'Speaking...') : 'Click to play AI voice'}
      </span>
      
      {/* The actual audio element */}
      <audio 
        ref={audioRef}
        onPlay={() => {
          setIsPlaying(true);
          setIsPaused(false);
          setErrorMessage(null);
        }}
        onPause={() => {
          setIsPaused(true);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setIsPaused(false);
        }}
        onError={(e) => {
          const error = e.currentTarget.error;
          console.error('Audio error', error);
          setErrorMessage(`Audio error: ${error?.message || 'Unknown error'}`);
          setIsPlaying(false);
          setIsPaused(false);
          setIsLoading(false);
        }}
      />
    </div>
  );
};

export default AutoPlayingTextToSpeech; 