'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MousePointer2 } from 'lucide-react';

export default function TravelPodCursors() {
  const cursors = [
    { id: 1, name: 'Alex', color: '#ff6b6b', path: { x: [0, 100, -50, 0], y: [0, -50, 80, 0] } },
    { id: 2, name: 'Sarah', color: '#4ecdc4', path: { x: [100, -20, 80, 100], y: [50, 100, -20, 50] } }
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-[45] overflow-hidden">
      {cursors.map((cursor) => (
        <motion.div
          key={cursor.id}
          animate={{
            x: cursor.path.x,
            y: cursor.path.y,
          }}
          transition={{
            duration: 15 + cursor.id, // Offset timings
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[40%] left-[60%] flex flex-col items-start drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
        >
          <MousePointer2 
            className="w-5 h-5 fill-current" 
            style={{ color: cursor.color }} 
          />
          <div 
            className="mt-1 px-2 py-1 rounded-full text-[10px] font-bold text-white tracking-wider uppercase ml-3 shadow-lg backdrop-blur-md"
            style={{ backgroundColor: `${cursor.color}dd` }}
          >
            {cursor.name}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
