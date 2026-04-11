import React from "react";
import { motion } from "motion/react";
import { 
  Fuel as FuelIcon, 
  MapPin, 
  Navigation, 
  Star, 
  ChevronRight,
  Zap
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Station } from "./types";

interface StationCardProps {
  station: Station;
}

export const StationCard: React.FC<StationCardProps> = ({ station }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Card className="bg-[#1A233A] border-white/10 hover:border-[#00E5FF]/30 transition-all group overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 mb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center shrink-0">
                  {station.type === "fuel" ? <FuelIcon className="w-5 h-5 text-[#00E5FF]" /> : <Zap className="w-5 h-5 text-[#FFD600]" />}
                </div>
                <div>
                  <h3 className="font-semibold">{station.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Star className="w-3 h-3 text-[#FFD600] fill-[#FFD600]" />
                    <span className="text-xs text-white/60">{station.rating.toFixed(1)}</span>
                    <span className="text-white/20">•</span>
                    <span className="text-xs text-white/60">{station.distance}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 px-1">
              <MapPin className="w-3.5 h-3.5 text-white/30 mt-0.5 shrink-0" />
              <p className="text-xs text-white/50 leading-relaxed">{station.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-3 border-t border-white/5">
            <Button 
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lon}`, '_blank')}
              className="flex-1 bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/20 rounded-xl gap-2"
            >
              <Navigation className="w-4 h-4" />
              Yol Tarifi
            </Button>
            <Button variant="ghost" className="p-2 hover:bg-white/5 rounded-xl">
              <ChevronRight className="w-5 h-5 text-white/40" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
