'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

interface AmbientAudioPlayerProps {
  src: string;
  title: string;
}

export default function AmbientAudioPlayer({ src, title }: AmbientAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <div className="flex items-center gap-3 p-2 pr-4 glass rounded-full w-max shadow-lg">
      <audio ref={audioRef} src={src} loop />
      <button
        onClick={() => setIsPlaying(!isPlaying)}
        className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] transition-colors text-white"
      >
        {isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>
      <div className="flex flex-col">
        <span className="text-xs text-white/70 font-medium uppercase tracking-wider">Ambient Audio</span>
        <span className="text-sm text-white font-semibold">{title}</span>
      </div>
      {isPlaying && (
        <div className="flex items-center gap-1 ml-2">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              animate={{ height: ['4px', '12px', '4px'] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2, ease: 'easeInOut' }}
              className="w-1 bg-[var(--accent-light)] rounded-full"
            />
          ))}
        </div>
      )}
    </div>
  );
}
