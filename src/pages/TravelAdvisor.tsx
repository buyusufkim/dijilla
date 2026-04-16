import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { 
  Coffee, 
  Utensils, 
  Fuel, 
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/supabase-service";
import { aiService } from "@/services/aiService";

import { TravelHeader } from "@/components/travel/TravelHeader";
import { VehicleSelector } from "@/components/travel/VehicleSelector";
import { RouteInputSection } from "@/components/travel/RouteInputSection";
import { RoutePlanDisplay } from "@/components/travel/RoutePlanDisplay";

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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=beta&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    (window as any).initMap = () => {
      setIsScriptLoaded(true);
    };

    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      console.error("Google Maps script failed to load");
      setGoogleMapsError("Google Maps yüklenemedi. İnternet bağlantınızı kontrol edin.");
    };
    document.head.appendChild(script);

    (window as any).gm_authFailure = () => {
      console.error("Google Maps authentication failure (likely API key or enabled APIs issue)");
      setGoogleMapsError("Google Maps API hatası: 'Places API (Legacy)' servisinin Google Cloud Console üzerinden etkinleştirildiğinden emin olun.");
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = db.from("vehicles").subscribe((data) => {
      const vData = data.filter((v: any) => v.user_id === user.id) as any[];
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
      const prompt = `Plan a route from ${startLocation} to ${endLocation} for a vehicle with these specs:
      Plate: ${selectedVehicle.plate}
      Fuel Type: ${selectedVehicle.fuel_type}
      Brand/Model: ${selectedVehicle.brand_model}
      
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

      const response = await aiService.generateTravelRoute(prompt);

      const result = JSON.parse(response.text || "{}");
      
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
      
      const groundingMetadata = response.groundingMetadata;
      const chunks = groundingMetadata?.groundingChunks;
      if (chunks) {
        const links = chunks
          .filter((chunk: any) => chunk.web?.uri)
          .map((chunk: any) => ({
            uri: chunk.web.uri,
            title: chunk.web.title
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

  const planErrorMsg = !selectedVehicle 
    ? "Lütfen bir araç seçin. " 
    : !startLocation 
      ? "Başlangıç noktası girin. " 
      : !endLocation 
        ? "Varış noktası girin." 
        : "";

  return (
    <div className="flex flex-col gap-6 pb-12 relative min-h-screen">
      <TravelHeader onBack={() => navigate(-1)} />

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

      <VehicleSelector 
        vehicles={vehicles}
        selectedVehicle={selectedVehicle}
        onSelect={setSelectedVehicle}
        onAddVehicle={() => navigate("/garage")}
      />

      <RouteInputSection 
        startLocation={startLocation}
        setStartLocation={setStartLocation}
        endLocation={endLocation}
        setEndLocation={setEndLocation}
        isLocating={isLocating}
        onUseMyLocation={handleUseMyLocation}
        isPlanning={isPlanning}
        onPlanRoute={handlePlanRoute}
        isGoogleEnabled={isScriptLoaded && !googleMapsError}
        canPlan={!!(startLocation && endLocation && selectedVehicle)}
        planErrorMsg={planErrorMsg}
      />

      <AnimatePresence>
        {routePlan && (
          <RoutePlanDisplay 
            routePlan={routePlan}
            groundingLinks={groundingLinks}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
