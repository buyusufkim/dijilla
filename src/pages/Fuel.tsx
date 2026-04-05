import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Fuel as FuelIcon, 
  MapPin, 
  Navigation, 
  Star, 
  Filter, 
  Search, 
  ChevronRight,
  Zap,
  Droplets,
  DollarSign,
  Clock,
  Car
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot } from "@/firebase";

type Station = {
  id: string;
  name: string;
  distance: string;
  distanceValue: number;
  price: string;
  priceValue: number;
  rating: number;
  type: "fuel" | "electric";
  status: "open" | "closed";
  address: string;
};

export default function Fuel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"fuel" | "electric">("fuel");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"distance" | "price" | "rating">("distance");
  const [showFilters, setShowFilters] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "vehicles"), where("user_id", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setVehicles(vData);
      if (vData.length > 0 && !selectedVehicleId) {
        setSelectedVehicleId(vData[0].id);
        if (vData[0].fuel_type === "Elektrik") {
          setActiveTab("electric");
        } else {
          setActiveTab("fuel");
        }
      }
    });
    return () => unsubscribe();
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

  const [stations, setStations] = useState<Station[]>([
    {
      id: "1",
      name: "Shell",
      distance: "1.2 km",
      distanceValue: 1.2,
      price: "42.50 TL",
      priceValue: 42.50,
      rating: 4.8,
      type: "fuel",
      status: "open",
      address: "Atatürk Cad. No: 45"
    },
    {
      id: "2",
      name: "Opet",
      distance: "2.5 km",
      distanceValue: 2.5,
      price: "42.45 TL",
      priceValue: 42.45,
      rating: 4.6,
      type: "fuel",
      status: "open",
      address: "Cumhuriyet Bulv. No: 12"
    },
    {
      id: "3",
      name: "ZES Şarj İstasyonu",
      distance: "0.8 km",
      distanceValue: 0.8,
      price: "7.50 TL/kWh",
      priceValue: 7.50,
      rating: 4.9,
      type: "electric",
      status: "open",
      address: "AVM Otopark Kat -1"
    },
    {
      id: "4",
      name: "Petrol Ofisi",
      distance: "3.1 km",
      distanceValue: 3.1,
      price: "42.60 TL",
      priceValue: 42.60,
      rating: 4.5,
      type: "fuel",
      status: "open",
      address: "İstasyon Yolu No: 8"
    }
  ]);

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
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold tracking-tight">Yakıt & Şarj</h1>
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 rounded-xl transition-colors ${showFilters ? 'bg-[#00E5FF]/20 text-[#00E5FF]' : 'bg-white/5 hover:bg-white/10'}`}
        >
          <Filter className="w-5 h-5" />
        </button>
      </header>

      {/* Vehicle Selector */}
      {vehicles.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {vehicles.map((v) => (
            <button
              key={v.id}
              onClick={() => handleVehicleChange(v.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                selectedVehicleId === v.id
                  ? "bg-[#00E5FF]/20 border border-[#00E5FF]/50 text-[#00E5FF]"
                  : "bg-[#1A233A] border border-white/10 text-white/60 hover:bg-white/5"
              }`}
            >
              <Car className="w-4 h-4" />
              <span className="text-sm font-medium">{v.plate}</span>
              {v.fuel_type && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                  {v.fuel_type}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

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

      {/* Map Preview (Mock) */}
      <Card className="bg-[#1A233A] border-white/10 overflow-hidden h-48 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/10 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <MapPin className="w-8 h-8 text-[#00E5FF] animate-bounce" />
            <span className="text-xs font-medium text-white/60">Harita Yükleniyor...</span>
          </div>
        </div>
      </Card>

      {/* Stations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">Yakındaki İstasyonlar</h2>
          <span className="text-xs text-[#00E5FF] font-medium">
            {sortBy === "distance" ? "En Yakın" : sortBy === "price" ? "En Ucuz" : "En Yüksek Puanlı"}
          </span>
        </div>
        <div className="grid gap-4">
          {filteredStations.length > 0 ? (
            filteredStations.map((station) => (
              <motion.div
                key={station.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="bg-[#1A233A] border-white/10 hover:border-[#00E5FF]/30 transition-all group overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center">
                          {station.type === "fuel" ? <FuelIcon className="w-5 h-5 text-[#00E5FF]" /> : <Zap className="w-5 h-5 text-[#FFD600]" />}
                        </div>
                        <div>
                          <h3 className="font-semibold">{station.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Star className="w-3 h-3 text-[#FFD600] fill-[#FFD600]" />
                            <span className="text-xs text-white/60">{station.rating}</span>
                            <span className="text-white/20">•</span>
                            <span className="text-xs text-white/60">{station.distance}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#00E676]">{station.price}</p>
                        <p className="text-[10px] text-white/40">Güncel Fiyat</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                      <Button className="flex-1 bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/20 rounded-xl gap-2">
                        <Navigation className="w-4 h-4" />
                        Yol Tarifi
                      </Button>
                      <Button variant="ghost" className="p-2 hover:bg-white/5 rounded-xl">
                        <ChevronRight className="w-5 h-5 text-white/40" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
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
