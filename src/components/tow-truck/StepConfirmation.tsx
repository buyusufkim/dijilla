import React from "react";
import { motion } from "motion/react";
import { Smartphone, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StepConfirmationProps {
  phone: string;
  setPhone: (val: string) => void;
  plate: string;
  address: string;
  destination: "custom" | "service" | null;
  vehiclePhoto: string | null;
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

export const StepConfirmation: React.FC<StepConfirmationProps> = ({
  phone,
  setPhone,
  plate,
  address,
  destination,
  vehiclePhoto,
  isSubmitting,
  onSubmit,
  onBack,
}) => {
  return (
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
          onClick={onSubmit}
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
          onClick={onBack}
          className="w-full py-4 text-white/40 hover:text-white"
        >
          Bilgileri Düzenle
        </Button>
      </div>
    </motion.div>
  );
};
