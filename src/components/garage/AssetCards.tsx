import React from "react";
import { motion } from "motion/react";
import { 
  Car, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  Wrench, 
  Plus, 
  ChevronRight, 
  FileText, 
  Fuel, 
  BarChart3, 
  Bot,
  Home as HomeIcon
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Vehicle, HomeAsset } from "./types";
import { calculateRisk } from "@/lib/risk-engine";
import { calculateDaysLeft } from "./utils";

interface VehicleCardProps {
  vehicle: Vehicle;
  maintenanceRecords: any[];
  onNavigate: (path: string) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ 
  vehicle, 
  maintenanceRecords, 
  onNavigate
}) => {
  const daysToInsurance = calculateDaysLeft(vehicle.insurance_expiry);
  const isInsuranceWarning = daysToInsurance <= 30;
  const latestMaintenance = maintenanceRecords.find(m => m.vehicle_id === vehicle.id);
  const risk = calculateRisk(vehicle);

  return (
    <Card 
      onClick={() => onNavigate(`/garage/${vehicle.id}`)}
      className="bg-gradient-to-br from-[#1A233A] to-[#0A1128] border-[#00E5FF]/30 relative overflow-hidden group cursor-pointer h-full border border-transparent hover:border-[#00E5FF]/30 transition-colors"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/10 rounded-full blur-2xl group-hover:bg-[#00E5FF]/20 transition-colors"></div>
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              {isInsuranceWarning ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FFD600]/20 text-[#FFD600] text-[10px] font-bold border border-[#FFD600]/30">
                  <AlertTriangle className="w-3 h-3" />
                  Kasko ({daysToInsurance} gün)
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00E676]/20 text-[#00E676] text-[10px] font-bold border border-[#00E676]/30">
                  <ShieldCheck className="w-3 h-3" />
                  Kasko Aktif
                </div>
              )}
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                (100 - risk.healthScore) > 70 ? 'bg-red-500/20 text-red-500 border-red-500/30' : 
                (100 - risk.healthScore) > 40 ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' : 
                'bg-green-500/20 text-green-500 border-green-500/30'
              }`}>
                <ShieldAlert className="w-3 h-3" />
                Risk: {100 - risk.healthScore}
              </div>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              {vehicle.plate}
            </h2>
            <p className="text-white/50 text-sm mt-1">
              {vehicle.brand_model}
            </p>
          </div>
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
            <Car className="w-8 h-8 text-[#00E5FF]" />
          </div>
        </div>

        {/* Maintenance Section */}
        <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FFD600]/10 flex items-center justify-center shrink-0">
              <Wrench className="w-4 h-4 text-[#FFD600]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white/40">Son Bakım</p>
              <p className="text-sm font-medium truncate">
                {latestMaintenance ? `${latestMaintenance.service_type}` : "Kayıt Yok"}
              </p>
            </div>
          </div>
          <Button 
            onClick={(e) => { e.stopPropagation(); onNavigate('/maintenance'); }}
            size="sm" 
            variant="ghost" 
            className="h-8 px-2 text-[#00E5FF] hover:bg-[#00E5FF]/10 shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" /> Ekle
          </Button>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
          <span className="text-sm text-white/60">
            Detayları Görüntüle
          </span>
          <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/5">
          <button 
            onClick={(e) => { e.stopPropagation(); onNavigate('/glovebox'); }}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <FileText className="w-4 h-4 text-[#00E5FF]" />
            <span className="text-[8px] text-white/40 uppercase font-bold">Torpido</span>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onNavigate('/fuel'); }}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <Fuel className="w-4 h-4 text-[#FFD600]" />
            <span className="text-[8px] text-white/40 uppercase font-bold">Yakıt</span>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onNavigate('/expenses'); }}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-[#00E676]" />
            <span className="text-[8px] text-white/40 uppercase font-bold">Gider</span>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onNavigate('/ai-assistant'); }}
            className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span className="text-[8px] text-white/40 uppercase font-bold">AI Teşhis</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

interface HomeCardProps {
  home: HomeAsset;
}

export const HomeCard: React.FC<HomeCardProps> = ({ home }) => {
  return (
    <Card className="bg-gradient-to-br from-[#1A233A] to-[#0A1128] border-purple-500/30 relative overflow-hidden group cursor-pointer border border-transparent hover:border-purple-500/30 transition-colors">
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors"></div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium mb-3 border border-purple-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              DASK Aktif
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              {home.name}
            </h2>
            <p className="text-white/50 text-sm mt-1">
              {home.address}
            </p>
          </div>
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
            <HomeIcon className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-2">
          <span className="text-sm text-white/60">
            Detayları Görüntüle
          </span>
          <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
};

interface EmptyAssetCardProps {
  type: "vehicle" | "home";
  onClick: () => void;
}

export const EmptyAssetCard: React.FC<EmptyAssetCardProps> = ({ type, onClick }) => {
  return (
    <Card 
      className="bg-[#1A233A]/50 border-dashed border-2 border-white/10 hover:border-white/20 transition-colors cursor-pointer h-full"
      onClick={onClick}
    >
      <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <Plus className="w-8 h-8 text-white/40" />
        </div>
        <h3 className="font-medium text-lg mb-2">
          {type === "vehicle" ? "Yeni Araç Ekle" : "Yeni Konut Ekle"}
        </h3>
      </CardContent>
    </Card>
  );
};
