'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import type { MapDestination } from './MapCore';

// Dynamic import for react-leaflet components since they require window
const MapCore = dynamic(() => import('./MapCore'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-[rgba(255,255,255,0.05)] rounded-2xl border border-[rgba(255,255,255,0.1)]">
      <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
    </div>
  ),
});

interface InteractiveMapProps {
  destinations: MapDestination[];
  center?: [number, number];
  zoom?: number;
}

export default function InteractiveMap({ destinations, center, zoom }: InteractiveMapProps) {
  return (
    <div className="w-full h-[500px] md:h-[600px] relative rounded-[2rem] overflow-hidden glass p-2 border border-[rgba(255,255,255,0.08)] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
      <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative z-0">
        <MapCore destinations={destinations} center={center} zoom={zoom} />
      </div>
    </div>
  );
}
