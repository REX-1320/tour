'use client';

import React, { useState } from 'react';
import { Reorder } from 'framer-motion';
import { GripVertical, MapPin } from 'lucide-react';

export default function LiquidItinerary() {
  const [items, setItems] = useState([
    { id: '1', title: 'Arrival & Check-in', time: '10:00 AM', loc: 'Aura Resort' },
    { id: '2', title: 'Private Boat Tour', time: '1:30 PM', loc: 'Crystal Bay' },
    { id: '3', title: 'Sunset Dinner', time: '7:00 PM', loc: 'The Cliffside' },
  ]);

  return (
    <div className="glass-card p-6 w-full max-w-md mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Day 1 Itinerary</h3>
        <span className="text-xs text-white/50 tracking-widest uppercase bg-white/5 px-2 py-1 rounded-md">Drag to Reorder</span>
      </div>

      <Reorder.Group axis="y" values={items} onReorder={setItems} className="flex flex-col gap-4 relative isolate">
        {items.map((item) => (
          <Reorder.Item 
            key={item.id} 
            value={item}
            className="glass p-4 rounded-2xl flex items-center gap-4 cursor-grab active:cursor-grabbing shadow-lg select-none relative z-10 bg-[rgba(255,255,255,0.03)] backdrop-blur-md"
            whileDrag={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.12)', zIndex: 50, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
          >
            <GripVertical className="w-5 h-5 text-white/30" />
            <div className="flex-1">
              <h4 className="text-white font-medium">{item.title}</h4>
              <div className="flex items-center gap-3 mt-1 text-xs text-white/60">
                <span className="font-mono text-[var(--accent-light)]">{item.time}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-white/40" /> {item.loc}</span>
              </div>
            </div>
          </Reorder.Item>
        ))}
        {/* Timeline Line */}
        <div className="absolute left-6 top-4 bottom-4 w-px bg-gradient-to-b from-white/0 via-white/20 to-white/0 z-0 pointer-events-none" />
      </Reorder.Group>
    </div>
  );
}
