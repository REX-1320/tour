'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export type WeatherType = 'sunny' | 'rainy' | 'sunset' | 'aurora' | 'default';

export default function WeatherFluidBackground({ forcedWeather }: { forcedWeather?: WeatherType }) {
  const [weather, setWeather] = useState<WeatherType>('default');

  useEffect(() => {
    if (forcedWeather) {
      setWeather(forcedWeather);
    }
  }, [forcedWeather]);

  const gradients = {
    sunny: 'radial-gradient(ellipse 80% 50% at 20% 20%, rgba(251,191,36,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(56,189,248,0.1) 0%, transparent 55%), radial-gradient(ellipse 50% 60% at 50% 50%, rgba(250,204,21,0.05) 0%, transparent 50%)',
    rainy: 'radial-gradient(ellipse 80% 50% at 20% 20%, rgba(51,65,85,0.2) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(30,58,138,0.15) 0%, transparent 55%), radial-gradient(ellipse 50% 60% at 50% 50%, rgba(15,23,42,0.1) 0%, transparent 50%)',
    sunset: 'radial-gradient(ellipse 80% 50% at 20% 20%, rgba(244,63,94,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(168,85,247,0.15) 0%, transparent 55%), radial-gradient(ellipse 50% 60% at 50% 50%, rgba(249,115,22,0.1) 0%, transparent 50%)',
    aurora: 'radial-gradient(ellipse 80% 50% at 20% 20%, rgba(52,211,153,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(16,185,129,0.1) 0%, transparent 55%), radial-gradient(ellipse 50% 60% at 50% 50%, rgba(6,182,212,0.1) 0%, transparent 50%)',
    default: 'radial-gradient(ellipse 80% 50% at 20% 20%, rgba(108,99,255,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(99,179,255,0.06) 0%, transparent 55%), radial-gradient(ellipse 50% 60% at 50% 50%, rgba(168,85,247,0.04) 0%, transparent 50%)'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, background: gradients[weather] }}
      transition={{ duration: 2, ease: 'easeOut' }}
      className="fixed inset-0 z-0 pointer-events-none"
    >
      <div className="absolute inset-0 bg-mesh opacity-50 mix-blend-screen" />
      {/* Rain drop simulation */}
      {weather === 'rainy' && (
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjIwIj48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] animate-[rain_0.3s_linear_infinite]" />
      )}
    </motion.div>
  );
}
