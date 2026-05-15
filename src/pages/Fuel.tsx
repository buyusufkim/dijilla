import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  MapPin, 
  Filter, 
  Search, 
  Zap,
  Droplets,
  Clock,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { db, supabase } from "@/lib/supabase-service";
import L from 'leaflet';

import { Station, getDistanceFromLatLonInKm, DefaultIcon } from "@/components/fuel/types";
import { VehicleSelector } from "@/components/fuel/VehicleSelector";
import { CompanyPrices } from "@/components/fuel/CompanyPrices";
import { StationCard } from "@/components/fuel/StationCard";
import { MapSection } from "@/components/fuel/MapSection";

// Fix Leaflet marker icon issue
L.Marker.prototype.options.icon = DefaultIcon;

export default function Fuel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"fuel" | "electric">("fuel");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"distance" | "price" | "rating">("distance");
  const [showFilters, setShowFilters] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [stations, setStations] = useState<Station[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const [locationInfo, setLocationInfo] = useState<{city: string, district: string} | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    if (!userLocation) return;

    const getAddress = async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.lat}&lon=${userLocation.lon}&zoom=10`);
        const data = await response.json();
        if (data.address) {
          setLocationInfo({
            city: data.address.province || data.address.city || data.address.state || "Kayseri",
            district: data.address.district || data.address.suburb || data.address.town || "Talas"
          });
        }
      } catch (error) {
        console.error("Error geocoding:", error);
        setLocationInfo({ city: "Kayseri", district: "Talas" });
      }
    };

    getAddress();
  }, [userLocation]);

  useEffect(() => {
    if (!user) return;

    const fetchVehicles = async () => {
      const { data } = await db.from("vehicles").select("*").eq("user_id", user.id);
      if (data) {
        setVehicles(data);
        if (data.length > 0 && !selectedVehicleId) {
          setSelectedVehicleId(data[0].id);
          if (data[0].fuel_type === "Elektrik") {
            setActiveTab("electric");
          } else {
            setActiveTab("fuel");
          }
        }
      }
    };
    fetchVehicles();

    const sub = supabase.channel('fuel_vehicles').on("postgres_changes", { event: "*", schema: "public", table: "vehicles", filter: `user_id=eq.${user.id}` }, fetchVehicles).subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [user, selectedVehicleId]);

  const handleVehicleChange = (vid: string) => {
    setSelectedVehicleId(vid);
    const v = vehicles.find(x => x.id === vid);
    if (v) {
      if (v.fuel_type === "Elektrik") {
        setActiveTab("electric");
      } else {
        setActiveTab("fuel");
      }
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          // Fallback location (e.g., Istanbul) if denied
          setUserLocation({ lat: 41.0082, lon: 28.9784 });
        }
      );
    } else {
      setUserLocation({ lat: 41.0082, lon: 28.9784 });
    }
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    const fetchRealStations = async () => {
      setLoadingStations(true);
      try {
        const amenity = activeTab === "fuel" ? "fuel" : "charging_station";
        const radius = 10000; // 10km
        const query = `
          [out:json][timeout:25];
          (
            node["amenity"="${amenity}"](around:${radius}, ${userLocation.lat}, ${userLocation.lon});
            way["amenity"="${amenity}"](around:${radius}, ${userLocation.lat}, ${userLocation.lon});
            relation["amenity"="${amenity}"](around:${radius}, ${userLocation.lat}, ${userLocation.lon});
          );
          out center;
        `;
        
        const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data || !data.elements) {
          throw new Error("Invalid data format from Overpass API");
        }

        const fetchedStations: Station[] = data.elements.map((el: any) => {
          const lat = el.lat || el.center?.lat;
          const lon = el.lon || el.center?.lon;
          const dist = getDistanceFromLatLonInKm(userLocation.lat, userLocation.lon, lat, lon);
          
          let name = el.tags?.name || el.tags?.brand || el.tags?.operator || (activeTab === "fuel" ? "Akaryakıt İstasyonu" : "Şarj İstasyonu");
          
          if (!el.tags?.name && el.tags?.brand) {
            name = el.tags.brand;
          }
          
          return {
            id: el.id.toString(),
            name,
            distance: `${dist.toFixed(1)} km`,
            distanceValue: dist,
            prices: undefined, // No real-time prices from Overpass
            price: undefined,
            priceValue: 0,
            rating: 4.0, // Neutral rating
            type: activeTab,
            status: "open",
            address: el.tags?.["addr:street"] || el.tags?.["addr:city"] || "Adres bilgisi yok",
            lat,
            lon,
            isDemo: false
          };
        });
        
        setStations(fetchedStations);
        setLastUpdated(new Date().toISOString());
        localStorage.setItem(`last_stations_${activeTab}`, JSON.stringify({
          data: fetchedStations,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.error("Error fetching stations:", error);
        
        // Try to load from cache first
        const cached = localStorage.getItem(`last_stations_${activeTab}`);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          setStations(data);
          setLastUpdated(timestamp);
          return;
        }

        setError("İstasyon bilgileri şu an alınamıyor. Lütfen internet bağlantınızı kontrol edin.");
        setStations([]);
        setLastUpdated(null);
      } finally {
        setLoadingStations(false);
      }
    };

    fetchRealStations();
  }, [userLocation, activeTab]);

  const filteredStations = useMemo(() => {
    let result = stations.filter(s => s.type === activeTab);
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(lowerQuery) || 
        s.address.toLowerCase().includes(lowerQuery)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "distance") return a.distanceValue - b.distanceValue;
      if (sortBy === "price") return a.priceValue - b.priceValue;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });

    return result;
  }, [stations, activeTab, searchQuery, sortBy]);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Yakıt & Şarj</h1>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button 
            onClick={() => {
              if ("geolocation" in navigator) {
                setLoadingStations(true);
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    setUserLocation({
                      lat: position.coords.latitude,
                      lon: position.coords.longitude
                    });
                  },
                  (error) => {
                    console.error("Error getting location:", error);
                    setLoadingStations(false);
                  }
                );
              }
            }}
            className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-[#00E5FF]"
            title="Konumu Güncelle"
          >
            <MapPin className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-xl transition-colors ${showFilters ? 'bg-[#00E5FF]/20 text-[#00E5FF]' : 'bg-white/5 hover:bg-white/10'}`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </header>

      {userLocation?.lat === 41.0082 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-[10px] flex items-center gap-2">
          <Clock className="w-4 h-4 shrink-0" />
          <p>Konum izni verilmediği için varsayılan olarak İstanbul gösteriliyor. Gerçek sonuçlar için konum izni verin veya sayfayı yeni sekmede açın.</p>
        </div>
      )}

      {/* Vehicle Selector */}
      <VehicleSelector 
        vehicles={vehicles} 
        selectedVehicleId={selectedVehicleId} 
        onVehicleChange={handleVehicleChange} 
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input 
          type="text" 
          placeholder="İstasyon veya konum ara..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#1A233A] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50 transition-all"
        />
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-[#1A233A] rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-sm font-medium text-white/80">Sıralama Ölçütü</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSortBy("distance")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sortBy === "distance" ? "bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50" : "bg-white/5 text-white/60 border border-transparent hover:bg-white/10"}`}
                >
                  Mesafe
                </button>
                <button
                  onClick={() => setSortBy("price")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sortBy === "price" ? "bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50" : "bg-white/5 text-white/60 border border-transparent hover:bg-white/10"}`}
                >
                  Fiyat
                </button>
                <button
                  onClick={() => setSortBy("rating")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${sortBy === "rating" ? "bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50" : "bg-white/5 text-white/60 border border-transparent hover:bg-white/10"}`}
                >
                  Puan
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex p-1 bg-[#1A233A] rounded-2xl border border-white/10">
        <button 
          onClick={() => setActiveTab("fuel")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
            activeTab === "fuel" ? "bg-[#00E5FF] text-[#0A1128] font-semibold" : "text-white/60"
          }`}
        >
          <Droplets className="w-4 h-4" />
          Akaryakıt
        </button>
        <button 
          onClick={() => setActiveTab("electric")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
            activeTab === "electric" ? "bg-[#00E5FF] text-[#0A1128] font-semibold" : "text-white/60"
          }`}
        >
          <Zap className="w-4 h-4" />
          Elektrik
        </button>
      </div>

      {/* Map Preview */}
      <MapSection userLocation={userLocation} filteredStations={filteredStations} />

      {/* Company Prices Section */}
      <CompanyPrices activeTab={activeTab} locationInfo={locationInfo} />

      {/* Stations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex flex-col">
            <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">Yakındaki İstasyonlar</h2>
            <p className="text-[10px] text-white/30 mt-0.5">
              Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
            </p>
          </div>
          <span className="text-xs text-[#00E5FF] font-medium">
            {sortBy === "distance" ? "En Yakın" : sortBy === "price" ? "En Ucuz" : "En Yüksek Puanlı"}
          </span>
        </div>
        <div className="grid gap-4">
          {loadingStations ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#00E5FF]">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="text-sm text-white/60">Gerçek zamanlı istasyonlar aranıyor...</p>
            </div>
          ) : filteredStations.length > 0 ? (
            filteredStations.map((station) => (
              <StationCard key={station.id} station={station} />
            ))
          ) : (
            <div className="text-center py-12 text-white/50">
              Aramanıza uygun istasyon bulunamadı.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
