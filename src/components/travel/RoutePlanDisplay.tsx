import React from "react";
import { motion } from "motion/react";
import { 
  Navigation, 
  Clock, 
  Fuel, 
  TrafficCone, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface RoutePlanDisplayProps {
  routePlan: any;
  groundingLinks: any[];
}

export const RoutePlanDisplay: React.FC<RoutePlanDisplayProps> = ({
  routePlan,
  groundingLinks,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-[#1A233A] border-white/10">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Navigation className="w-6 h-6 text-[#00E5FF] mb-2" />
            <p className="text-sm text-white/60">Mesafe</p>
            <p className="text-xl font-bold">{routePlan.distance}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A233A] border-white/10">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Clock className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-sm text-white/60">Tahmini Süre</p>
            <p className="text-xl font-bold">{routePlan.duration}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-[#1A233A] border-white/10">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <Fuel className="w-6 h-6 text-[#FFD600] mb-2" />
            <p className="text-sm text-white/60">Ort. Tüketim</p>
            <p className="text-xl font-bold">{routePlan.averageFuelConsumption}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A233A] border-white/10">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="text-[#00E676] font-bold text-2xl mb-1">₺</div>
            <p className="text-sm text-white/60">Yol Masrafı</p>
            <p className="text-xl font-bold">{routePlan.estimatedCost}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1A233A] border-white/10 overflow-hidden">
        <CardContent className="p-0">
          <div className={`p-4 flex items-center gap-4 ${
            routePlan.trafficStatus === "Yoğun" ? "bg-red-500/10" : 
            routePlan.trafficStatus === "Akıcı" ? "bg-green-500/10" : "bg-blue-500/10"
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              routePlan.trafficStatus === "Yoğun" ? "bg-red-500/20 text-red-500" : 
              routePlan.trafficStatus === "Akıcı" ? "bg-green-500/20 text-green-500" : "bg-blue-500/20 text-blue-500"
            }`}>
              <TrafficCone className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white">Trafik Durumu</h4>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  routePlan.trafficStatus === "Yoğun" ? "bg-red-500/20 text-red-500" : 
                  routePlan.trafficStatus === "Akıcı" ? "bg-green-500/20 text-green-500" : "bg-blue-500/20 text-blue-500"
                }`}>
                  {routePlan.trafficStatus}
                </span>
              </div>
              {routePlan.trafficDelay && (
                <p className="text-sm text-white/60 mt-0.5">
                  Trafik kaynaklı gecikme: <span className="text-red-400 font-medium">{routePlan.trafficDelay}</span>
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {routePlan.fuelStatus === "critical" ? (
        <div className="bg-gradient-to-r from-[#FF3D00]/20 to-red-900/20 border border-[#FF3D00]/30 rounded-2xl p-4 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#FF3D00]/20 flex items-center justify-center border border-[#FF3D00]/30 shrink-0 mt-1">
            <AlertTriangle className="w-5 h-5 text-[#FF3D00]" />
          </div>
          <div>
            <h4 className="font-bold text-white">Yakıt/Şarj Uyarısı</h4>
            <p className="text-sm text-white/70 mt-1">
              Mevcut menziliniz hedefe ulaşmak için yetersiz görünüyor. Yol üzerindeki ilk istasyonda durmanız önerilir.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-[#00E676]/20 to-green-900/20 border border-[#00E676]/30 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#00E676]/20 flex items-center justify-center border border-[#00E676]/30 shrink-0">
            <CheckCircle2 className="w-5 h-5 text-[#00E676]" />
          </div>
          <div>
            <h4 className="font-bold text-white">Menzil Yeterli</h4>
            <p className="text-sm text-white/70">Mevcut yakıtınız/şarjınız hedefe ulaşmak için yeterli.</p>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-medium text-white/80 mb-4">Önerilen Duraklamalar</h3>
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
          {routePlan.stops.map((stop: any) => (
            <div key={stop.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-[#050B14] bg-[#1A233A] text-white/50 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_2px_rgba(255,255,255,0.1)] z-10">
                <stop.icon className={`w-5 h-5 ${stop.color}`} />
              </div>
              
              <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-[#1A233A] border-white/10 hover:border-white/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-base">{stop.name}</h4>
                    <span className="text-xs font-medium px-2 py-1 rounded-lg bg-white/5 text-white/60">
                      {stop.distance}
                    </span>
                  </div>
                  <p className="text-sm text-white/60 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {stop.time}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {groundingLinks.length > 0 && (
        <div className="pt-4 border-t border-white/5">
          <p className="text-xs text-white/40 mb-3 uppercase tracking-wider font-bold">Kaynaklar & Haritalar</p>
          <div className="flex flex-wrap gap-2">
            {groundingLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-white/5 hover:bg-white/10 text-[#00E5FF] px-3 py-1.5 rounded-lg border border-white/10 transition-colors flex items-center gap-2"
              >
                <MapPin className="w-3 h-3" />
                {link.title || "Haritada Gör"}
              </a>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
