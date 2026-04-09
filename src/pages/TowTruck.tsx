import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, 
  MapPin, 
  Wrench, 
  Smartphone,
  Navigation,
  Car,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Camera,
  Upload,
  X,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from "@/firebase";

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
    try {
      const q = query(
        collection(db, "vehicles"),
        where("user_id", "==", user.uid),
        orderBy("created_at", "desc")
      );
      const querySnapshot = await getDocs(q);
      const vehicleData = querySnapshot.docs.map(doc => ({
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
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="p-2 bg-[#1A233A] rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Çekici Çağır</h1>
            <p className="text-white/50 text-xs sm:text-sm">Yol yardım talebi oluşturun</p>
          </div>
        </div>
        <div className="hidden sm:block">
          <Logo textClassName="text-xl" iconSize="w-8 h-8" />
        </div>
      </header>

      {/* Progress Bar */}
      <div className="flex items-center gap-2 px-1">
        {[1, 2, 3, 4].map((s) => (
          <div 
            key={s}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-500",
              s <= step ? "bg-[#00E5FF]" : "bg-white/10"
            )}
          />
        ))}
      </div>

      {/* Wizard Content */}
      <div className="flex-1 relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Araç Bilgileri</h2>
                <p className="text-white/60 text-sm">Yardım bekleyen aracın plakasını doğrulayın.</p>
              </div>

              <Card className="bg-[#1A233A] border-white/10 overflow-hidden">
                <CardContent className="p-6 space-y-6">
                  {loading ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="w-6 h-6 animate-spin text-[#00E5FF]" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Araç Plakası</label>
                      <div className="relative">
                        <Car className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00E5FF]" />
                        {vehicles.length > 0 ? (
                          <select
                            value={plate}
                            onChange={(e) => setPlate(e.target.value)}
                            className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-xl font-bold tracking-widest focus:outline-none focus:border-[#00E5FF]/50 transition-all appearance-none"
                          >
                            {vehicles.map(v => (
                              <option key={v.id} value={v.plate}>{v.plate} ({v.brand_model})</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={plate}
                            onChange={(e) => setPlate(e.target.value)}
                            placeholder="Plaka Giriniz"
                            className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-xl font-bold tracking-widest focus:outline-none focus:border-[#00E5FF]/50 transition-all"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {plate && (
                    <div className="p-4 bg-[#00E5FF]/5 rounded-xl border border-[#00E5FF]/20 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#00E5FF] shrink-0 mt-0.5" />
                      <p className="text-sm text-white/70 leading-relaxed">
                        Sistemimizde kayıtlı olan <span className="text-white font-bold">{vehicles.find(v => v.plate === plate)?.brand_model || "Aracınız"}</span> için işlem yapılıyor.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button 
                onClick={handleNext}
                disabled={!plate}
                className="w-full py-7 bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] font-bold text-lg rounded-2xl shadow-lg shadow-[#00E5FF]/20 disabled:opacity-50"
              >
                Devam Et <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Araç Fotoğrafı</h2>
                <p className="text-white/60 text-sm">Aracın bulunduğu konumu ve durumunu gösteren bir fotoğraf çekin.</p>
              </div>

              <Card className="bg-[#1A233A] border-white/10 overflow-hidden">
                <CardContent className="p-6">
                  <div 
                    onClick={() => !vehiclePhoto && fileInputRef.current?.click()}
                    className={cn(
                      "relative aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all cursor-pointer overflow-hidden",
                      vehiclePhoto 
                        ? "border-transparent bg-black" 
                        : "border-white/10 bg-[#0A1128] hover:border-[#00E5FF]/30 hover:bg-[#00E5FF]/5"
                    )}
                  >
                    {vehiclePhoto ? (
                      <>
                        <img src={vehiclePhoto} alt="Vehicle" className="w-full h-full object-cover" />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setVehiclePhoto(null);
                          }}
                          className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-[#00E5FF]/10 flex items-center justify-center border border-[#00E5FF]/20">
                          <Camera className="w-8 h-8 text-[#00E5FF]" />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-white/80">Fotoğraf Çek veya Yükle</p>
                          <p className="text-xs text-white/40 mt-1">Çekicinin sizi daha kolay bulmasını sağlar</p>
                        </div>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 py-7 border-white/10 hover:bg-white/5 text-white font-bold rounded-2xl"
                >
                  Geri
                </Button>
                <Button 
                  onClick={handleNext}
                  className="flex-[2] py-7 bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] font-bold text-lg rounded-2xl shadow-lg shadow-[#00E5FF]/20"
                >
                  {vehiclePhoto ? "Devam Et" : "Fotoğrafsız Devam Et"} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Konum & Hedef</h2>
                <p className="text-white/60 text-sm">Bulunduğunuz yeri ve nereye gitmek istediğinizi seçin.</p>
              </div>

              <div className="space-y-4">
                <Card className="bg-[#1A233A] border-white/10">
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Bulunduğunuz Konum</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Adresinizi yazın..."
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="flex-1 bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-[#00E5FF]/50 transition-all"
                        />
                        <button 
                          onClick={simulateLocation}
                          disabled={isLocating}
                          className="w-12 h-12 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-xl flex items-center justify-center text-[#00E5FF] hover:bg-[#00E5FF]/20 transition-all disabled:opacity-50"
                        >
                          {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Nereye Gitmek İstiyorsunuz?</label>
                      <div className="grid grid-cols-1 gap-3">
                        <button 
                          onClick={() => setDestination("service")}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
                            destination === "service" 
                              ? "bg-[#00E5FF]/10 border-[#00E5FF] text-[#00E5FF]" 
                              : "bg-[#0A1128] border-white/10 text-white/60 hover:bg-white/5"
                          )}
                        >
                          <Wrench className="w-5 h-5" />
                          <div className="flex-1">
                            <p className="font-bold text-sm">Yetkili Servis</p>
                            <p className="text-xs opacity-60">En yakın anlaşmalı servise götür</p>
                          </div>
                        </button>
                        <button 
                          onClick={() => setDestination("custom")}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
                            destination === "custom" 
                              ? "bg-[#00E5FF]/10 border-[#00E5FF] text-[#00E5FF]" 
                              : "bg-[#0A1128] border-white/10 text-white/60 hover:bg-white/5"
                          )}
                        >
                          <Navigation className="w-5 h-5" />
                          <div className="flex-1">
                            <p className="font-bold text-sm">Özel Konum</p>
                            <p className="text-xs opacity-60">Kendi belirlediğim adrese götür</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 py-7 border-white/10 hover:bg-white/5 text-white font-bold rounded-2xl"
                >
                  Geri
                </Button>
                <Button 
                  onClick={handleNext}
                  disabled={!address || !destination}
                  className="flex-[2] py-7 bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] font-bold text-lg rounded-2xl shadow-lg shadow-[#00E5FF]/20 disabled:opacity-50"
                >
                  Devam Et <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Onay & İletişim</h2>
                <p className="text-white/60 text-sm">Talebinizi tamamlamak için telefon numaranızı girin.</p>
              </div>

              <Card className="bg-[#1A233A] border-white/10">
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Telefon Numarası</label>
                    <div className="relative">
                      <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00E5FF]" />
                      <input
                        type="tel"
                        placeholder="05xx xxx xx xx"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-4 pl-12 pr-4 text-lg font-medium focus:outline-none focus:border-[#00E5FF]/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Talep Özeti</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/40">Araç:</span>
                        <span className="font-medium">{plate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/40">Konum:</span>
                        <span className="font-medium truncate max-w-[200px]">{address}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/40">Hedef:</span>
                        <span className="font-medium">{destination === "service" ? "Yetkili Servis" : "Özel Konum"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/40">Fotoğraf:</span>
                        <span className="font-medium text-[#00E676]">{vehiclePhoto ? "Eklendi" : "Eklenmedi"}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmitRequest}
                  disabled={!phone || isSubmitting}
                  className="w-full py-5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl flex items-center justify-center gap-3 font-bold text-lg shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                    <>
                      <Smartphone className="w-6 h-6" />
                      WhatsApp ile Gönder
                    </>
                  )}
                </motion.button>
                <Button 
                  variant="ghost"
                  onClick={handleBack}
                  className="w-full py-4 text-white/40 hover:text-white"
                >
                  Bilgileri Düzenle
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

