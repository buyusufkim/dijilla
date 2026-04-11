import React from "react";
import { Wrench, AlertTriangle, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskAnalysis } from "@/lib/risk-engine";

interface MaintenanceRecommendationsProps {
  recommendations: RiskAnalysis['maintenanceRecommendations'];
}

export const MaintenanceRecommendations: React.FC<MaintenanceRecommendationsProps> = ({ recommendations }) => {
  if (recommendations.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Wrench className="w-5 h-5 text-[#00E676]" />
        Kişiselleştirilmiş Bakım Önerileri
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec, idx) => (
          <Card key={idx} className="bg-[#0A0A0A] border-white/5 p-6 rounded-3xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-bold text-white">{rec.title}</h4>
                <p className="text-xs text-white/40">{rec.importance}</p>
              </div>
              <div className="bg-[#FF3D00]/10 p-2 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-[#FF3D00]" />
              </div>
            </div>
            
            <div className="bg-white/5 p-3 rounded-2xl">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Risk Analizi</p>
              <p className="text-xs text-red-400 font-medium">{rec.riskIfIgnored}</p>
            </div>

            <div className="pt-2 border-t border-white/5 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FFD600]" />
                <p className="text-xs font-bold text-[#FFD600] uppercase tracking-wider">Droto Çözümü</p>
              </div>
              <p className="text-sm text-white/70">{rec.monetization.suggestion}</p>
              <Button className="w-full bg-white/5 hover:bg-white/10 text-white font-bold h-10 rounded-xl text-xs">
                {rec.monetization.cta}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
