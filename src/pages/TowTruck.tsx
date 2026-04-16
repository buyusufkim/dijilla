import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/supabase-service";
import { uploadFile, base64ToBlob } from "@/lib/storage";

import { TowTruckHeader } from "@/components/tow-truck/TowTruckHeader";
import { ProgressBar } from "@/components/tow-truck/ProgressBar";
import { StepVehicleInfo } from "@/components/tow-truck/StepVehicleInfo";
import { StepVehiclePhoto } from "@/components/tow-truck/StepVehiclePhoto";
import { StepLocation } from "@/components/tow-truck/StepLocation";
import { StepConfirmation } from "@/components/tow-truck/StepConfirmation";

export default function TowTruck() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [plate, setPlate] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [destination, setDestination] = useState<"custom" | "service" | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [vehiclePhoto, setVehiclePhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const whatsappNumber = import.meta.env.VITE_TOW_TRUCK_WHATSAPP;

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  useEffect(() => {
    if (user) {
      fetchVehicles();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchVehicles = async () => {
    if (!user) return;
    try {
      const { data, error } = await db.from("vehicles").select("*");
      if (error) {
        console.error('Error fetching vehicles DB:', error);
        setLoading(false);
        return;
      }
      
      const vehicleData = (data as any[] || []).filter((v: any) => v.user_id === (user.id || user.uid));
      
      setVehicles(vehicleData);
      if (vehicleData.length > 0) {
        setPlate(vehicleData[0].plate);
      }
    } catch (error) {
      console.error('Error fetching vehicles catch:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate(-1);
  };

  const handleSubmitRequest = async () => {
    if (!user || !plate || !phone || !address || !destination) return;

    if (!whatsappNumber) {
      setError("Çekici hizmeti şu anda yapılandırılmamış. Lütfen daha sonra tekrar deneyin.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      let photoUrl = null;
      let photoPath = null;

      if (vehiclePhoto && vehiclePhoto.startsWith('data:image')) {
        // 1. Compress
        const compressedBase64 = await compressImage(vehiclePhoto);
        // 2. Convert to Blob
        const blob = base64ToBlob(compressedBase64);
        // 3. Upload to Storage
        const fileName = `tow_${user.id || user.uid}_${Date.now()}.jpg`;
        const storagePath = `service_requests/tow/${user.id || user.uid}/${fileName}`;
        const uploadResult = await uploadFile(blob, storagePath);
        
        photoUrl = uploadResult.url;
        photoPath = uploadResult.path;
      }

      await db.from("service_requests").insert({
        user_id: user.id || user.uid,
        type: "tow",
        plate: plate,
        phone: phone,
        location_address: address,
        destination: destination === "service" ? "Yetkili Servis" : "Özel Konum",
        status: "pending",
        photo_url: photoUrl, // Keep for backward compatibility/UI
        photo_path: photoPath,
        photo_uploaded_at: photoUrl ? new Date().toISOString() : null
      });

      // After saving to DB, open WhatsApp
      handleWhatsAppSend();
    } catch (error: any) {
      console.error('Error submitting request:', error);
      setError(error.message || "Talebiniz kaydedilirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppSend = () => {
    if (!whatsappNumber) return;
    
    const message = `🚀 *ÇEKİCİ TALEBİ* 🚀\n\n` +
      `🚗 *Araç Plakası:* ${plate}\n` +
      `📱 *İletişim:* ${phone}\n` +
      `📍 *Konum:* ${address || "Otomatik Konum"}\n` +
      `🏁 *Hedef:* ${destination === "service" ? "Yetkili Servis" : "Özel Konum"}\n` +
      `📸 *Fotoğraf:* ${vehiclePhoto ? "Sistem Kaydına Eklendi ✅" : "Eklenmedi"}\n\n` +
      `_Not: Fotoğraf güvenliğiniz için Droto sistemine kaydedilmiştir. WhatsApp üzerinden yalnızca metin iletilmektedir._`;
      
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");
  };

  const simulateLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          let addressFound = false;

          if (apiKey) {
            try {
              const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`);
              const data = await response.json();
              if (data.status === "OK" && data.results && data.results.length > 0) {
                setAddress(data.results[0].formatted_address);
                addressFound = true;
              } else if (data.status === "REQUEST_DENIED") {
                console.warn("Google Geocoding API denied request (Legacy API not activated?)");
              }
            } catch (error) {
              console.error("Reverse geocoding error:", error);
            }
          }

          if (!addressFound) {
            try {
              const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
              const data = await response.json();
              if (data.display_name) {
                setAddress(data.display_name);
                addressFound = true;
              }
            } catch (error) {
              console.error("Nominatim reverse geocoding error:", error);
            }
          }
          
          if (!addressFound) {
            setAddress(`${latitude}, ${longitude}`);
          }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVehiclePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-full flex flex-col gap-6">
      <TowTruckHeader onBack={handleBack} />
      
      <ProgressBar step={step} totalSteps={totalSteps} />

      <div className="flex-1 relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <StepVehicleInfo 
              loading={loading}
              vehicles={vehicles}
              plate={plate}
              setPlate={setPlate}
              onNext={handleNext}
            />
          )}

          {step === 2 && (
            <StepVehiclePhoto 
              vehiclePhoto={vehiclePhoto}
              setVehiclePhoto={setVehiclePhoto}
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              onBack={handleBack}
              onNext={handleNext}
            />
          )}

          {step === 3 && (
            <StepLocation 
              address={address}
              setAddress={setAddress}
              destination={destination}
              setDestination={setDestination}
              isLocating={isLocating}
              simulateLocation={simulateLocation}
              onBack={handleBack}
              onNext={handleNext}
            />
          )}

          {step === 4 && (
            <div className="space-y-4">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  {error}
                </div>
              )}
              <StepConfirmation 
                phone={phone}
                setPhone={setPhone}
                plate={plate}
                address={address}
                destination={destination}
                vehiclePhoto={vehiclePhoto}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmitRequest}
                onBack={handleBack}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

