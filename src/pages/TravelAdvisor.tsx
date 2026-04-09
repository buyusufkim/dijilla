import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Map as MapIcon, 
  Navigation, 
  Coffee, 
  Utensils, 
  Fuel, 
  Car,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Search,
  MapPin,
  Clock,
  TrafficCone,
  Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot } from "@/firebase";
import { GoogleGenAI, Type } from "@google/genai";
import usePlacesAutocomplete from "use-places-autocomplete";

export default function TravelAdvisor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [isPlanning, setIsPlanning] = useState(false);
  const [routePlan, setRoutePlan] = useState<any>(null);
  const [groundingLinks, setGroundingLinks] = useState<any[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(!!window.google?.maps?.places);
  const [googleMapsError, setGoogleMapsError] = useState<string | null>(null);

  // Google Maps Script Loading
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setGoogleMapsError("Google Maps API anahtarı eksik.");
      return;
    }

    if (window.google?.maps?.places) {
      setIsScriptLoaded(true);
      return;
    }

    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      const handleLoad = () => setIsScriptLoaded(true);
      existingScript.addEventListener('load', handleLoad);
      return () => existingScript.removeEventListener('load', handleLoad);
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    // Using v=beta and modern loading if possible
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=beta&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    // Define the callback to avoid "initMap is not a function" error if triggered by Google
    (window as any).initMap = () => {
      setIsScriptLoaded(true);
    };

    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      console.error("Google Maps script failed to load");
      setGoogleMapsError("Google Maps yüklenemedi. İnternet bağlantınızı kontrol edin.");
    };
    document.head.appendChild(script);

    // Listen for authentication errors from Google Maps
    window.gm_authFailure = () => {
      console.error("Google Maps authentication failure (likely API key or enabled APIs issue)");
      setGoogleMapsError("Google Maps API hatası: 'Places API (Legacy)' servisinin Google Cloud Console üzerinden etkinleştirildiğinden emin olun.");
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "vehicles"), where("user_id", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setVehicles(vData);
      if (vData.length > 0 && !selectedVehicle) {
        setSelectedVehicle(vData[0]);
      }
    });
    return () => unsubscribe();
  }, [user, selectedVehicle]);

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Try Google Geocoding first if not in error state
          if (import.meta.env.VITE_GOOGLE_MAPS_API_KEY && !googleMapsError) {
            try {
              const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`);
              const data = await response.json();
              if (data.results && data.results.length > 0) {
                setStartLocation(data.results[0].formatted_address);
                setIsLocating(false);
                return;
              }
            } catch (error) {
              console.error("Reverse geocoding error:", error);
            }
          }
          
          // Fallback to Nominatim (OpenStreetMap)
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            if (data.display_name) {
              setStartLocation(data.display_name);
              setIsLocating(false);
              return;
            }
          } catch (error) {
            console.error("Nominatim reverse geocoding error:", error);
          }
          
          setStartLocation("Mevcut Konum (Adres alınamadı)");
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Konum alınamadı. Lütfen tarayıcı izinlerini kontrol edin.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Tarayıcınız konum özelliğini desteklemiyor.");
    }
  };

  const handlePlanRoute = async () => {
    if (!startLocation || !endLocation || !selectedVehicle) return;
    
    setIsPlanning(true);
    setGroundingLinks([]);
    
    try {
      const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        tools: [{ googleMaps: {} }] 
      });

      const prompt = `Plan a route from ${startLocation} to ${endLocation} for a vehicle with these specs:
      Plate: ${selectedVehicle.plate}
      Fuel Type: ${selectedVehicle.fuel_type}
      Brand/Model: ${selectedVehicle.brand} ${selectedVehicle.model}
      
      Please include:
      1. Current distance and estimated duration considering REAL-TIME TRAFFIC.
      2. Traffic status (e.g., "Akıcı", "Yoğun", "Normal").
      3. Any traffic delays in minutes.
      4. Fuel/Charge status (whether the current range is enough).
      5. Suggested stops (fuel/charge, rest, food) based on the route length and vehicle type.
      6. Estimated total trip cost (Yol masrafı) in TRY.
      7. Average fuel/energy consumption for this trip.
      8. Total distance in kilometers (numeric).
      
      Return the response in JSON format.`;

      const response = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              distance: { type: Type.STRING },
              totalKm: { type: Type.NUMBER },
              duration: { type: Type.STRING },
              trafficStatus: { type: Type.STRING },
              trafficDelay: { type: Type.STRING },
              fuelStatus: { type: Type.STRING, enum: ["ok", "critical"] },
              estimatedCost: { type: Type.STRING },
              averageFuelConsumption: { type: Type.STRING },
              stops: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.NUMBER },
                    type: { type: Type.STRING, enum: ["fuel", "rest", "food"] },
                    name: { type: Type.STRING },
                    distance: { type: Type.STRING },
                    time: { type: Type.STRING }
                  },
                  required: ["id", "type", "name", "distance", "time"]
                }
              }
            },
            required: ["distance", "totalKm", "duration", "trafficStatus", "fuelStatus", "estimatedCost", "averageFuelConsumption", "stops"]
          }
        }
      });

      const result = JSON.parse(response.response.text() || "{}");
      
      const stopsWithIcons = result.stops.map((stop: any) => {
        let icon = Coffee;
        let color = "text-purple-400";
        let bgColor = "bg-purple-500/10";

        if (stop.type === "fuel") {
          const isElectric = selectedVehicle.fuel_type === "Elektrik";
          icon = Fuel;
          color = isElectric ? "text-[#00E5FF]" : "text-[#FFD600]";
          bgColor = isElectric ? "bg-[#00E5FF]/10" : "bg-[#FFD600]/10";
        } else if (stop.type === "food") {
          icon = Utensils;
          color = "text-[#00E676]";
          bgColor = "bg-[#00E676]/10";
        }

        return { ...stop, icon, color, bgColor };
      });

      setRoutePlan({ ...result, stops: stopsWithIcons });
      
      const groundingMetadata = response.response.candidates?.[0]?.groundingMetadata;
      const chunks = groundingMetadata?.groundingChunks;
      if (chunks) {
        const links = chunks
          .filter((chunk: any) => chunk.maps?.uri)
          .map((chunk: any) => ({
            uri: chunk.maps.uri,
            title: chunk.maps.title
          }));
        setGroundingLinks(links);
      }
    } catch (error) {
      console.error("Route planning error:", error);
      alert("Rota planlanırken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 relative min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Seyahat Danışmanı</h1>
        </div>
      </header>

      {googleMapsError && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-amber-200 font-medium">Harita Servisi Kısıtlı</p>
            <p className="text-xs text-amber-200/60 mt-1">
              {googleMapsError} Uygulama şu an yedek adres servisini (Nominatim) kullanıyor.
            </p>
          </div>
        </div>
      )}

      {vehicles.length > 0 ? (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {vehicles.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVehicle(v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                selectedVehicle?.id === v.id
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
      ) : (
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-200">Kayıtlı Araç Bulunamadı</p>
              <p className="text-xs text-amber-200/60">Rota planlamak için önce "Garajım" sayfasından bir araç eklemelisiniz.</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/garage")}
              className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
            >
              Araç Ekle
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-[#1A233A] border-white/10">
        <CardContent className="p-6 space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[#00E5FF]"></div>
            <input
              type="text"
              placeholder="Nereden?"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 pl-12 pr-28 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50 transition-all"
            />
            <button
              onClick={handleUseMyLocation}
              disabled={isLocating}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00E5FF] text-xs font-medium bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              {isLocating ? (
                <div className="w-3 h-3 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <MapPin className="w-3 h-3" />
              )}
              Konum
            </button>
          </div>
          
          <div className="relative flex justify-center -my-2 z-10">
            <div className="bg-[#1A233A] p-1 rounded-full border border-white/10">
              <Navigation className="w-4 h-4 text-white/40 rotate-180" />
            </div>
          </div>

          <DestinationInput 
            value={endLocation} 
            onChange={setEndLocation} 
            onSelect={(val) => setEndLocation(val)}
            isGoogleEnabled={isScriptLoaded && !googleMapsError}
          />

          <Button 
            onClick={handlePlanRoute}
            disabled={!startLocation || !endLocation || !selectedVehicle || isPlanning}
            className="w-full bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] font-bold py-6 rounded-xl mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlanning ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#0A1128] border-t-transparent rounded-full animate-spin"></div>
                Rota Hesaplanıyor...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <MapIcon className="w-5 h-5" /> Rota Planla
              </span>
            )}
          </Button>

          {(!startLocation || !endLocation || !selectedVehicle) && !isPlanning && (
            <p className="text-[10px] text-center text-white/30 mt-2">
              {!selectedVehicle ? "Lütfen bir araç seçin. " : ""}
              {!startLocation ? "Başlangıç noktası girin. " : ""}
              {!endLocation ? "Varış noktası girin." : ""}
            </p>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {routePlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-[#1A233A] border-white/10">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <Navigation className="w-6 h-6 text-[#00E5FF] mb-2" />
                  <p className="text-sm text-white/60">Mesafe</p>
                  <p className="text-xl font-bold">{routePlan.distance}</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1A233A] border-white/10">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <Clock className="w-6 h-6 text-purple-400 mb-2" />
                  <p className="text-sm text-white/60">Tahmini Süre</p>
                  <p className="text-xl font-bold">{routePlan.duration}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-[#1A233A] border-white/10">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <Fuel className="w-6 h-6 text-[#FFD600] mb-2" />
                  <p className="text-sm text-white/60">Ort. Tüketim</p>
                  <p className="text-xl font-bold">{routePlan.averageFuelConsumption}</p>
                </CardContent>
              </Card>
              <Card className="bg-[#1A233A] border-white/10">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                  <div className="text-[#00E676] font-bold text-2xl mb-1">₺</div>
                  <p className="text-sm text-white/60">Yol Masrafı</p>
                  <p className="text-xl font-bold">{routePlan.estimatedCost}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-[#1A233A] border-white/10 overflow-hidden">
              <CardContent className="p-0">
                <div className={`p-4 flex items-center gap-4 ${
                  routePlan.trafficStatus === "Yoğun" ? "bg-red-500/10" : 
                  routePlan.trafficStatus === "Akıcı" ? "bg-green-500/10" : "bg-blue-500/10"
                }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    routePlan.trafficStatus === "Yoğun" ? "bg-red-500/20 text-red-500" : 
                    routePlan.trafficStatus === "Akıcı" ? "bg-green-500/20 text-green-500" : "bg-blue-500/20 text-blue-500"
                  }`}>
                    <TrafficCone className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white">Trafik Durumu</h4>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        routePlan.trafficStatus === "Yoğun" ? "bg-red-500/20 text-red-500" : 
                        routePlan.trafficStatus === "Akıcı" ? "bg-green-500/20 text-green-500" : "bg-blue-500/20 text-blue-500"
                      }`}>
                        {routePlan.trafficStatus}
                      </span>
                    </div>
                    {routePlan.trafficDelay && (
                      <p className="text-sm text-white/60 mt-0.5">
                        Trafik kaynaklı gecikme: <span className="text-red-400 font-medium">{routePlan.trafficDelay}</span>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {routePlan.fuelStatus === "critical" ? (
              <div className="bg-gradient-to-r from-[#FF3D00]/20 to-red-900/20 border border-[#FF3D00]/30 rounded-2xl p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#FF3D00]/20 flex items-center justify-center border border-[#FF3D00]/30 shrink-0 mt-1">
                  <AlertTriangle className="w-5 h-5 text-[#FF3D00]" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Yakıt/Şarj Uyarısı</h4>
                  <p className="text-sm text-white/70 mt-1">
                    Mevcut menziliniz hedefe ulaşmak için yetersiz görünüyor. Yol üzerindeki ilk istasyonda durmanız önerilir.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-[#00E676]/20 to-green-900/20 border border-[#00E676]/30 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#00E676]/20 flex items-center justify-center border border-[#00E676]/30 shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-[#00E676]" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Menzil Yeterli</h4>
                  <p className="text-sm text-white/70">Mevcut yakıtınız/şarjınız hedefe ulaşmak için yeterli.</p>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium text-white/80 mb-4">Önerilen Duraklamalar</h3>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {routePlan.stops.map((stop: any) => (
                  <div key={stop.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-[#050B14] bg-[#1A233A] text-white/50 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_2px_rgba(255,255,255,0.1)] z-10">
                      <stop.icon className={`w-5 h-5 ${stop.color}`} />
                    </div>
                    
                    <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-[#1A233A] border-white/10 hover:border-white/20 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-base">{stop.name}</h4>
                          <span className="text-xs font-medium px-2 py-1 rounded-lg bg-white/5 text-white/60">
                            {stop.distance}
                          </span>
                        </div>
                        <p className="text-sm text-white/60 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {stop.time}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {groundingLinks.length > 0 && (
              <div className="pt-4 border-t border-white/5">
                <p className="text-xs text-white/40 mb-3 uppercase tracking-wider font-bold">Kaynaklar & Haritalar</p>
                <div className="flex flex-wrap gap-2">
                  {groundingLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-white/5 hover:bg-white/10 text-[#00E5FF] px-3 py-1.5 rounded-lg border border-white/10 transition-colors flex items-center gap-2"
                    >
                      <MapPin className="w-3 h-3" />
                      {link.title || "Haritada Gör"}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DestinationInput({ 
  value, 
  onChange, 
  onSelect, 
  isGoogleEnabled 
}: { 
  value: string, 
  onChange: (val: string) => void, 
  onSelect: (val: string) => void,
  isGoogleEnabled: boolean
}) {
  const [nominatimSuggestions, setNominatimSuggestions] = useState<any[]>([]);
  const [isSearchingNominatim, setIsSearchingNominatim] = useState(false);

  // Google Places Autocomplete Hook
  const {
    ready,
    value: inputValue,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    debounce: 300,
    defaultValue: value,
    initOnMount: isGoogleEnabled
  });

  useEffect(() => {
    if (value !== inputValue) {
      setValue(value, false);
    }
  }, [value]);

  // Fallback to Nominatim if Google is not ready, not enabled, or returns no results
  useEffect(() => {
    const triggerNominatim = async () => {
      // Trigger Nominatim if:
      // 1. Google is not enabled OR not ready
      // 2. OR Google is ready but returned no results/error (status !== "OK")
      // AND input length is sufficient
      const shouldFallback = !isGoogleEnabled || !ready || (ready && status !== "OK" && status !== "");
      
      if (shouldFallback && inputValue.length >= 3) {
        setIsSearchingNominatim(true);
        try {
          // Add a small delay to mimic debounce if needed, though usePlacesAutocomplete handles its own debounce
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputValue)}&limit=5&addressdetails=1`);
          const results = await response.json();
          
          if (Array.isArray(results)) {
            setNominatimSuggestions(results.map((item: any) => ({
              place_id: item.place_id.toString(),
              description: item.display_name,
              structured_formatting: {
                main_text: item.display_name.split(',')[0],
                secondary_text: item.display_name.split(',').slice(1).join(',').trim()
              }
            })));
          }
        } catch (error) {
          console.error("Nominatim search error:", error);
        } finally {
          setIsSearchingNominatim(false);
        }
      } else if (inputValue.length < 3) {
        setNominatimSuggestions([]);
      }
    };

    const timer = setTimeout(triggerNominatim, 500);
    return () => clearTimeout(timer);
  }, [inputValue, isGoogleEnabled, ready, status]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue(val);
    onChange(val);
  };

  const handleSelect = (suggestion: any) => () => {
    const { description } = suggestion;
    setValue(description, false);
    onSelect(description);
    clearSuggestions();
    setNominatimSuggestions([]);
  };

  // Prioritize Google data if status is OK, otherwise use Nominatim
  const suggestions = (isGoogleEnabled && ready && status === "OK") ? data : nominatimSuggestions;
  const hasSuggestions = suggestions.length > 0;

  return (
    <div className="relative">
      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF3D00]" />
      <input
        type="text"
        placeholder="Nereye?"
        value={inputValue}
        onChange={handleInput}
        className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 pl-12 pr-10 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50 transition-all"
      />
      
      {(isSearchingNominatim || (isGoogleEnabled && !ready && inputValue.length > 2)) && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="w-4 h-4 text-[#00E5FF] animate-spin" />
        </div>
      )}

      {/* Autocomplete Suggestions */}
      {hasSuggestions && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-[#1A233A] border border-white/10 rounded-xl overflow-hidden z-[100] shadow-2xl max-h-60 overflow-y-auto">
          {suggestions.map((suggestion) => {
            const {
              place_id,
              structured_formatting: { main_text, secondary_text },
            } = suggestion;

            return (
              <button
                key={place_id}
                onClick={handleSelect(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
              >
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-white truncate">{main_text}</p>
                    <p className="text-xs text-white/40 truncate">{secondary_text}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
