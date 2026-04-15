import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface CompanyPricesProps {
  activeTab: "fuel" | "electric";
  locationInfo: { city: string; district: string } | null;
  isDemoMode?: boolean;
}

export const CompanyPrices: React.FC<CompanyPricesProps> = ({
  activeTab,
  locationInfo,
  isDemoMode = false,
}) => {
  if (activeTab !== "fuel") return null;

  const companies = [
    { name: "Opet", logo: "https://www.opet.com.tr/assets/images/logo.png", color: "#005CAB" },
    { name: "Shell", logo: "https://www.shell.com.tr/etc.clientlibs/shell/clientlibs/clientlib-site/resources/resources/logos/shell-logo.svg", color: "#FBCE07" },
    { name: "Petrol Ofisi", logo: "https://www.petrolofisi.com.tr/assets/images/po-logo.png", color: "#E30613" },
    { name: "Aytemiz", logo: "https://www.aytemiz.com.tr/assets/images/logo.png", color: "#F39200" },
    { name: "GO", logo: "https://www.yakitgo.com.tr/assets/images/logo.png", color: "#82BC00" },
    { name: "TotalEnergies", logo: "https://totalenergies.com.tr/themes/custom/totalenergies/logo.svg", color: "#ED1C24" },
    { name: "TP", logo: "https://www.tppd.com.tr/assets/images/logo.png", color: "#E30613" }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <h2 className="text-sm font-medium text-white/60 uppercase tracking-wider">Şirket Bazlı Fiyatlar</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] text-[#00E5FF]">
              {locationInfo ? `${locationInfo.city}, ${locationInfo.district} için liste` : "Konum belirleniyor..."}
            </p>
            {isDemoMode && (
              <span className="text-[8px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                Demo Verisi
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
        {companies.map((company, idx) => {
          // Only show prices in demo mode, otherwise show "Alınamadı"
          const benzin = isDemoMode ? (43.50 + (idx * 0.05)).toFixed(2) : "---";
          const motorin = isDemoMode ? (42.10 + (idx * 0.03)).toFixed(2) : "---";
          const lpg = isDemoMode ? (21.90 + (idx * 0.02)).toFixed(2) : "---";
          
          return (
            <Card key={company.name} className="bg-[#1A233A] border-white/5 overflow-hidden min-w-[280px]">
              <CardContent className="p-4 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center p-2 shrink-0">
                    <span className="text-[8px] font-bold text-center leading-tight">{company.name}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{company.name}</h3>
                    <p className="text-[10px] text-white/40">{isDemoMode ? "Simüle Edilen Fiyat" : "Resmi Liste Fiyatı"}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-white/5 rounded-lg">
                    <p className="text-[8px] text-white/40 uppercase mb-1">Benzin</p>
                    <p className={`text-[11px] font-bold ${isDemoMode ? "text-[#00E676]" : "text-white/20"}`}>{benzin}</p>
                  </div>
                  <div className="text-center p-2 bg-white/5 rounded-lg">
                    <p className="text-[8px] text-white/40 uppercase mb-1">Motorin</p>
                    <p className={`text-[11px] font-bold ${isDemoMode ? "text-[#00E676]" : "text-white/20"}`}>{motorin}</p>
                  </div>
                  <div className="text-center p-2 bg-white/5 rounded-lg">
                    <p className="text-[8px] text-white/40 uppercase mb-1">LPG</p>
                    <p className={`text-[11px] font-bold ${isDemoMode ? "text-[#00E676]" : "text-white/20"}`}>{lpg}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
