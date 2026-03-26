'use client';

import React from 'react';
import HolographicStamp from './HolographicStamp';

export default function VirtualPassport() {
  const stamps = [
    { country: 'Japan', date: 'OCT 2025', color: '#ff6b6b' },
    { country: 'Italy', date: 'MAY 2026', color: '#4ecdc4' },
    { country: 'Bali', date: 'AUG 2026', color: '#fbbf24' },
  ];

  return (
    <div className="glass-strong p-8 rounded-[32px] max-w-3xl w-full mx-auto shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative overflow-hidden">
      {/* Book Binding look */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/60 to-transparent border-r border-white/10 z-10" />
      
      <div className="pl-10 relative z-20">
        <div className="mb-10 border-b border-white/10 pb-6 flex items-end justify-between">
          <div>
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50 font-serif">Virtual Passport</h2>
            <p className="text-white/60 text-sm mt-2 tracking-[0.3em] uppercase">Official Document of Travel</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Holder ID</div>
            <div className="font-mono text-white/80">TN-8492-BX</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 p-4 relative">
            {/* Soft grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none rounded-xl" />

            {stamps.map((stamp, i) => (
                <div key={i} className={`flex justify-center transition-transform hover:scale-105 ${i % 2 !== 0 ? 'mt-12' : ''}`}>
                    <HolographicStamp {...stamp} />
                </div>
            ))}

            {/* Empty Spots for progression gamification */}
            {[1, 2].map((i) => (
                <div key={`empty-${i}`} className={`flex justify-center ${i % 2 === 0 ? 'mt-12' : ''}`}>
                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center bg-black/10">
                        <span className="text-white/20 text-[10px] uppercase tracking-[0.2em] text-center px-4 leading-relaxed">Book a trip to stamp</span>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
