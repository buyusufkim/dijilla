import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Car, Home, Bell, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetType: "vehicle" | "home";
  setAssetType: (type: "vehicle" | "home") => void;
  assetName: string;
  setAssetName: (name: string) => void;
  assetDetail: string;
  setAssetDetail: (detail: string) => void;
  brand: string;
  setBrand: (brand: string) => void;
  model: string;
  setModel: (model: string) => void;
  year: number;
  setYear: (year: number) => void;
  fuelType: string;
  setFuelType: (type: string) => void;
  mileage: number;
  setMileage: (mileage: number) => void;
  inspectionExpiry: string;
  setInspectionExpiry: (date: string) => void;
  setReminder: boolean;
  setSetReminder: (reminder: boolean) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({
  isOpen,
  onClose,
  assetType,
  setAssetType,
  assetName,
  setAssetName,
  assetDetail,
  setAssetDetail,
  brand,
  setBrand,
  model,
  setModel,
  year,
  setYear,
  fuelType,
  setFuelType,
  mileage,
  setMileage,
  inspectionExpiry,
  setInspectionExpiry,
  setReminder,
  setSetReminder,
  isSubmitting,
  onSubmit,
}) => {
  const isFormInvalid = assetType === "vehicle" 
    ? (!assetName.trim() || !brand.trim() || !model.trim() || !year) 
    : (!assetName.trim() || !assetDetail.trim());

  return (
    <AnimatePresence>
      {isOpen && (
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
                  onClick={onClose}
                  className="p-1 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="assetType" className="text-sm font-medium text-white/80">Varlık Türü</label>
                  <div id="assetType" className="grid grid-cols-2 gap-2">
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
                  <label htmlFor="assetName" className="text-sm font-medium text-white/80">
                    {assetType === "vehicle" ? "Plaka" : "Konut Adı"}
                  </label>
                  <input
                    id="assetName"
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
                        <label htmlFor="brand" className="text-sm font-medium text-white/80">Marka</label>
                        <input
                          id="brand"
                          type="text"
                          value={brand}
                          onChange={(e) => setBrand(e.target.value)}
                          placeholder="Örn: Tesla"
                          className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="model" className="text-sm font-medium text-white/80">Model</label>
                        <input
                          id="model"
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
                        <label htmlFor="mileage" className="text-sm font-medium text-white/80">Kilometre</label>
                        <input
                          id="mileage"
                          type="number"
                          value={mileage}
                          onChange={(e) => setMileage(Number(e.target.value))}
                          placeholder="Örn: 45000"
                          className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="inspectionExpiry" className="text-sm font-medium text-white/80">Muayene Tarihi</label>
                        <input
                          id="inspectionExpiry"
                          type="date"
                          value={inspectionExpiry}
                          onChange={(e) => setInspectionExpiry(e.target.value)}
                          className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50 transition-all"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="year" className="text-sm font-medium text-white/80">Yıl</label>
                        <input
                          id="year"
                          type="number"
                          value={year}
                          onChange={(e) => setYear(Number(e.target.value))}
                          placeholder="Örn: 2023"
                          className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="fuelType" className="text-sm font-medium text-white/80">Yakıt Türü</label>
                        <select
                          id="fuelType"
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
                    <label htmlFor="assetDetail" className="text-sm font-medium text-white/80">Adres</label>
                    <input
                      id="assetDetail"
                      type="text"
                      value={assetDetail}
                      onChange={(e) => setAssetDetail(e.target.value)}
                      placeholder="Örn: Bodrum/Muğla"
                      className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50 transition-all"
                    />
                  </div>
                )}

                <Button 
                  onClick={onSubmit}
                  disabled={isSubmitting || isFormInvalid}
                  className={`w-full mt-4 font-bold transition-all ${
                    isSubmitting 
                      ? "bg-white/10 text-white/40 cursor-not-allowed" 
                      : isFormInvalid
                        ? "bg-white/5 text-white/20 cursor-not-allowed"
                        : "bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128]"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Kaydediliyor...
                    </span>
                  ) : (
                    "Kaydet"
                  )}
                </Button>
                
                {isFormInvalid && !isSubmitting && (
                  <p className="text-[10px] text-center text-white/30 mt-2">
                    Lütfen tüm zorunlu alanları (*) doldurun.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
