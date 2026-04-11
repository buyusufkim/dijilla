import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GarageHeaderProps {
  onAddClick: () => void;
}

export const GarageHeader: React.FC<GarageHeaderProps> = ({ onAddClick }) => {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Droto Finansal Garaj
        </h1>
        <p className="text-white/60 text-xs sm:text-sm sm:text-base">
          Varlıklarınızı yönetin, risklerinizi minimize edin.
        </p>
      </div>
      <Button 
        className="w-full sm:w-auto gap-2 bg-[#00E5FF] text-[#0A1128] hover:bg-[#00B8D4] font-bold h-12 sm:h-10" 
        onClick={onAddClick}
      >
        <Plus className="w-5 h-5" /> Yeni Varlık Ekle
      </Button>
    </header>
  );
};
