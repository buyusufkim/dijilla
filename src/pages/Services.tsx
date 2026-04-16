import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/supabase-service";
import { useAuth } from "@/context/AuthContext";

import { ServiceHeader } from "@/components/services/ServiceHeader";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ServiceModal } from "@/components/services/ServiceModal";
import { categories } from "@/components/services/constants";
import { calculateDistance } from "@/components/services/utils";
import { Place } from "@/components/services/types";

export default function Services() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = db.from("vehicles").subscribe((data) => {
      const vData = data.filter((v: any) => v.user_id === (user.id || user.uid));
      setVehicles(vData);
      if (vData.length > 0) {
        setSelectedVehicle(vData[0]);
      }
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location", error);
          // Fallback to Istanbul
          setUserLocation({ lat: 41.0082, lon: 28.9784 });
        }
      );
    } else {
      setUserLocation({ lat: 41.0082, lon: 28.9784 });
    }
  }, []);

  const fetchPlaces = async (type: string) => {
    if (!userLocation) return;
    setLoadingPlaces(true);
    setPlaces([]);
    
    let amenity = "";
    if (type === "Nöbetçi Eczane") amenity = "pharmacy";
    else if (type === "Anlaşmalı Hastane") amenity = "hospital";
    else if (type === "Oto Servisler") amenity = "car_repair";
    else if (type === "Nöbetçi Noter") amenity = "notary";
    else {
      setLoadingPlaces(false);
      return;
    }

    try {
      const radius = 5000; // 5km
      const queryStr = `
        [out:json][timeout:25];
        (
          node["amenity"="${amenity}"](around:${radius},${userLocation.lat},${userLocation.lon});
          way["amenity"="${amenity}"](around:${radius},${userLocation.lat},${userLocation.lon});
          relation["amenity"="${amenity}"](around:${radius},${userLocation.lat},${userLocation.lon});
          node["office"="${amenity}"](around:${radius},${userLocation.lat},${userLocation.lon});
          way["office"="${amenity}"](around:${radius},${userLocation.lat},${userLocation.lon});
          relation["office"="${amenity}"](around:${radius},${userLocation.lat},${userLocation.lon});
        );
        out center;
      `;
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: queryStr
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Received non-JSON response:", text.substring(0, 100));
        throw new Error("Received non-JSON response from Overpass API");
      }

      const data = await response.json();
      
      if (!data || !data.elements) {
        throw new Error("Invalid data format from Overpass API");
      }

      const fetchedPlaces = data.elements.map((el: any) => {
        const lat = el.lat || el.center?.lat;
        const lon = el.lon || el.center?.lon;
        const dist = calculateDistance(userLocation.lat, userLocation.lon, lat, lon);
        return {
          id: el.id,
          name: el.tags?.name || (amenity === "pharmacy" ? "Eczane" : amenity === "hospital" ? "Hastane" : amenity === "notary" ? "Noter" : "Oto Servis"),
          addr: el.tags?.["addr:street"] ? `${el.tags["addr:street"]} ${el.tags["addr:housenumber"] || ""}` : "Adres bilgisi yok",
          dist: dist,
          lat,
          lon
        };
      }).sort((a: any, b: any) => a.dist - b.dist).slice(0, 10); // Top 10 closest

      setPlaces(fetchedPlaces);
    } catch (error) {
      console.error("Error fetching places:", error);
      // Fallback to mock data
      const mockPlaces = [
        {
          id: 1,
          name: type === "Nöbetçi Eczane" ? "Merkez Eczanesi" : type === "Anlaşmalı Hastane" ? "Özel Şehir Hastanesi" : "Oto Pratik Servis",
          addr: "Atatürk Cad. No:123, Merkez",
          dist: 1.2,
          lat: userLocation.lat + 0.01,
          lon: userLocation.lon + 0.01
        },
        {
          id: 2,
          name: type === "Nöbetçi Eczane" ? "Hayat Eczanesi" : type === "Anlaşmalı Hastane" ? "Medicana Hastanesi" : "Bosch Car Service",
          addr: "Cumhuriyet Mah. 456. Sokak",
          dist: 2.5,
          lat: userLocation.lat - 0.015,
          lon: userLocation.lon + 0.005
        }
      ];
      setPlaces(mockPlaces);
    } finally {
      setLoadingPlaces(false);
    }
  };

  useEffect(() => {
    if (selectedService && ["Nöbetçi Eczane", "Anlaşmalı Hastane", "Oto Servisler", "Nöbetçi Noter"].includes(selectedService.label)) {
      fetchPlaces(selectedService.label);
    }
  }, [selectedService, userLocation]);

  const filteredCategories = categories.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  const handleAction = async () => {
    setIsProcessing(true);
    
    try {
      if (selectedService?.label === "Kaza Tutanağı" && user) {
        await db.from("service_requests").insert({
          user_id: user.id || user.uid,
          type: "accident",
          phone: "Kayıtlı Numara",
          status: "pending"
        });
      } else {
        // Simulate API call for other services
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedService(null);
      }, 2000);
    } catch (error) {
      console.error("Error processing service request:", error);
      alert("İşlem sırasında bir hata oluştu.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleServiceClick = (item: any) => {
    if (item.link) {
      navigate(item.link);
    } else {
      setSelectedService(item);
    }
  };

  const handleNavigateToPlace = (lat: number, lon: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank');
  };

  return (
    <div className="flex flex-col gap-8 pb-12 relative w-full overflow-x-hidden">
      <ServiceHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="space-y-10">
        {filteredCategories.map((category, idx) => (
          <motion.section
            key={category.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <h2 className="text-lg font-medium text-white/80 mb-6">
              {category.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {category.items.map((item) => (
                <ServiceCard 
                  key={item.label}
                  item={item}
                  onClick={() => handleServiceClick(item)}
                />
              ))}
            </div>
          </motion.section>
        ))}
        
        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-white/50">
            Aramanıza uygun hizmet bulunamadı.
          </div>
        )}
      </div>

      <ServiceModal 
        selectedService={selectedService}
        onClose={() => {
          setSelectedService(null);
          setShowSuccess(false);
        }}
        showSuccess={showSuccess}
        loadingPlaces={loadingPlaces}
        places={places}
        isProcessing={isProcessing}
        onAction={handleAction}
        onNavigateToPlace={handleNavigateToPlace}
        vehicle={selectedVehicle}
      />
    </div>
  );
}

