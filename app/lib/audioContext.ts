'use client';

// This file provides a utility to initialize and unlock the audio context
// for browsers that require user interaction before allowing audio playback

let audioContextInstance: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null; // We're on the server side
  }
  
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  
  if (!AudioContextClass) {
    console.warn('AudioContext is not supported in this browser');
    return null;
  }
  
  if (!audioContextInstance) {
    audioContextInstance = new AudioContextClass();
  }
  
  return audioContextInstance;
}

export function unlockAudioContext(): void {
  const audioContext = getAudioContext();
  
  if (!audioContext) return;
  
  // Resume the audio context if it's in a suspended state
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(error => {
      console.error('Failed to resume audio context:', error);
    });
  }
  
  // Create and play a silent buffer to unlock the audio context on iOS
  const buffer = audioContext.createBuffer(1, 1, 22050);
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start(0);
}

// Function to set up event listeners for unlocking audio
export function setupAudioContextUnlock(): () => void {
  if (typeof window === 'undefined') {
    return () => {}; // No cleanup needed on server
  }
  
  const unlockOnUserAction = () => {
    unlockAudioContext();
    
    // Clean up the event listeners once we've initiated an unlock
    document.removeEventListener('click', unlockOnUserAction);
    document.removeEventListener('touchstart', unlockOnUserAction);
    document.removeEventListener('touchend', unlockOnUserAction);
    document.removeEventListener('keydown', unlockOnUserAction);
  };
  
  // Add event listeners to enable audio on user interaction
  document.addEventListener('click', unlockOnUserAction);
  document.addEventListener('touchstart', unlockOnUserAction);
  document.addEventListener('touchend', unlockOnUserAction);
  document.addEventListener('keydown', unlockOnUserAction);
  
  // Return cleanup function
  return () => {
    document.removeEventListener('click', unlockOnUserAction);
    document.removeEventListener('touchstart', unlockOnUserAction);
    document.removeEventListener('touchend', unlockOnUserAction);
    document.removeEventListener('keydown', unlockOnUserAction);
  };
} 