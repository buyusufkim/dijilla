import L from 'leaflet';

export type Station = {
  id: string;
  name: string;
  distance: string;
  distanceValue: number;
  prices?: {
    benzin: string;
    motorin: string;
    lpg: string;
  };
  price?: string; // for electric
  priceValue: number;
  rating: number;
  type: "fuel" | "electric";
  status: "open" | "closed";
  address: string;
  lat: number;
  lon: number;
};

export const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export const UserIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #00E5FF; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px #00E5FF;"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

export const StationIcon = (type: "fuel" | "electric") => L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: ${type === 'fuel' ? '#00E5FF' : '#FFD600'}; width: 10px; height: 10px; border-radius: 50%; border: 1px solid white;"></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5]
});

export function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
