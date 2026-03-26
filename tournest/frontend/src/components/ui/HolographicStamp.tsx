'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface HolographicStampProps {
  country: string;
  date: string;
  color: string;
}

export default function HolographicStamp({ country, date, color }: HolographicStampProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalize to -1 to 1
    const xNorm = (x / rect.width - 0.5) * 2;
    const yNorm = (y / rect.height - 0.5) * 2;
    
    setRotation({ x: yNorm * -15, y: xNorm * 15 });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setRotation({ x: 0, y: 0 }); }}
      animate={{
        rotateX: isHovered ? rotation.x : 0,
        rotateY: isHovered ? rotation.y : 0,
        scale: isHovered ? 1.05 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ perspective: 1000 }}
      className="relative w-32 h-32 rounded-full border-4 border-[rgba(255,255,255,0.4)] flex items-center justify-center overflow-hidden cursor-crosshair shadow-2xl transition-transform duration-200"
    >
      {/* Background tint based on color prop */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-overlay"
        style={{ backgroundColor: color }}
      />
      
      {/* Glass shine effect */}
      <div className="absolute inset-x-0 h-[200%] top-[-50%] bg-gradient-to-b from-white/0 via-white/80 to-white/0 transform -rotate-45 translate-x-[-150%] opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Iridescent overlay on hover */}
      {isHovered && (
         <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/30 via-purple-500/30 to-cyan-500/30 mix-blend-color-dodge rounded-full blur-md" />
      )}

      {/* Text Content */}
      <div className="relative z-10 flex flex-col items-center text-center transform -rotate-12 pointer-events-none">
        <span className="text-xl font-bold uppercase tracking-widest text-white drop-shadow-md">{country}</span>
        <span className="text-xs font-mono text-white/90 mt-1">{date}</span>
      </div>
      
      {/* Dashed inner circle */}
      <div className="absolute inset-2 rounded-full border-2 border-dashed border-white/50 pointer-events-none" />
    </motion.div>
  );
}
