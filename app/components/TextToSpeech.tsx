'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { unlockAudioContext } from '../lib/audioContext';

interface TextToSpeechProps {
  text: string;
  autoPlay?: boolean;
  onPlayingChange?: (isPlaying: boolean) => void;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ 
  text, 
  autoPlay = false,
  onPlayingChange
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [autoplayAttempted, setAutoplayAttempted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Notify parent component of playing state changes
  useEffect(() => {
    if (onPlayingChange) {
      onPlayingChange(isPlaying && !isPaused);
    }
  }, [isPlaying, isPaused, onPlayingChange]);

  // Generate speech using OpenAI TTS API - wrap in useCallback
  const generateSpeech = useCallback(async () => {
    if (!text || isLoading) return;
    
    try {
      setIsLoading(true);
      
      // Check if we already have this audio file cached
      if (audioRef.current?.src && audioUrl) {
        playAudio();
        return;
      }
      
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
      setAudioUrl(data.audioUrl);
      
      // Create audio element once we have the URL
      if (!audioRef.current) {
        const audio = new Audio(data.audioUrl);
        
        audio.onplay = () => {
          setIsPlaying(true);
          setIsPaused(false);
          setIsLoading(false);
        };
        
        audio.onpause = () => {
          setIsPaused(true);
        };
        
        audio.onended = () => {
          setIsPlaying(false);
          setIsPaused(false);
        };
        
        audio.onerror = () => {
          console.error('Audio playback error');
          setIsPlaying(false);
          setIsPaused(false);
          setIsLoading(false);
        };
        
        // Set autoplay attribute
        audio.autoplay = true;
        audio.muted = false;
        
        audioRef.current = audio;
      } else {
        audioRef.current.src = data.audioUrl;
        audioRef.current.autoplay = true;
        audioRef.current.muted = false;
      }
      
      // Play the audio if autoplay is enabled
      if (autoPlay) {
        // Try to unlock audio context before playing
        unlockAudioContext();
        playAudio();
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error generating speech:', error);
      setIsLoading(false);
    }
  }, [text, isLoading, audioUrl, autoPlay]);

  // Play audio
  const playAudio = () => {
    if (audioRef.current) {
      // Make sure audio context is unlocked
      unlockAudioContext();
      
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Autoplay started successfully
            setIsPlaying(true);
            setIsPaused(false);
          })
          .catch(err => {
            // Autoplay was prevented
            console.warn('Autoplay prevented:', err);
            setIsLoading(false);
            // We'll show the play button so the user can interact
          });
      }
    }
  };

  // Pause audio
  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!audioUrl) {
      generateSpeech();
      return;
    }

    if (isPlaying && !isPaused) {
      pauseAudio();
    } else if (isPaused) {
      playAudio();
    } else {
      playAudio();
    }
  };

  // Stop audio
  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  // Auto-generate and play when text changes if autoPlay is true
  useEffect(() => {
    if (text && autoPlay && !autoplayAttempted) {
      setAutoplayAttempted(true);
      generateSpeech();
    } else if (!text) {
      // Reset audio when text changes
      setAudioUrl(null);
      setAutoplayAttempted(false);
      if (audioRef.current) {
        audioRef.current.src = '';
      }
    }
    
    // Cleanup on unmount
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [text, autoPlay, autoplayAttempted, generateSpeech]);

  return (
    <div className="flex items-center space-x-2 my-2">
      <button
        onClick={togglePlayPause}
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
          onClick={stopAudio}
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
        {isLoading ? 'Generating voice...' : isPlaying ? (isPaused ? 'Paused' : 'Speaking...') : autoplayAttempted ? 'Click to play' : 'AI Voice'}
      </span>
    </div>
  );
};

export default TextToSpeech; 