import React from "react";
import { Search } from "lucide-react";

interface ServiceHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const ServiceHeader: React.FC<ServiceHeaderProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Hizmetler Merkezi
        </h1>
        <p className="text-white/60 text-xs sm:text-sm sm:text-base">
          İhtiyacınız olan tüm hizmetlere hızlıca erişin.
        </p>
      </div>

      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-white/40" />
        <input
          type="text"
          placeholder="Hizmet veya işlem ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#1A233A] border border-white/10 rounded-xl py-2.5 sm:py-3 pl-10 sm:pl-12 pr-4 text-sm sm:text-base text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/50 transition-all"
        />
      </div>
    </header>
  );
};
