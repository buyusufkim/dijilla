import React from "react";
import { motion } from "motion/react";
import { Car, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StepVehicleInfoProps {
  loading: boolean;
  vehicles: any[];
  plate: string;
  setPlate: (val: string) => void;
  onNext: () => void;
}

export const StepVehicleInfo: React.FC<StepVehicleInfoProps> = ({
  loading,
  vehicles,
  plate,
  setPlate,
  onNext,
}) => {
  return (
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
        onClick={onNext}
        disabled={!plate}
        className="w-full py-7 bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] font-bold text-lg rounded-2xl shadow-lg shadow-[#00E5FF]/20 disabled:opacity-50"
      >
        Devam Et <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </motion.div>
  );
};
