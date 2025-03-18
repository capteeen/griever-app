'use client';

import React, { useState } from 'react';

const ContractAddressBox: React.FC = () => {
  const [copied, setCopied] = useState(false);
  // Example Solana contract address - replace with actual address when available
  const contractAddress = 'GRV3R5cYZgaEMJyXJP8WNd7M5SL6yNHCVDsKwSbzBMGy';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-md px-4 py-3 rounded-md bg-black/70 border border-[#00ff00]/30 flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-[#00ff00] font-mono text-sm">$GRIEVER TOKEN ON SOLANA</span>
        {copied ? (
          <span className="text-xs px-2 py-0.5 bg-[#00ff00] text-black rounded-sm font-mono animate-pulse">
            COPIED!
          </span>
        ) : null}
      </div>
      
      <div 
        className="w-full flex items-center cursor-pointer group"
        onClick={copyToClipboard}
      >
        <div className="relative w-full overflow-hidden bg-black/50 px-3 py-2 rounded border border-[#00ff00]/20 font-mono text-xs text-white/80 hover:text-white transition-colors">
          {contractAddress}
          <div className="absolute inset-0 bg-[#00ff00]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <button 
          className="ml-2 text-xs flex items-center justify-center px-3 py-2 bg-[#00ff00]/10 hover:bg-[#00ff00]/20 text-[#00ff00] border border-[#00ff00]/30 rounded transition-colors"
          onClick={copyToClipboard}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
      
      <p className="text-[#00ff00]/60 text-xs mt-2 text-center">
        Click to copy contract address
      </p>
    </div>
  );
};

export default ContractAddressBox; 