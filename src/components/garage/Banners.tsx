import React from "react";
import { motion } from "motion/react";
import { Crown, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Vehicle } from "./types";

interface PremiumBannerProps {
  onClick: () => void;
}

export const PremiumBanner: React.FC<PremiumBannerProps> = ({ onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
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
  );
};

interface MonetizationBannerProps {
  vehicle: Vehicle;
  onClick: () => void;
}

export const MonetizationBanner: React.FC<MonetizationBannerProps> = ({ vehicle, onClick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
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
  );
};
