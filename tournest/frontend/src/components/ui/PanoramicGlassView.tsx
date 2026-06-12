'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';

export default function PanoramicGlassView({ imageUrl = '' }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;

    // Pan background opposite to mouse
    containerRef.current.style.setProperty('--pan-x', `${x * -20}px`);
    containerRef.current.style.setProperty('--pan-y', `${y * -20}px`);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if(containerRef.current) {
          containerRef.current.style.setProperty('--pan-x', `0px`);
          containerRef.current.style.setProperty('--pan-y', `0px`);
        }
      }}
      className="relative w-full h-[400px] rounded-[32px] overflow-hidden glass shadow-[0_30px_60px_rgba(0,0,0,0.5)] cursor-move group"
    >
      <div 
        className="absolute inset-[-40px] bg-cover bg-center transition-transform duration-300 ease-out"
        style={{ 
          backgroundImage: `url(${imageUrl})`,
          transform: 'translate(var(--pan-x, 0), var(--pan-y, 0)) scale(1.05)',
        }}
      />
      {/* Convex lens overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/20 pointer-events-none rounded-[32px] shadow-[inset_0_0_40px_rgba(255,255,255,0.1)]" />
      
      {/* Badge container */}
      <div className="absolute top-6 left-6 pointer-events-none">
        <div className="glass px-4 py-2 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-white text-xs font-bold tracking-widest uppercase">360° Preview</span>
        </div>
      </div>
    </div>
  );
}
