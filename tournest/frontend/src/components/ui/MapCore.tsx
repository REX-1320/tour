'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix missing leafet markers in Next.js integration
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export interface MapDestination {
  id: string;
  title: string;
  location: string;
  lat?: number;
  lng?: number;
}

interface MapCoreProps {
  destinations: MapDestination[];
  center?: [number, number];
  zoom?: number;
}

export default function MapCore({ destinations, center = [12.9716, 77.5946], zoom = 5 }: MapCoreProps) {
  useEffect(() => {
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      scrollWheelZoom={false}
      className="w-full h-full rounded-2xl z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {destinations.map((dest) => {
        // Fallback or randomish spread near center if no lat/lng provided just for visual layout demo
        const lat = dest.lat || center[0] + (Math.random() - 0.5) * 5;
        const lng = dest.lng || center[1] + (Math.random() - 0.5) * 5;

        return (
          <Marker key={dest.id} position={[lat, lng]} icon={DefaultIcon}>
            <Popup>
              <div className="font-semibold text-gray-800">{dest.title}</div>
              <div className="text-sm text-gray-500">{dest.location}</div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
