import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from "@/firebase";

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
      const q = query(
        collection(db, "vehicles"),
        where("user_id", "==", user.uid),
        orderBy("created_at", "desc")
      );
      const querySnapshot = await getDocs(q);
      const vehicleData = querySnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      setVehicles(vehicleData);
      if (vehicleData.length > 0) {
        setPlate(vehicleData[0].plate);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
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

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "service_requests"), {
        user_id: user.uid,
        type: "tow",
        plate: plate,
        phone: phone,
        location_address: address,
        destination: destination === "service" ? "Yetkili Servis" : "Özel Konum",
        status: "pending",
        created_at: serverTimestamp(),
      });

      // After saving to DB, open WhatsApp
      handleWhatsAppSend();
    } catch (error) {
      console.error('Error submitting request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppSend = () => {
    const message = `🚀 *Çekici Talebi*\n\n🚗 *Araç:* ${plate}\n📱 *Telefon:* ${phone}\n📍 *Konum:* ${address || "Otomatik Konum"}\n🏁 *Hedef:* ${destination === "service" ? "Yetkili Servis" : "Özel Konum"}\n📸 *Fotoğraf:* ${vehiclePhoto ? "Eklendi" : "Eklenmedi"}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/905000000000?text=${encodedMessage}`, "_blank");
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
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

