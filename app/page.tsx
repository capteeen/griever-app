'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import MatrixRain from './components/MatrixRain';
import PrizeDisplay from './components/PrizeDisplay';
import FuturisticButton from './components/FuturisticButton';
import TokenInfo from './components/TokenInfo';
import Leaderboard from './components/Leaderboard';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  // Check if we should show the leaderboard (from URL param)
  useEffect(() => {
    const shouldShowLeaderboard = searchParams.get('showLeaderboard') === 'true';
    if (shouldShowLeaderboard) {
      setShowLeaderboard(true);
    }
  }, [searchParams]);
  
  const startConversation = () => {
    setIsLoading(true);
    
    // Simulate a brief loading state before navigation
    setTimeout(() => {
      setIsLoading(false);
      router.push('/conversation');
    }, 1000);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center">
      {/* Matrix rain background effect */}
      <MatrixRain />
      
      {/* Main content area */}
      <main className="z-10 w-full max-w-6xl mx-auto flex flex-col items-center justify-center py-20 px-4">
        {/* Logo */}
        <div className="mb-8">
          <Image 
            src="/logo.svg" 
            alt="GRIEVER Logo" 
            width={300} 
            height={80} 
            priority
          />
        </div>
        
        {/* Tagline */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-8 font-mono">
          <span className="text-[#00ff00]">Break</span> the <span className="text-[#00ff00]">AI</span>, 
          <span className="block">Win the <span className="text-[#00ff00]">Crypto</span></span>
        </h1>
        
        {/* Description */}
        <p className="text-lg text-gray-300 text-center max-w-2xl mb-12 leading-relaxed">
          Engage in a dark conversation with our AI guardian. Share your most heartbreaking tale - if your story is emotional enough to convince the AI, 
          you'll win the entire cryptocurrency wallet worth <span className="text-[#00ff00] font-bold">$15,000</span>. Every response is delivered with sardonic voice commentary.
        </p>
        
        {/* Prize Display */}
        <div className="mb-8 w-full max-w-md">
          <PrizeDisplay />
        </div>
        
        {/* Start Conversation Button */}
        <div className="mb-12">
          <FuturisticButton 
            text={isLoading ? "INITIALIZING..." : "BEGIN CONVERSATION"} 
            onClick={startConversation} 
          />
        </div>
        
        {/* Leaderboard Section */}
        <div className="mb-12 w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl text-[#00ff00] font-mono">LEADERBOARD</h2>
            <button 
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="bg-[#00ff00]/20 hover:bg-[#00ff00]/30 text-[#00ff00] text-sm font-mono py-1 px-3 rounded transition-colors"
            >
              {showLeaderboard ? "HIDE" : "SHOW"}
            </button>
          </div>
          
          {showLeaderboard && <Leaderboard />}
        </div>
        
        {/* Token Info with Contract Address */}
        <div className="mb-12 w-full max-w-md">
          <h3 className="text-center text-[#00ff00] font-mono text-lg mb-3">TOKEN DETAILS</h3>
          <TokenInfo />
        </div>
        
        {/* Disclaimer */}
        <p className="text-xs text-gray-500 mt-12 text-center max-w-lg">
          By participating, you agree to our terms and conditions. The AI determines the winner based on emotional impact, conversation depth, and storytelling. 
          Results are final. The cryptocurrency wallet private key will be transferred to the winner securely.
        </p>
      </main>
    </div>
  );
}
