'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export const REGIONS = ['India', 'Europe', 'Asia', 'America'] as const;
export type Region = (typeof REGIONS)[number];

interface RegionContextType {
  selectedRegion: Region;
  setSelectedRegion: (region: Region) => void;
}

const RegionContext = createContext<RegionContextType>({
  selectedRegion: 'India',
  setSelectedRegion: () => {},
});

export function RegionProvider({ children }: { children: ReactNode }) {
  const [selectedRegion, setSelectedRegionState] = useState<Region>('India');

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('tournest_region');
    if (stored && REGIONS.includes(stored as Region)) {
      setSelectedRegionState(stored as Region);
    }
  }, []);

  const setSelectedRegion = (region: Region) => {
    setSelectedRegionState(region);
    localStorage.setItem('tournest_region', region);
  };

  return (
    <RegionContext.Provider value={{ selectedRegion, setSelectedRegion }}>
      {children}
    </RegionContext.Provider>
  );
}

export const useRegion = () => useContext(RegionContext);
