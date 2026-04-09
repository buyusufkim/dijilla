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
  Loader2,
  AlertTriangle,
  Wrench,
  Bell,
  ShieldAlert,
  Zap,
  ArrowRight,
  Crown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFamily } from "@/context/FamilyContext";
import { useNotifications } from "@/context/NotificationContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot, addDoc, orderBy, serverTimestamp } from "@/firebase";
import { calculateRisk } from "@/lib/risk-engine";

type Vehicle = {
  id: string;
  plate: string;
  brand_model: string;
  brand?: string;
  model?: string;
  year: number;
  mileage?: number;
  insurance_expiry: string;
  inspection_expiry: string;
  tax_status: string;
};

type HomeAsset = {
  id: string;
  name: string;
  address: string;
};

export default function Garage() {
  const { activeMember } = useFamily();
  const { addNotification } = useNotifications();
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
  const [mileage, setMileage] = useState(0);
  const [inspectionExpiry, setInspectionExpiry] = useState(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [setReminder, setSetReminder] = useState(true);
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [homes, setHomes] = useState<HomeAsset[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const qVehicles = query(
      collection(db, "vehicles"),
      where("user_id", "==", user.uid),
      orderBy("created_at", "desc")
    );

    const unsubscribeVehicles = onSnapshot(qVehicles, (snapshot) => {
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

    const qHomes = query(
      collection(db, "homes"),
      where("user_id", "==", user.uid),
      orderBy("created_at", "desc")
    );

    const unsubscribeHomes = onSnapshot(qHomes, (snapshot) => {
      const homeData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HomeAsset[];
      setHomes(homeData);
    }, (error) => {
      console.error("Error fetching homes:", error);
    });

    const qMaintenance = query(
      collection(db, "maintenance_records"),
      where("user_id", "==", user.uid),
      orderBy("date", "desc")
    );

    const unsubscribeMaintenance = onSnapshot(qMaintenance, (snapshot) => {
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMaintenanceRecords(records);
    }, (error) => {
      console.error("Error fetching maintenance:", error);
    });

    return () => {
      unsubscribeVehicles();
      unsubscribeHomes();
      unsubscribeMaintenance();
    };
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
          mileage: Number(mileage),
          fuel_type: fuelType,
          insurance_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
          inspection_expiry: inspectionExpiry,
          tax_status: 'Ödendi',
          created_at: serverTimestamp()
        });

        if (setReminder) {
          addNotification({
            title: "Muayene Hatırlatıcısı Kuruldu",
            message: `${assetName} plakalı aracınızın muayenesi için hatırlatıcı ayarlandı.`,
            type: "info"
          });
        }

        setIsAddingAsset(false);
        setAssetName("");
        setBrand("");
        setModel("");
        setYear(new Date().getFullYear());
        setFuelType("Benzin");
        setMileage(0);
        setInspectionExpiry(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      } catch (error) {
        console.error('Error adding vehicle:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!assetName.trim() || !assetDetail.trim()) return;
      setIsSubmitting(true);
      try {
        await addDoc(collection(db, "homes"), {
          user_id: user.uid,
          name: assetName,
          address: assetDetail,
          created_at: serverTimestamp()
        });

        setIsAddingAsset(false);
        setAssetName("");
        setAssetDetail("");
      } catch (error) {
        console.error('Error adding home:', error);
      } finally {
        setIsSubmitting(false);
      }
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
    <div className="flex flex-col gap-8 pb-12 relative w-full overflow-x-hidden">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Droto Finansal Garaj
          </h1>
          <p className="text-white/60 text-xs sm:text-sm sm:text-base">
            Varlıklarınızı yönetin, risklerinizi minimize edin.
          </p>
        </div>
        <Button className="w-full sm:w-auto gap-2 bg-[#00E5FF] text-[#0A1128] hover:bg-[#00B8D4] font-bold h-12 sm:h-10" onClick={() => setIsAddingAsset(true)}>
          <Plus className="w-5 h-5" /> Yeni Varlık Ekle
        </Button>
      </header>

      {/* Premium Pitch Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => navigate('/premium')}
        className="bg-gradient-to-r from-[#FFD600] to-[#FFA000] p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between cursor-pointer group shadow-2xl shadow-[#FFD600]/10 gap-4"
      >
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-black rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl shrink-0">
            <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-[#FFD600]" />
          </div>
          <div>
            <h3 className="text-black font-black text-lg sm:text-xl tracking-tighter">Droto Premium</h3>
            <p className="text-black/60 text-xs sm:text-sm font-bold">Aracınız için asla endişelenmeyin.</p>
          </div>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black/10 rounded-full flex items-center justify-center group-hover:bg-black/20 transition-colors">
          <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
        </div>
      </motion.div>

      {/* Monetization Banner */}
      {vehicles.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate(`/insurance-purchase/${vehicles[0].id}`)}
          className="bg-gradient-to-r from-[#FFD600] to-[#FFA000] p-4 rounded-[1.5rem] sm:rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-[#FFD600]/20 cursor-pointer group"
        >
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-[#0A1128]" />
            </div>
            <div>
              <h4 className="font-bold text-[#0A1128] text-base sm:text-lg">Sigortada %25 İndirim Fırsatı!</h4>
              <p className="text-[#0A1128]/80 text-xs sm:text-sm">Poliçenizi Droto güvencesiyle hemen yenileyin.</p>
            </div>
          </div>
          <Button className="w-full sm:w-auto bg-[#0A1128] text-white hover:bg-black font-bold gap-2 whitespace-nowrap">
            Teklif Al <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Vehicles */}
        <div className="space-y-6 md:col-span-2 xl:col-span-2">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vehicles.map((vehicle) => {
                const daysToInsurance = calculateDaysLeft(vehicle.insurance_expiry);
                const isInsuranceWarning = daysToInsurance <= 30;
                const latestMaintenance = maintenanceRecords.find(m => m.vehicle_id === vehicle.id);
                const risk = calculateRisk(vehicle);

                return (
                <Card 
                  key={vehicle.id} 
                  onClick={() => navigate(`/garage/${vehicle.id}`)}
                  className="bg-gradient-to-br from-[#1A233A] to-[#0A1128] border-[#00E5FF]/30 relative overflow-hidden group cursor-pointer h-full border border-transparent hover:border-[#00E5FF]/30 transition-colors"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/10 rounded-full blur-2xl group-hover:bg-[#00E5FF]/20 transition-colors"></div>
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {isInsuranceWarning ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFD600]/20 text-[#FFD600] text-[10px] font-bold border border-[#FFD600]/30">
                              <AlertTriangle className="w-3 h-3" />
                              Kasko ({daysToInsurance} gün)
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00E676]/20 text-[#00E676] text-[10px] font-bold border border-[#00E676]/30">
                              <ShieldCheck className="w-3 h-3" />
                              Kasko Aktif
                            </div>
                          )}
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            (100 - risk.healthScore) > 70 ? 'bg-red-500/20 text-red-500 border-red-500/30' : 
                            (100 - risk.healthScore) > 40 ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' : 
                            'bg-green-500/20 text-green-500 border-green-500/30'
                          }`}>
                            <ShieldAlert className="w-3 h-3" />
                            Risk: {100 - risk.healthScore}
                          </div>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">
                          {vehicle.plate}
                        </h2>
                        <p className="text-white/50 text-sm mt-1">
                          {vehicle.brand_model}
                        </p>
                      </div>
                      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                        <Car className="w-8 h-8 text-[#00E5FF]" />
                      </div>
                    </div>

                    {/* Maintenance Section */}
                    <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#FFD600]/10 flex items-center justify-center shrink-0">
                          <Wrench className="w-4 h-4 text-[#FFD600]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-white/40">Son Bakım</p>
                          <p className="text-sm font-medium truncate">
                            {latestMaintenance ? `${latestMaintenance.service_type}` : "Kayıt Yok"}
                          </p>
                        </div>
                      </div>
                      <Button 
                        onClick={(e) => { e.stopPropagation(); navigate('/maintenance'); }}
                        size="sm" 
                        variant="ghost" 
                        className="h-8 px-2 text-[#00E5FF] hover:bg-[#00E5FF]/10 shrink-0"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Ekle
                      </Button>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
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
                );
              })}
              <Card 
                className="bg-[#1A233A]/50 border-dashed border-2 border-white/10 hover:border-white/20 transition-colors cursor-pointer h-full flex items-center justify-center"
                onClick={() => { setAssetType("vehicle"); setIsAddingAsset(true); }}
              >
                <CardContent className="p-4 flex items-center justify-center text-center">
                  <div className="flex items-center gap-2 text-white/60">
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Yeni Araç Ekle</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Real Estate */}
        <div className="space-y-6 md:col-span-2 xl:col-span-1">
          <h2 className="text-xl font-semibold">Konutlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6">
            {homes.map((home) => (
              <Card key={home.id} className="bg-gradient-to-br from-[#1A233A] to-[#0A1128] border-purple-500/30 relative overflow-hidden group cursor-pointer border border-transparent hover:border-purple-500/30 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors"></div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium mb-3 border border-purple-500/30">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        DASK Aktif
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight">
                        {home.name}
                      </h2>
                      <p className="text-white/50 text-sm mt-1">
                        {home.address}
                      </p>
                    </div>
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
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
            ))}

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
                          <label className="text-sm font-medium text-white/80">Kilometre</label>
                          <input
                            type="number"
                            value={mileage}
                            onChange={(e) => setMileage(Number(e.target.value))}
                            placeholder="Örn: 45000"
                            className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-white/80">Muayene Tarihi</label>
                          <input
                            type="date"
                            value={inspectionExpiry}
                            onChange={(e) => setInspectionExpiry(e.target.value)}
                            className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50 transition-all"
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
                      <div className="flex items-center gap-2 mt-2">
                        <input 
                          type="checkbox" 
                          id="setReminder" 
                          checked={setReminder}
                          onChange={(e) => setSetReminder(e.target.checked)}
                          className="w-4 h-4 rounded border-white/10 bg-[#0A1128] text-[#00E5FF] focus:ring-[#00E5FF]/50"
                        />
                        <label htmlFor="setReminder" className="text-sm text-white/80 flex items-center gap-1">
                          <Bell className="w-3 h-3 text-[#FFD600]" />
                          Muayene hatırlatıcısı kur
                        </label>
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
