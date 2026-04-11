import React from "react";
import { Car } from "lucide-react";

interface VehicleSelectorProps {
  vehicles: any[];
  selectedVehicleId: string;
  onVehicleChange: (vid: string) => void;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  vehicles,
  selectedVehicleId,
  onVehicleChange,
}) => {
  if (vehicles.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {vehicles.map((v) => (
        <button
          key={v.id}
          onClick={() => onVehicleChange(v.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
            selectedVehicleId === v.id
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
