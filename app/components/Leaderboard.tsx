'use client';

import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '@/app/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/leaderboard', {
          // Add cache control to prevent stale data
          cache: 'no-store'
        }).catch(err => {
          console.error('Network error:', err);
          throw new Error('Network error. Please check your connection.');
        });
        
        if (!response.ok) {
          // Check for specific error status
          if (response.status === 500) {
            throw new Error('Server error. Leaderboard data might not be available yet.');
          } else {
            throw new Error(`Failed to fetch leaderboard (${response.status})`);
          }
        }
        
        const data = await response.json().catch(err => {
          console.error('JSON parsing error:', err);
          throw new Error('Error parsing leaderboard data.');
        });
        
        // Handle empty or invalid data
        if (!data || !Array.isArray(data)) {
          console.warn('Received invalid leaderboard data:', data);
          setEntries([]);
          return;
        }
        
        // Ensure the data is in the right format
        const formattedEntries = data.map((entry, index) => ({
          ...entry,
          rank: entry.rank || index + 1,
          // Convert timestamp to number if it's a string
          timestamp: typeof entry.timestamp === 'string' 
            ? parseInt(entry.timestamp) 
            : entry.timestamp
        }));
        
        setEntries(formattedEntries);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        // Set a user-friendly error message
        setError(err instanceof Error ? err.message : 'Could not load leaderboard data.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboard();
    
    // Refresh leaderboard every minute
    const intervalId = setInterval(fetchLeaderboard, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  if (isLoading) {
    return (
      <div className="bg-black/70 backdrop-blur-md border border-[#00ff00]/30 rounded-lg p-6 w-full">
        <h2 className="text-[#00ff00] font-mono text-xl mb-4 text-center">TOP CONTENDERS</h2>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#00ff00]/50 border-t-[#00ff00] rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-[#00ff00]/70 ml-3">Loading leaderboard...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-black/70 backdrop-blur-md border border-[#00ff00]/30 rounded-lg p-6 w-full">
        <h2 className="text-[#00ff00] font-mono text-xl mb-4 text-center">TOP CONTENDERS</h2>
        <div className="text-red-500 text-center p-6 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#00ff00]/20 hover:bg-[#00ff00]/30 text-[#00ff00] text-sm py-1 px-3 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  if (entries.length === 0) {
    return (
      <div className="bg-black/70 backdrop-blur-md border border-[#00ff00]/30 rounded-lg p-6 w-full">
        <h2 className="text-[#00ff00] font-mono text-xl mb-4 text-center">TOP CONTENDERS</h2>
        <div className="text-white/70 text-center p-6">
          No stories submitted yet. Be the first to convince the AI!
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-black/70 backdrop-blur-md border border-[#00ff00]/30 rounded-lg p-6 w-full">
      <h2 className="text-[#00ff00] font-mono text-xl mb-4 text-center">TOP CONTENDERS</h2>
      
      <div className="overflow-hidden">
        <div className="grid grid-cols-12 text-xs font-mono text-white/50 mb-2 px-2">
          <div className="col-span-1">#</div>
          <div className="col-span-3">USER</div>
          <div className="col-span-4">STORY</div>
          <div className="col-span-2 text-center">AUTH</div>
          <div className="col-span-2 text-center">IMPACT</div>
        </div>
        
        <AnimatePresence>
          {entries.map((entry, index) => {
            // Determine styling for rank
            const rankColor = 
              index === 0 ? 'text-yellow-400' : 
              index === 1 ? 'text-gray-300' : 
              index === 2 ? 'text-amber-600' : 'text-white/70';
              
            // Determine row styling based on worthy status
            const worthyColor = 
              entry.worthy === 'YES' ? 'border-green-500/30' : 
              entry.worthy === 'MAYBE' ? 'border-yellow-500/30' : 'border-red-500/30';
              
            return (
              <motion.div
                key={entry.userId || index}
                className={`grid grid-cols-12 text-sm py-2 px-2 border-b ${worthyColor} hover:bg-[#00ff00]/5 transition-colors`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className={`col-span-1 font-bold font-mono ${rankColor}`}>
                  {index + 1}
                </div>
                <div className="col-span-3 text-white overflow-hidden text-ellipsis whitespace-nowrap">
                  {entry.username || 'Anonymous User'}
                </div>
                <div className="col-span-4 text-white/70 text-xs italic overflow-hidden text-ellipsis whitespace-nowrap" title={entry.storyExcerpt}>
                  "{entry.storyExcerpt || 'No story excerpt available'}..."
                </div>
                <div className="col-span-2 text-center">
                  <span className="font-mono text-white">
                    {entry.authenticity || 0}
                    <span className="text-white/50 text-xs">/10</span>
                  </span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="font-mono text-white">
                    {entry.emotionalImpact || 0}
                    <span className="text-white/50 text-xs">/10</span>
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {/* Last updated info */}
      <div className="text-center mt-4 text-xs text-white/40">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default Leaderboard; 