'use client';

import GlassCard from '@/components/ui/GlassCard';
import GlassButton from '@/components/ui/GlassButton';
import { ArrowLeft } from 'lucide-react';

export default function DestinationsPlaceholder() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center relative pointer-events-auto z-20">
      <GlassCard strong className="p-12 text-center max-w-lg border-[rgba(255,255,255,0.2)] shadow-2xl relative z-20 pointer-events-auto">
        <h1 className="heading-lg text-white mb-4">Destinations</h1>
        <p className="text-text-secondary mb-8">This is a placeholder page for the Destinations module. Full list coming soon!</p>
        <GlassButton href="/" className="z-20 pointer-events-auto">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back Home
        </GlassButton>
      </GlassCard>
    </div>
  );
}
