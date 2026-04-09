import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Car,
  Home,
  HeartPulse,
  ShieldCheck,
  Check,
  ChevronRight,
  AlertCircle,
  X,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { collection, query, where, getDocs, orderBy } from "@/firebase";

type InsuranceCategory = "vehicle" | "home" | "health";

export default function Insurance() {
  const [category, setCategory] = useState<InsuranceCategory>("vehicle");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const { notifications, markAsRead } = useNotifications();

  const categories = [
    { id: "vehicle", label: "Araç Sigortası", icon: Car },
    { id: "home", label: "Konut & DASK", icon: Home },
    { id: "health", label: "Tamamlayıcı Sağlık", icon: HeartPulse },
  ];

  const expiringPolicy = notifications.find(n => n.type === "warning" && !n.read && n.link === "/insurance");

  return (
    <div className="flex flex-col gap-8 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Sigorta & Teklifler
          </h1>
          <p className="text-white/60 text-xs sm:text-sm sm:text-base">
            Ailenizin tüm sigorta ihtiyaçlarını tek bir yerden yönetin ve
            karşılaştırın.
          </p>
        </div>
      </header>

      {/* Expiration Reminder */}
      <AnimatePresence>
        {expiringPolicy && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#FF3D00]/10 border border-[#FF3D00]/30 rounded-2xl p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-[#FF3D00]" />
              <p className="text-sm font-medium text-white/90">{expiringPolicy.message}</p>
            </div>
            <button 
              onClick={() => markAsRead(expiringPolicy.id)}
              className="p-1 text-white/40 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setCategory(cat.id as InsuranceCategory);
              setStep(1);
              setSelectedAsset(null);
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              category === cat.id
                ? "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            <cat.icon className="w-5 h-5" />
            {cat.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <AssetSelection
            key="step1"
            category={category}
            onSelect={(asset) => {
              setSelectedAsset(asset);
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <OffersList
            key="step2"
            category={category}
            asset={selectedAsset}
            onBack={() => setStep(1)}
            onPurchase={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <PurchaseSuccess
            key="step3"
            onFinish={() => {
              setStep(1);
              setSelectedAsset(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AssetSelection({
  category,
  onSelect,
}: {
  key?: string;
  category: InsuranceCategory;
  onSelect: (asset: any) => void;
}) {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (category === 'vehicle' && user) {
      fetchVehicles();
    } else {
      setLoading(false);
    }
  }, [category, user]);

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
      }));
      
      // Calculate age for each vehicle
      const currentYear = new Date().getFullYear();
      const vehiclesWithAge = vehicleData.map((v: any) => ({
        ...v,
        name: v.brand_model,
        desc: v.plate,
        age: currentYear - (v.year || currentYear)
      }));
      
      setVehicles(vehiclesWithAge);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock assets based on category
  const assets = {
    vehicle: vehicles,
    home: [
      { id: 3, name: "Beşiktaş Ev", desc: "Barbaros Blv. No:145" },
      { id: 4, name: "Yazlık", desc: "Bodrum/Muğla" },
    ],
    health: [
      { id: 5, name: "Mustafa Gülmarka", desc: "Kendim" },
      { id: 6, name: "Ayşe Gülmarka", desc: "Eşim" },
    ],
  };

  const currentAssets = assets[category] || [];

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <h2 className="text-xl font-semibold mb-6">
        Hangi varlık için teklif almak istiyorsunuz?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentAssets.map((asset) => (
          <Card
            key={asset.id}
            className="cursor-pointer hover:border-[#00E5FF]/50 transition-colors bg-[#1A233A] border-white/10"
            onClick={() => onSelect(asset)}
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">{asset.name}</h3>
                <p className="text-sm text-white/50 mt-1">
                  {asset.plate || asset.desc}
                </p>
                {asset.age > 15 && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-500/10 text-yellow-500 text-xs font-medium border border-yellow-500/20">
                    <AlertCircle className="w-3.5 h-3.5" />
                    15 yaş üstü (Sadece Trafik)
                  </div>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-white/30" />
            </CardContent>
          </Card>
        ))}

        {/* Add New Asset Card */}
        <Card 
          className="cursor-pointer border-dashed border-2 border-white/10 hover:border-white/30 bg-transparent transition-colors flex items-center justify-center min-h-[120px]"
          onClick={() => {
            // Navigate to garage to add new asset
            window.location.href = '/garage';
          }}
        >
          <div className="text-center">
            <span className="text-white/50 font-medium">+ Yeni Ekle</span>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

function OffersList({
  category,
  asset,
  onBack,
  onPurchase,
}: {
  key?: string;
  category: InsuranceCategory;
  asset: any;
  onBack: () => void;
  onPurchase: () => void;
}) {
  const [immUnlimited, setImmUnlimited] = useState(false);
  const [roadsideAssistance, setRoadsideAssistance] = useState(false);
  const [glassCoverage, setGlassCoverage] = useState(false);

  const isCascoEligible = category === "vehicle" && asset.age <= 15;

  // Base prices for mock companies
  const companies = [
    { name: "Allianz", logo: "A", basePrice: 4500, rating: 4.8 },
    { name: "Axa Sigorta", logo: "AX", basePrice: 4200, rating: 4.5 },
    { name: "Anadolu Sigorta", logo: "AN", basePrice: 4800, rating: 4.9 },
  ];

  const calculatePrice = (basePrice: number) => {
    let total = basePrice;
    if (immUnlimited) total += 1200;
    if (roadsideAssistance) total += 400;
    if (glassCoverage) total += 300;
    return total;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col lg:flex-row gap-8"
    >
      {/* Left Column: Offers */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="text-white/50 hover:text-white transition-colors"
          >
            &larr; Geri
          </button>
          <div>
            <h2 className="text-2xl font-bold">{asset.name} için Teklifler</h2>
            <p className="text-sm text-white/50">
              {category === "vehicle"
                ? isCascoEligible
                  ? "Kasko & Trafik"
                  : "Sadece Trafik Sigortası (Araç 15 yaşından büyük)"
                : "Poliçe Teklifleri"}
            </p>
          </div>
        </div>

        {companies.map((company, idx) => (
          <Card
            key={idx}
            className="bg-[#1A233A] border-white/10 overflow-hidden"
          >
            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 font-bold text-xl text-white/80">
                  {company.logo}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{company.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-400 text-sm">★</span>
                    <span className="text-sm text-white/60">
                      {company.rating} Müşteri Puanı
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
                <div className="text-3xl font-bold text-[#00E5FF]">
                  ₺{calculatePrice(company.basePrice).toLocaleString("tr-TR")}
                </div>
                <Button className="w-full sm:w-auto px-8 bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] font-bold" onClick={onPurchase}>Satın Al</Button>
              </div>
            </div>

            <div className="bg-[#0A1128]/50 px-6 py-4 border-t border-white/5 flex flex-wrap gap-4 text-sm text-white/60">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#00E676]" />{" "}
                {immUnlimited ? "Sınırsız İMM" : "Standart İMM (100.000 TL)"}
              </span>
              {roadsideAssistance && (
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#00E676]" /> Genişletilmiş Yol
                  Yardımı
                </span>
              )}
              {glassCoverage && (
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#00E676]" /> Cam Kırılması
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Right Column: Customization Sidebar */}
      <div className="w-full lg:w-80 shrink-0">
        <div className="sticky top-8">
          <Card className="bg-[#1A233A] border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Paketi Özelleştir</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Toggle 1 */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-sm">Sınırsız İMM</p>
                  <p className="text-xs text-white/50 mt-1">
                    Karşı tarafa verilecek zararlarda limitsiz güvence.
                  </p>
                  <p className="text-xs text-[#00E5FF] mt-1">+ ₺1,200</p>
                </div>
                <button
                  onClick={() => setImmUnlimited(!immUnlimited)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${immUnlimited ? "bg-[#00E5FF]" : "bg-white/20"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${immUnlimited ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>

              {/* Toggle 2 */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-sm">
                    Genişletilmiş Yol Yardımı
                  </p>
                  <p className="text-xs text-white/50 mt-1">
                    Sınırsız çekici ve 7 gün ikame araç desteği.
                  </p>
                  <p className="text-xs text-[#00E5FF] mt-1">+ ₺400</p>
                </div>
                <button
                  onClick={() => setRoadsideAssistance(!roadsideAssistance)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${roadsideAssistance ? "bg-[#00E5FF]" : "bg-white/20"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${roadsideAssistance ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>

              {/* Toggle 3 */}
              {isCascoEligible && (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-sm">Cam Kırılması</p>
                    <p className="text-xs text-white/50 mt-1">
                      Yılda 1 kez ücretsiz orijinal cam değişimi.
                    </p>
                    <p className="text-xs text-[#00E5FF] mt-1">+ ₺300</p>
                  </div>
                  <button
                    onClick={() => setGlassCoverage(!glassCoverage)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${glassCoverage ? "bg-[#00E5FF]" : "bg-white/20"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${glassCoverage ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

function PurchaseSuccess({ onFinish }: { key?: string; onFinish: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-24 h-24 bg-[#00E676]/20 rounded-full flex items-center justify-center mb-6 border border-[#00E676]/30">
        <ShieldCheck className="w-12 h-12 text-[#00E676]" />
      </div>
      <h2 className="text-3xl font-bold mb-4">Poliçeniz Başarıyla Oluşturuldu!</h2>
      <p className="text-white/60 max-w-md mb-8">
        Poliçe detaylarınız e-posta adresinize gönderilmiştir. Varlıklarım sayfasından poliçenizi görüntüleyebilirsiniz.
      </p>
      <Button 
        onClick={onFinish}
        className="bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] font-bold px-8 py-6 text-lg rounded-xl"
      >
        Varlıklarıma Dön
      </Button>
    </motion.div>
  );
}
