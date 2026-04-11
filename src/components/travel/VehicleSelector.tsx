import React from "react";
import { Car, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface VehicleSelectorProps {
  vehicles: any[];
  selectedVehicle: any;
  onSelect: (vehicle: any) => void;
  onAddVehicle: () => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  vehicles,
  selectedVehicle,
  onSelect,
  onAddVehicle,
}) => {
  if (vehicles.length === 0) {
    return (
      <Card className="bg-amber-500/5 border-amber-500/20">
        <CardContent className="p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-200">Kayıtlı Araç Bulunamadı</p>
            <p className="text-xs text-amber-200/60">Rota planlamak için önce "Garajım" sayfasından bir araç eklemelisiniz.</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAddVehicle}
            className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
          >
            Araç Ekle
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {vehicles.map((v) => (
        <button
          key={v.id}
          onClick={() => onSelect(v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
            selectedVehicle?.id === v.id
              ? "bg-[#00E5FF]/20 border border-[#00E5FF]/50 text-[#00E5FF]"
              : "bg-[#1A233A] border border-white/10 text-white/60 hover:bg-white/5"
          }`}
        >
          <Car className="w-4 h-4" />
          <span className="text-sm font-medium">{v.plate}</span>
          {v.fuel_type && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/80">
              {v.fuel_type}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};
