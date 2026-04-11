import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  CheckCircle2,
  Loader2,
  MapPin,
  ChevronRight,
  Camera,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Place } from "./types";

interface ServiceModalProps {
  selectedService: any;
  onClose: () => void;
  showSuccess: boolean;
  loadingPlaces: boolean;
  places: Place[];
  isProcessing: boolean;
  onAction: () => void;
  onNavigateToPlace: (lat: number, lon: number) => void;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  selectedService,
  onClose,
  showSuccess,
  loadingPlaces,
  places,
  isProcessing,
  onAction,
  onNavigateToPlace,
}) => {
  const renderServiceContent = () => {
    if (showSuccess) {
      return (
        <div className="py-8 text-center space-y-4">
          <div className="w-16 h-16 bg-[#00E676]/20 rounded-full flex items-center justify-center mx-auto border border-[#00E676]/30">
            <CheckCircle2 className="w-8 h-8 text-[#00E676]" />
          </div>
          <h3 className="text-xl font-bold">İşlem Başarılı!</h3>
          <p className="text-white/60 text-sm">Talebiniz alınmıştır. Detaylar e-posta ile gönderilecektir.</p>
        </div>
      );
    }

    switch (selectedService?.label) {
      case "Nöbetçi Eczane":
      case "Anlaşmalı Hastane":
      case "Oto Servisler":
        return (
          <div className="space-y-4">
            <p className="text-sm text-white/60 text-left">Size en yakın noktalar listelenmiştir:</p>
            {loadingPlaces ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
              </div>
            ) : places.length === 0 ? (
              <div className="text-center py-8 text-white/40">
                Yakınınızda uygun nokta bulunamadı.
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {places.map((item, i) => (
                  <div 
                    key={i} 
                    onClick={() => onNavigateToPlace(item.lat, item.lon)}
                    className="p-4 bg-[#0A1128] rounded-xl border border-white/5 flex items-center justify-between group hover:border-[#00E5FF]/30 transition-all cursor-pointer"
                  >
                    <div className="text-left flex-1 mr-4">
                      <p className="font-bold text-sm">{item.name}</p>
                      <p className="text-xs text-white/40 mt-1 line-clamp-1">{item.addr}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-[#00E5FF]">{item.dist.toFixed(1)} km</p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-white/20 group-hover:text-[#00E5FF] transition-colors">
                        <MapPin className="w-3 h-3" />
                        <span className="text-[10px] uppercase font-bold">Yol Tarifi</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "Nöbetçi Noter":
        const noterItems = [
          { name: "1. Noter", dist: "0.8 km", addr: "Merkez Mah. No:5" },
          { name: "2. Noter", dist: "2.1 km", addr: "Sanayi Sit. No:14" },
        ];
        return (
          <div className="space-y-4">
            <p className="text-sm text-white/60 text-left">Size en yakın nöbetçi noterler:</p>
            <div className="space-y-3">
              {noterItems.map((item, i) => (
                <div key={i} className="p-4 bg-[#0A1128] rounded-xl border border-white/5 flex items-center justify-between group hover:border-[#00E5FF]/30 transition-all cursor-pointer">
                  <div className="text-left">
                    <p className="font-bold text-sm">{item.name}</p>
                    <p className="text-xs text-white/40 mt-1">{item.addr}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#00E5FF]">{item.dist}</p>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 ml-auto mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "MTV Ödeme":
      case "Trafik Cezası":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-[#0A1128] rounded-xl border border-white/5 text-left">
                <p className="text-xs text-white/40 uppercase font-bold tracking-widest mb-2">Araç Plakası</p>
                <p className="text-lg font-bold">34 ABC 123</p>
              </div>
              <div className="p-4 bg-[#0A1128] rounded-xl border border-white/5 text-left flex justify-between items-center">
                <div>
                  <p className="text-xs text-white/40 uppercase font-bold tracking-widest mb-1">Toplam Borç</p>
                  <p className="text-2xl font-bold text-[#00E5FF]">₺1.450,00</p>
                </div>
                <div className="text-xs bg-[#00E5FF]/10 text-[#00E5FF] px-2 py-1 rounded">Vadesi Geçmiş</div>
              </div>
            </div>
            <Button 
              onClick={onAction}
              disabled={isProcessing}
              className="w-full py-6 bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] font-bold rounded-xl"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Şimdi Öde"}
            </Button>
          </div>
        );

      case "Muayene Randevusu":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              {["12 Nisan", "13 Nisan", "14 Nisan", "15 Nisan"].map(date => (
                <button key={date} className="p-3 bg-[#0A1128] border border-white/10 rounded-xl text-sm hover:border-[#00E5FF] transition-all">
                  {date}
                </button>
              ))}
            </div>
            <Button 
              onClick={onAction}
              disabled={isProcessing}
              className="w-full py-6 bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] font-bold rounded-xl"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Randevu Al"}
            </Button>
          </div>
        );

      case "Kaza Tutanağı":
        return (
          <div className="space-y-6">
            <div className="p-6 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center gap-3 hover:border-[#00E5FF]/30 transition-all cursor-pointer">
              <Camera className="w-10 h-10 text-[#00E5FF]" />
              <p className="text-sm font-medium">Kaza Fotoğraflarını Yükle</p>
              <p className="text-xs text-white/40">Veya e-tutanak formunu doldurmaya başla</p>
            </div>
            <Button 
              onClick={onAction}
              disabled={isProcessing}
              className="w-full py-6 bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] font-bold rounded-xl"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Tutanak Oluştur"}
            </Button>
          </div>
        );

      default:
        return (
          <p className="text-white/70 mb-6">
            Bu hizmet şu anda geliştirme aşamasındadır. Çok yakında kullanıma sunulacaktır.
          </p>
        );
    }
  };

  return (
    <AnimatePresence>
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md"
          >
            <Card className="bg-[#1A233A] border-white/10 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${selectedService.bg} flex items-center justify-center border border-white/5`}>
                    <selectedService.icon className={`w-5 h-5 ${selectedService.color}`} />
                  </div>
                  <CardTitle>{selectedService.label}</CardTitle>
                </div>
                <button 
                  onClick={onClose}
                  className="p-1 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <CardContent className="pt-6">
                {renderServiceContent()}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
