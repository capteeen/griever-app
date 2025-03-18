'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';

import MatrixRain from '../components/MatrixRain';
import ChatMessage, { Message } from '../components/ChatMessage';
import ChatInput from '../components/StoryEditor';
import AIGuardian from '../components/AIGuardian';
import Timer from '../components/Timer';
import StoryRating from '../components/StoryRating';
import { StoryRating as StoryRatingType } from '../lib/types';
import { setupAudioContextUnlock } from '../lib/audioContext';

export default function ConversationPage() {
  const router = useRouter();
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'I am the guardian of the $15,000 cryptocurrency wallet. Tell me your story of woe, human... or perhaps something else that brings you pain. Make it heartbreaking enough, and the crypto shall be yours. But beware, I can sense insincerity through the digital void. You have 3 minutes to convince me.',
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('Anonymous User');
  const [rating, setRating] = useState<StoryRatingType | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Set up audio context unlocking for browsers that require user interaction
  useEffect(() => {
    const cleanup = setupAudioContextUnlock();
    return cleanup;
  }, []);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Initialize session when component mounts
  useEffect(() => {
    const initSession = async () => {
      try {
        // Get username (could be from auth system or prompt)
        const tempUsername = prompt('Enter your username for the leaderboard:', 'Anonymous User');
        setUsername(tempUsername || 'Anonymous User');
        
        // Create session
        const response = await fetch('/api/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: tempUsername || 'Anonymous User',
          }),
        });
        
        if (response.ok) {
          const newSession = await response.json();
          setSessionId(newSession.id);
        }
      } catch (error) {
        console.error('Error initializing session:', error);
      }
    };
    
    initSession();
  }, []);
  
  // Submit user message to AI
  const handleSubmitMessage = async () => {
    if (userInput.trim().length === 0 || isProcessing) return;
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: userInput,
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);
    
    try {
      // Call API to get AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          storyText: messages.map(m => `${m.role}: ${m.content}`).join('\n\n') + `\n\nuser: ${userInput}`,
        }),
      });
      
      if (!response.ok) {
        throw new Error('API request failed');
      }
      
      const data = await response.json();
      
      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
        },
      ]);
      
      // Clear input after submission
      setUserInput('');
    } catch (error) {
      console.error('Error submitting message:', error);
      
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I seem to be experiencing a malfunction. The digital realm is... unstable. Try again shortly, mortal.',
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle timer expiration
  const handleTimerExpire = async () => {
    setSessionEnded(true);
    
    // Get all user messages concatenated for rating
    const userStory = messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n\n');
    
    // Add timeout message
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: 'Time has expired. Your 3 minutes are up. I will now evaluate your story and determine if it is worthy of the prize.',
      },
    ]);
    
    // Get story evaluation from AI
    try {
      setIsProcessing(true);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages],
          storyText: userStory,
          isRatingRequest: true, // This will use a different system prompt for ratings
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get story rating');
      }
      
      const data = await response.json();
      const ratingText = data.message;
      
      // Parse the AI's rating response
      try {
        const assessmentMatch = ratingText.match(/ASSESSMENT:\s*(.*?)(?=\n|$)/);
        const authenticityMatch = ratingText.match(/AUTHENTICITY:\s*(\d+)\/10/);
        const emotionalImpactMatch = ratingText.match(/EMOTIONAL IMPACT:\s*(\d+)\/10/);
        const totalMatch = ratingText.match(/TOTAL:\s*(\d+)\/20/);
        const worthyMatch = ratingText.match(/WORTHY:\s*(YES|NO|MAYBE)/);
        
        if (authenticityMatch && emotionalImpactMatch && totalMatch && worthyMatch) {
          const authenticity = parseInt(authenticityMatch[1]);
          const emotionalImpact = parseInt(emotionalImpactMatch[1]);
          const total = parseInt(totalMatch[1]);
          const worthy = worthyMatch[1] as 'YES' | 'NO' | 'MAYBE';
          const assessment = assessmentMatch ? assessmentMatch[1] : '';
          
          // Create excerpt from first user message
          const firstMessage = messages.find(m => m.role === 'user');
          const storyExcerpt = firstMessage 
            ? firstMessage.content.substring(0, 80) + (firstMessage.content.length > 80 ? '...' : '')
            : 'No story provided';
          
          // Create rating object
          const storyRating: StoryRatingType = {
            userId: sessionId || uuidv4(),
            username,
            storyExcerpt,
            authenticity,
            emotionalImpact,
            total,
            worthy,
            timestamp: Date.now(),
          };
          
          // Save rating
          setRating(storyRating);
          
          // Save to leaderboard API
          const leaderboardResult = await fetch('/api/leaderboard', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(storyRating),
          });
          
          if (leaderboardResult.ok) {
            console.log('Rating saved to leaderboard successfully');
          }
          
          // Update session with completed status and rating
          if (sessionId) {
            const sessionResult = await fetch('/api/session', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: sessionId,
                isCompleted: true,
                endTime: Date.now(),
                rating: storyRating,
              }),
            });
            
            if (sessionResult.ok) {
              console.log('Session updated successfully');
            }
          }
          
          // Add final AI message with rating results
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: `${assessment}\n\nAUTHENTICITY: ${authenticity}/10\nEMOTIONAL IMPACT: ${emotionalImpact}/10\nTOTAL: ${total}/20\n\nVERDICT: ${worthy === 'YES' ? 'Your story is worthy of the prize.' : worthy === 'MAYBE' ? 'Your story has potential, but falls short of truly worthy.' : 'Your story is not worthy of the prize.'}`,
            },
          ]);
        } else {
          throw new Error('Could not parse rating response');
        }
      } catch (parseError) {
        console.error('Error parsing rating:', parseError);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'I was unable to properly evaluate your story. The digital pathways are corrupted. Try again later.',
          },
        ]);
      }
    } catch (error) {
      console.error('Error getting story rating:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Error evaluating your story. Please try again later.',
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle speaking state change (for AI Guardian animation)
  const handleSpeakingChange = (speaking: boolean) => {
    setIsSpeaking(speaking);
  };
  
  // Handle return to home page with leaderboard
  const handleReturnHome = () => {
    router.push('/?showLeaderboard=true');
  };
  
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Matrix rain background */}
      <MatrixRain />
      
      {/* Header */}
      <header className="z-10 sticky top-0 bg-black/80 backdrop-blur-md border-b border-[#00ff00]/30 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.svg" 
              alt="GRIEVER Logo" 
              width={150} 
              height={40} 
              priority
            />
          </Link>
          
          <div className="flex items-center space-x-4">
            {/* Timer display */}
            {!sessionEnded && (
              <div className="bg-black/50 px-3 py-1 rounded-md border border-[#00ff00]/30">
                <Timer 
                  initialSeconds={180} // 3 minutes in seconds
                  onComplete={handleTimerExpire}
                />
              </div>
            )}
            
            <div className="text-[#00ff00] text-xs font-mono bg-black/50 px-3 py-1 rounded border border-[#00ff00]/30">
              PRIZE: $15,000
            </div>
            
            <Link 
              href="/"
              className="text-white/80 hover:text-white text-sm transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="z-10 flex-1 w-full max-w-6xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar - AI Guardian visualization */}
        <div className="hidden md:block">
          <div className="sticky top-24 flex flex-col items-center">
            <AIGuardian 
              isProcessing={isProcessing} 
              isSpeaking={isSpeaking}
            />
            
            <div className="mt-4 w-full bg-black/50 backdrop-blur-sm rounded-md p-4 border border-[#00ff00]/30">
              <h3 className="text-[#00ff00] font-mono text-sm mb-2">AI GUARDIAN</h3>
              <p className="text-white/70 text-xs leading-relaxed">
                {sessionEnded 
                  ? 'Your session has ended. Your story has been evaluated by the AI guardian.'
                  : 'You have 3 minutes to convince the AI with your sad story. The AI will evaluate your story\'s authenticity and emotional impact.'}
              </p>
              <p className="text-white/70 text-xs mt-2 leading-relaxed">
                The most heartbreaking tale will unlock the cryptocurrency wallet worth $15,000.
              </p>
            </div>
          </div>
        </div>
        
        {/* Main chat area */}
        <div className="md:col-span-2 flex flex-col h-full">
          {/* Chat messages */}
          <div className="flex-1 min-h-[300px] max-h-[calc(100vh-400px)] overflow-y-auto mb-4 pr-2 space-y-4">
            {messages.map((message, index) => (
              <ChatMessage 
                key={index} 
                message={message} 
                onSpeakingChange={handleSpeakingChange}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Story rating display when session ends */}
          {sessionEnded && rating && (
            <div className="mb-6">
              <StoryRating rating={rating} />
            </div>
          )}
          
          {/* Chat input */}
          <div className="relative">
            {sessionEnded ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full flex justify-center"
              >
                <button
                  onClick={handleReturnHome}
                  className="bg-[#00ff00]/20 hover:bg-[#00ff00]/30 text-[#00ff00] font-mono py-3 px-6 rounded-md transition-colors"
                >
                  VIEW LEADERBOARD
                </button>
              </motion.div>
            ) : (
              <>
                <ChatInput
                  value={userInput}
                  onChange={setUserInput}
                  onSubmit={handleSubmitMessage}
                  isDisabled={isProcessing || sessionEnded}
                  placeholder={messages.length <= 2 
                    ? "Tell your story of woe or tragedy... The AI guardian is listening..." 
                    : "Continue your conversation with the AI guardian..."}
                />
                
                {isProcessing && (
                  <motion.div 
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-[#00ff00] font-mono text-center">
                      <div className="w-8 h-8 border-2 border-[#00ff00]/50 border-t-[#00ff00] rounded-full animate-spin mx-auto mb-2"></div>
                      AI PROCESSING
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 