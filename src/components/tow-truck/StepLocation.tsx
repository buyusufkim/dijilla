import React from "react";
import { motion } from "motion/react";
import { MapPin, Wrench, Navigation, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StepLocationProps {
  address: string;
  setAddress: (val: string) => void;
  destination: "custom" | "service" | null;
  setDestination: (val: "custom" | "service" | null) => void;
  isLocating: boolean;
  simulateLocation: () => void;
  onBack: () => void;
  onNext: () => void;
}

export const StepLocation: React.FC<StepLocationProps> = ({
  address,
  setAddress,
  destination,
  setDestination,
  isLocating,
  simulateLocation,
  onBack,
  onNext,
}) => {
  return (
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
          onClick={onBack}
          className="flex-1 py-7 border-white/10 hover:bg-white/5 text-white font-bold rounded-2xl"
        >
          Geri
        </Button>
        <Button 
          onClick={onNext}
          disabled={!address || !destination}
          className="flex-[2] py-7 bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] font-bold text-lg rounded-2xl shadow-lg shadow-[#00E5FF]/20 disabled:opacity-50"
        >
          Devam Et <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </motion.div>
  );
};
