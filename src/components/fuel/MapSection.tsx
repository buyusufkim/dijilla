import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Station, UserIcon, StationIcon } from "./types";

interface MapSectionProps {
  userLocation: { lat: number; lon: number } | null;
  filteredStations: Station[];
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export const MapSection: React.FC<MapSectionProps> = ({
  userLocation,
  filteredStations,
}) => {
  return (
    <Card className="bg-[#1A233A] border-white/10 overflow-hidden h-64 relative z-0">
      {userLocation ? (
        <MapContainer 
          center={[userLocation.lat, userLocation.lon]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <RecenterMap center={[userLocation.lat, userLocation.lon]} />
          <Marker position={[userLocation.lat, userLocation.lon]} icon={UserIcon}>
            <Popup>Konumunuz</Popup>
          </Marker>
          {filteredStations.map(station => (
            <Marker 
              key={station.id} 
              position={[station.lat, station.lon]} 
              icon={StationIcon(station.type)}
            >
              <Popup>
                <div className="text-navy">
                  <p className="font-bold">{station.name}</p>
                  <p className="text-xs">{station.address}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-[#00E5FF] animate-spin" />
            <span className="text-xs font-medium text-white/60">Konum Aranıyor...</span>
          </div>
        </div>
      )}
    </Card>
  );
};
