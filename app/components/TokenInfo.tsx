'use client';

import React from 'react';
import Image from 'next/image';
import ContractAddressBox from './ContractAddressBox';

const TokenInfo: React.FC = () => {
  return (
    <div className="w-full max-w-md">
      <div className="backdrop-blur-sm rounded-xl border border-[#00ff00]/30 bg-black/50 shadow-[0_0_15px_rgba(0,255,0,0.2)] overflow-hidden">
        <div className="p-4 border-b border-[#00ff00]/20">
          <div className="flex items-center">
            <Image
              src="/solana-icon.svg"
              alt="Solana Logo"
              width={24}
              height={24}
              className="mr-2"
            />
            <h2 className="text-xl font-bold text-[#00ff00] font-mono">$GRIEVER TOKEN</h2>
          </div>
          
          <p className="mt-2 text-sm text-white/80">
            The official token of the GRIEVER challenge - powered by Solana
          </p>
        </div>
        
        <div className="p-4">
          <ContractAddressBox />
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center p-2 bg-black/30 rounded-md border border-[#00ff00]/10">
              <div className="text-xs text-[#00ff00]/70 mb-1">Total Supply</div>
              <div className="text-white font-mono font-bold">1,000,000</div>
            </div>
            
            <div className="text-center p-2 bg-black/30 rounded-md border border-[#00ff00]/10">
              <div className="text-xs text-[#00ff00]/70 mb-1">Decimals</div>
              <div className="text-white font-mono font-bold">9</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenInfo; 