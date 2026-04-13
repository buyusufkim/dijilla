import React from "react";
import { Vehicle } from "./types";

interface MaintenanceHeaderProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (v: Vehicle) => void;
}

export const MaintenanceHeader: React.FC<MaintenanceHeaderProps> = ({
  vehicles,
  selectedVehicle,
  setSelectedVehicle,
}) => {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl sm:text-3xl font-bold tracking-tight mb-2">Bakım Planlama</h1>
        <p className="text-white/60 text-xs sm:text-sm sm:text-base">Aracınızın sağlığını koruyun ve ömrünü uzatın.</p>
      </div>
      
      {vehicles.length > 0 && (
        <div className="flex items-center gap-2 sm:gap-3 bg-[#1A233A] p-2 rounded-2xl border border-white/10 overflow-x-auto whitespace-nowrap scrollbar-hide max-w-full sm:max-w-xs md:max-w-md">
          {vehicles.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVehicle(v)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 ${
                selectedVehicle?.id === v.id
                  ? "bg-[#00E5FF] text-[#0A1128] shadow-lg shadow-[#00E5FF]/20"
                  : "text-white/60 hover:bg-white/5"
              }`}
            >
              {v.plate}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
