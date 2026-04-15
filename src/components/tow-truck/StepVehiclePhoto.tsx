import React from "react";
import { motion } from "motion/react";
import { Camera, X, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StepVehiclePhotoProps {
  vehiclePhoto: string | null;
  setVehiclePhoto: (val: string | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
  onNext: () => void;
}

export const StepVehiclePhoto: React.FC<StepVehiclePhotoProps> = ({
  vehiclePhoto,
  setVehiclePhoto,
  fileInputRef,
  handleFileChange,
  onBack,
  onNext,
}) => {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Araç Fotoğrafı</h2>
        <p className="text-white/60 text-sm">Aracın bulunduğu konumu ve durumunu gösteren bir fotoğraf çekin.</p>
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
          <Camera className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-200/70 leading-relaxed">
            <span className="font-bold text-blue-300">Bilgi:</span> Fotoğrafınız dijital talep kaydınıza (DB) güvenli bir şekilde eklenir. WhatsApp üzerinden teknik kısıtlamalar nedeniyle yalnızca metin mesajı iletilir, ancak ekiplerimiz sistem üzerinden fotoğrafa erişebilir.
          </p>
        </div>
      </div>

      <Card className="bg-[#1A233A] border-white/10 overflow-hidden">
        <CardContent className="p-6">
          <div 
            onClick={() => !vehiclePhoto && fileInputRef.current?.click()}
            className={cn(
              "relative aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all cursor-pointer overflow-hidden",
              vehiclePhoto 
                ? "border-transparent bg-black" 
                : "border-white/10 bg-[#0A1128] hover:border-[#00E5FF]/30 hover:bg-[#00E5FF]/5"
            )}
          >
            {vehiclePhoto ? (
              <>
                <img src={vehiclePhoto} alt="Vehicle" className="w-full h-full object-cover" />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setVehiclePhoto(null);
                  }}
                  className="absolute top-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-[#00E5FF]/10 flex items-center justify-center border border-[#00E5FF]/20">
                  <Camera className="w-8 h-8 text-[#00E5FF]" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-white/80">Fotoğraf Çek veya Yükle</p>
                  <p className="text-xs text-white/40 mt-1">Çekicinin sizi daha kolay bulmasını sağlar</p>
                </div>
              </>
            )}
          </div>
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </CardContent>
      </Card>

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
          className="flex-[2] py-7 bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] font-bold text-lg rounded-2xl shadow-lg shadow-[#00E5FF]/20"
        >
          {vehiclePhoto ? "Devam Et" : "Fotoğrafsız Devam Et"} <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </motion.div>
  );
};
