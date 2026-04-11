import React from "react";
import { ArrowLeft } from "lucide-react";

interface TravelHeaderProps {
  onBack: () => void;
}

export const TravelHeader: React.FC<TravelHeaderProps> = ({ onBack }) => {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack} 
          className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Seyahat Danışmanı</h1>
      </div>
    </header>
  );
};
