import React from "react";
import { Car } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Vehicle } from "./types";

interface VehicleInfoCardProps {
  vehicle: Vehicle;
}

export const VehicleInfoCard: React.FC<VehicleInfoCardProps> = ({ vehicle }) => {
  return (
    <Card className="bg-gradient-to-br from-[#1A233A] to-[#0A1128] border-[#00E5FF]/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/10 rounded-full blur-2xl"></div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{vehicle.plate}</h2>
            <p className="text-white/60 text-lg mt-1">{vehicle.brand_model}</p>
          </div>
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
            <Car className="w-8 h-8 text-[#00E5FF]" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col items-center sm:items-start">
            <p className="text-xs text-white/40 mb-1">Yıl</p>
            <p className="font-semibold">{vehicle.year}</p>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col items-center sm:items-start">
            <p className="text-xs text-white/40 mb-1">Kilometre</p>
            <p className="font-semibold">{vehicle.mileage?.toLocaleString() || "0"} km</p>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex flex-col items-center sm:items-start">
            <p className="text-xs text-white/40 mb-1">Yakıt Türü</p>
            <p className="font-semibold">{vehicle.fuel_type || "Belirtilmemiş"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
