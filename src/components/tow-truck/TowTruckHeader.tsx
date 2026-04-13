import React from "react";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";

interface TowTruckHeaderProps {
  onBack: () => void;
}

export const TowTruckHeader: React.FC<TowTruckHeaderProps> = ({ onBack }) => {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 bg-[#1A233A] rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Çekici Çağır</h1>
          <p className="text-white/50 text-xs sm:text-sm">Yol yardım talebi oluşturun</p>
        </div>
      </div>
      <div className="hidden sm:block">
        <Logo textClassName="text-xl" iconSize="w-8 h-8" />
      </div>
    </header>
  );
};
