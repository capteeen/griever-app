'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AIGuardianProps {
  isProcessing?: boolean;
  isSpeaking?: boolean;
}

const AIGuardian: React.FC<AIGuardianProps> = ({ 
  isProcessing = false,
  isSpeaking = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Animation for the AI Guardian visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = 200;
    canvas.height = 200;
    
    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      radius: number;
      color: string;
      speedX: number;
      speedY: number;
    }> = [];
    
    // Create particles
    const createParticles = () => {
      particles = [];
      
      // Create matrix-like digital particles
      for (let i = 0; i < 50; i++) {
        const radius = Math.random() * 2 + 1;
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius,
          color: `rgba(0, ${Math.floor(Math.random() * 155) + 100}, 0, ${Math.random() * 0.8 + 0.2})`,
          speedX: (Math.random() - 0.5) * (isProcessing ? 3 : 1),
          speedY: (Math.random() - 0.5) * (isProcessing ? 3 : 1),
        });
      }
    };
    
    // Draw menacing guardian face
    const drawGuardian = () => {
      ctx.save();
      
      // Base circle for head
      ctx.beginPath();
      ctx.arc(100, 90, 40, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fill();
      
      // Glowing border effect
      const glowIntensity = isSpeaking ? 0.7 : 0.4;
      ctx.strokeStyle = `rgba(0, 255, 0, ${glowIntensity})`;
      ctx.lineWidth = isSpeaking ? 2 : 1;
      ctx.stroke();
      
      // Add secondary circuit pattern
      ctx.beginPath();
      ctx.arc(100, 90, 45, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 255, 0, ${glowIntensity / 2})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
      
      // Eyes
      const time = Date.now() * 0.001;
      const blinkRate = Math.sin(time * 0.5);
      let eyeHeight = 10;
      
      // Occasionally blink
      if (blinkRate > 0.95) {
        eyeHeight = 1;
      }
      
      // Draw glowing eyes
      ctx.beginPath();
      ctx.ellipse(80, 80, 10, eyeHeight, 0, 0, Math.PI * 2);
      ctx.ellipse(120, 80, 10, eyeHeight, 0, 0, Math.PI * 2);
      
      // Make eyes glow when speaking or processing
      const eyeGlow = isProcessing ? 1 : (isSpeaking ? 0.9 : 0.7);
      const gradient = ctx.createRadialGradient(100, 80, 0, 100, 80, 50);
      gradient.addColorStop(0, `rgba(0, 255, 0, ${eyeGlow})`);
      gradient.addColorStop(1, `rgba(0, 100, 0, ${eyeGlow / 3})`);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Eye pupils - follow a circular path when speaking
      const pupilSize = Math.sin(time) * (isSpeaking ? 3 : 2) + (isSpeaking ? 4 : 3);
      
      // Add movement to pupils when speaking or processing
      let pupilOffsetX = 0;
      let pupilOffsetY = 0;
      
      if (isSpeaking) {
        // Circular movement pattern
        pupilOffsetX = Math.sin(time * 3) * 3;
        pupilOffsetY = Math.cos(time * 2) * 3;
      } else if (isProcessing) {
        // Rapid scanning movement
        pupilOffsetX = Math.sin(time * 8) * 4;
        pupilOffsetY = Math.cos(time * 7) * 2;
      }
      
      ctx.beginPath();
      ctx.arc(80 + pupilOffsetX, 80 + pupilOffsetY, pupilSize, 0, Math.PI * 2);
      ctx.arc(120 + pupilOffsetX, 80 + pupilOffsetY, pupilSize, 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.fill();
      
      // Circuit patterns around head - animate when speaking
      ctx.beginPath();
      const circuitCount = isSpeaking ? 12 : 8;
      for (let i = 0; i < circuitCount; i++) {
        const angle = (i / circuitCount) * Math.PI * 2 + (isSpeaking ? time * 0.2 : 0);
        const distance = isSpeaking ? 55 : 50;
        const x = 100 + Math.cos(angle) * distance;
        const y = 90 + Math.sin(angle) * distance;
        ctx.moveTo(100, 90);
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(0, 255, 0, ${isSpeaking ? 0.6 : 0.3})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Mouth - changes based on state
      ctx.beginPath();
      if (isProcessing) {
        // Processing: Square "loading" mouth
        ctx.rect(85, 105, 30, 10);
        ctx.fillStyle = '#00ff00';
        ctx.fill();
        
        // Add a loading animation
        const loadWidth = (Math.sin(time * 4) + 1) / 2 * 30;
        ctx.beginPath();
        ctx.rect(85, 105, loadWidth, 10);
        ctx.fillStyle = '#000';
        ctx.fill();
      } else if (isSpeaking) {
        // Speaking: Oscillating mouth
        const mouthHeight = Math.sin(time * 8) * 6 + 8;
        const mouthWidth = 25 + Math.sin(time * 6) * 5;
        ctx.ellipse(100, 110, mouthWidth, mouthHeight, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 0, 0.6)`;
        ctx.fill();
        
        // Inner mouth
        ctx.beginPath();
        ctx.ellipse(100, 110, mouthWidth * 0.7, mouthHeight * 0.7, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
      } else {
        // Default: Straight line
        ctx.moveTo(80, 110);
        ctx.lineTo(120, 110);
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      ctx.restore();
    };
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background glow
      const bgGradient = ctx.createRadialGradient(100, 90, 10, 100, 90, 100);
      bgGradient.addColorStop(0, 'rgba(0, 50, 0, 0.1)');
      bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw particles
      particles.forEach((particle) => {
        particle.x += particle.speedX * (isSpeaking ? 1.5 : 1);
        particle.y += particle.speedY * (isSpeaking ? 1.5 : 1);
        
        // Wrap around canvas
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });
      
      // Draw AI Guardian
      drawGuardian();
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    createParticles();
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isProcessing, isSpeaking]);
  
  return (
    <motion.div 
      className="relative flex flex-col items-center justify-center w-[200px] h-[200px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <canvas 
        ref={canvasRef} 
        className="rounded-full border border-[#00ff00]/30 bg-black/70 shadow-[0_0_15px_rgba(0,255,0,0.2)]"
      />
      
      {isProcessing && (
        <motion.div 
          className="absolute bottom-4 text-xs text-[#00ff00] font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          Processing...
        </motion.div>
      )}
      
      {isSpeaking && !isProcessing && (
        <motion.div 
          className="absolute bottom-4 text-xs text-[#00ff00] font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          Speaking...
        </motion.div>
      )}
    </motion.div>
  );
};

export default AIGuardian; 