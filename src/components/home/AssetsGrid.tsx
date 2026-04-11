import React from "react";
import { motion } from "motion/react";
import { ShieldCheck, Home as HomeIcon, HeartPulse, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CarIcon, AlertCircle } from "./Icons";

interface AssetsGridProps {
  displayName: string;
  loadingVehicles: boolean;
  vehicles: any[];
  navigate: (path: string) => void;
}

export const AssetsGrid: React.FC<AssetsGridProps> = ({
  displayName,
  loadingVehicles,
  vehicles,
  navigate,
}) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-white/80">
          {displayName} Varlıkları & Durumları
        </h3>
      </div>

      {loadingVehicles ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Vehicle Cards */}
          {vehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + (index * 0.1) }}
            >
              <Card 
                className="overflow-hidden border-none bg-gradient-to-br from-[#1A233A] to-[#0A1128] relative h-full cursor-pointer hover:border-[#00E5FF]/30 transition-colors border border-transparent"
                onClick={() => navigate("/garage")}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/10 rounded-full blur-2xl"></div>
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00E676]/20 text-[#00E676] text-xs font-medium mb-3 border border-[#00E676]/30">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Kasko Aktif
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight">
                        {vehicle.plate}
                      </h2>
                      <p className="text-white/50 text-sm mt-1">
                        {vehicle.year} {vehicle.brand_model}
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                      <CarIcon className="w-10 h-10 text-white/80" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-4 mt-auto">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                        Kasko
                      </p>
                      <p className="text-sm font-medium">145 Gün</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                        Muayene
                      </p>
                      <p className="text-sm font-medium text-[#FF3D00]">15 Gün</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                        MTV
                      </p>
                      <p className="text-sm font-medium text-[#00E5FF]">Ödendi</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Home Card (Mock) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
              className="overflow-hidden border-none bg-gradient-to-br from-[#1A233A] to-[#0A1128] relative h-full cursor-pointer hover:border-purple-500/30 transition-colors border border-transparent"
              onClick={() => navigate("/garage")}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium mb-3 border border-purple-500/30">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      DASK Aktif
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      Beşiktaş Ev
                    </h2>
                    <p className="text-white/50 text-sm mt-1">
                      Barbaros Blv. No:145
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                    <HomeIcon className="w-8 h-8 text-white/80" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 mt-auto">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                      DASK Yenileme
                    </p>
                    <p className="text-sm font-medium">210 Gün</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                      Konut Sigortası
                    </p>
                    <p className="text-sm font-medium text-white/50">
                      Yok - Teklif Al
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Health Card (Mock) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="overflow-hidden border-none bg-gradient-to-br from-[#1A233A] to-[#0A1128] relative h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF3D00]/10 rounded-full blur-2xl"></div>
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF3D00]/20 text-[#FF3D00] text-xs font-medium mb-3 border border-[#FF3D00]/30">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Poliçe Yok
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      Sağlık Sigortası
                    </h2>
                    <p className="text-white/50 text-sm mt-1">
                      Tamamlayıcı Sağlık (TSS)
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                    <HeartPulse className="w-8 h-8 text-white/80" />
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <button 
                    onClick={() => navigate("/insurance")}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium border border-white/10 transition-colors"
                  >
                    Hemen Teklif Al
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </section>
  );
};
