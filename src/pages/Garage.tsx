import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Car,
  ShieldCheck,
  Plus,
  Check,
  ChevronRight,
  Home,
  X,
  FileText,
  Fuel,
  BarChart3,
  Bot,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFamily } from "@/context/FamilyContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot, addDoc, orderBy, serverTimestamp } from "@/firebase";

type Vehicle = {
  id: string;
  plate: string;
  brand_model: string;
  brand?: string;
  model?: string;
  year: number;
  fuel_type?: string;
  insurance_expiry: string;
  inspection_expiry: string;
  tax_status: string;
};

export default function Garage() {
  const { activeMember } = useFamily();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [assetType, setAssetType] = useState<"vehicle" | "home">("vehicle");
  const [assetName, setAssetName] = useState("");
  const [assetDetail, setAssetDetail] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [fuelType, setFuelType] = useState("Benzin");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "vehicles"),
      where("user_id", "==", user.uid),
      orderBy("created_at", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vehicleData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vehicle[];
      setVehicles(vehicleData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching vehicles:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleAddAsset = async () => {
    if (!user) return;

    if (assetType === "vehicle") {
      if (!assetName.trim() || !brand.trim() || !model.trim() || !year) return;
      setIsSubmitting(true);
      try {
        await addDoc(collection(db, "vehicles"), {
          user_id: user.uid,
          plate: assetName,
          brand_model: `${brand} ${model}`,
          brand: brand,
          model: model,
          year: Number(year),
          fuel_type: fuelType,
          insurance_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
          inspection_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tax_status: 'Ödendi',
          created_at: serverTimestamp()
        });

        setIsAddingAsset(false);
        setAssetName("");
        setBrand("");
        setModel("");
        setYear(new Date().getFullYear());
        setFuelType("Benzin");
      } catch (error) {
        console.error('Error adding vehicle:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!assetName.trim() || !assetDetail.trim()) return;
      // Mock adding home
      setIsAddingAsset(false);
      setAssetName("");
      setAssetDetail("");
    }
  };

  const calculateDaysLeft = (dateString: string) => {
    if (!dateString) return 0;
    const expiry = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(expiry.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
  };

  return (
    <div className="flex flex-col gap-8 pb-12 relative">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Varlıklarım
          </h1>
          <p className="text-white/60">
            {activeMember.name} adına kayıtlı araç ve konutlar.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddingAsset(true)}>
          <Plus className="w-5 h-5" /> Yeni Varlık Ekle
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vehicles */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Araçlar</h2>
          
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
            </div>
          ) : vehicles.length === 0 ? (
            <Card 
              className="bg-[#1A233A]/50 border-dashed border-2 border-white/10 hover:border-white/20 transition-colors cursor-pointer"
              onClick={() => { setAssetType("vehicle"); setIsAddingAsset(true); }}
            >
              <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="font-medium text-lg mb-2">Yeni Araç Ekle</h3>
              </CardContent>
            </Card>
          ) : (
            <>
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="bg-gradient-to-br from-[#1A233A] to-[#0A1128] border-[#00E5FF]/30 relative overflow-hidden group cursor-pointer mb-4">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/10 rounded-full blur-2xl group-hover:bg-[#00E5FF]/20 transition-colors"></div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00E676]/20 text-[#00E676] text-xs font-medium mb-3 border border-[#00E676]/30">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Kasko Aktif
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">
                          {vehicle.plate}
                        </h2>
                        <p className="text-white/50 text-sm mt-1">
                          {vehicle.brand_model}
                        </p>
                      </div>
                      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                        <Car className="w-8 h-8 text-[#00E5FF]" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
                      <span className="text-sm text-white/60">
                        Detayları Görüntüle
                      </span>
                      <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                    </div>

                    <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/5">
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate('/glovebox'); }}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-[#00E5FF]" />
                        <span className="text-[8px] text-white/40 uppercase font-bold">Torpido</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate('/fuel'); }}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 transition-colors"
                      >
                        <Fuel className="w-4 h-4 text-[#FFD600]" />
                        <span className="text-[8px] text-white/40 uppercase font-bold">Yakıt</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate('/expenses'); }}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 transition-colors"
                      >
                        <BarChart3 className="w-4 h-4 text-[#00E676]" />
                        <span className="text-[8px] text-white/40 uppercase font-bold">Gider</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate('/ai-assistant'); }}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 transition-colors"
                      >
                        <Bot className="w-4 h-4 text-purple-400" />
                        <span className="text-[8px] text-white/40 uppercase font-bold">AI Teşhis</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Card 
                className="bg-[#1A233A]/50 border-dashed border-2 border-white/10 hover:border-white/20 transition-colors cursor-pointer"
                onClick={() => { setAssetType("vehicle"); setIsAddingAsset(true); }}
              >
                <CardContent className="p-4 flex items-center justify-center text-center">
                  <div className="flex items-center gap-2 text-white/60">
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Yeni Araç Ekle</span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Real Estate */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Konutlar</h2>
          <Card className="bg-gradient-to-br from-[#1A233A] to-[#0A1128] border-purple-500/30 relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors"></div>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium mb-3 border border-purple-500/30">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    DASK Aktif
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Beşiktaş Ev
                  </h2>
                  <p className="text-white/50 text-sm mt-1">
                    Barbaros Blv. No:145, Beşiktaş/İstanbul
                  </p>
                </div>
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                  <Home className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
                <span className="text-sm text-white/60">
                  Detayları Görüntüle
                </span>
                <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="bg-[#1A233A]/50 border-dashed border-2 border-white/10 hover:border-white/20 transition-colors cursor-pointer"
            onClick={() => { setAssetType("home"); setIsAddingAsset(true); }}
          >
            <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="font-medium text-lg mb-2">Yeni Konut Ekle</h3>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Asset Modal */}
      <AnimatePresence>
        {isAddingAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
            >
              <Card className="bg-[#1A233A] border-white/10 shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
                  <CardTitle>Yeni Varlık Ekle</CardTitle>
                  <button 
                    onClick={() => setIsAddingAsset(false)}
                    className="p-1 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Varlık Türü</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setAssetType("vehicle")}
                        className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${
                          assetType === "vehicle"
                            ? "bg-[#00E5FF]/20 border-[#00E5FF]/50 text-[#00E5FF]"
                            : "bg-[#0A1128] border-white/10 text-white/60 hover:bg-white/5"
                        }`}
                      >
                        <Car className="w-4 h-4" /> Araç
                      </button>
                      <button
                        onClick={() => setAssetType("home")}
                        className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${
                          assetType === "home"
                            ? "bg-purple-500/20 border-purple-500/50 text-purple-400"
                            : "bg-[#0A1128] border-white/10 text-white/60 hover:bg-white/5"
                        }`}
                      >
                        <Home className="w-4 h-4" /> Konut
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">
                      {assetType === "vehicle" ? "Plaka" : "Konut Adı"}
                    </label>
                    <input
                      type="text"
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      placeholder={assetType === "vehicle" ? "Örn: 34 ABC 123" : "Örn: Yazlık Ev"}
                      className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50 transition-all"
                    />
                  </div>
                  
                  {assetType === "vehicle" ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white/80">Marka</label>
                          <input
                            type="text"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            placeholder="Örn: Tesla"
                            className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white/80">Model</label>
                          <input
                            type="text"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            placeholder="Örn: Model Y"
                            className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50 transition-all"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white/80">Yıl</label>
                          <input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            placeholder="Örn: 2023"
                            className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white/80">Yakıt Türü</label>
                          <select
                            value={fuelType}
                            onChange={(e) => setFuelType(e.target.value)}
                            className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50 transition-all appearance-none"
                          >
                            <option value="Benzin">Benzin</option>
                            <option value="Dizel">Dizel</option>
                            <option value="LPG">LPG</option>
                            <option value="Elektrik">Elektrik</option>
                            <option value="Hibrit">Hibrit</option>
                          </select>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Adres</label>
                      <input
                        type="text"
                        value={assetDetail}
                        onChange={(e) => setAssetDetail(e.target.value)}
                        placeholder="Örn: Bodrum/Muğla"
                        className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50 transition-all"
                      />
                    </div>
                  )}

                  <Button 
                    onClick={handleAddAsset}
                    disabled={isSubmitting || (assetType === "vehicle" ? (!assetName.trim() || !brand.trim() || !model.trim() || !year) : (!assetName.trim() || !assetDetail.trim()))}
                    className="w-full mt-4 bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] font-bold"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Kaydet"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
