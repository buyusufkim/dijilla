import React from "react";
import { ShieldAlert, AlertTriangle, TrendingUp, Zap, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskAnalysis } from "@/lib/risk-engine";

interface RiskReportProps {
  riskAnalysis: RiskAnalysis;
}

export const RiskReport: React.FC<RiskReportProps> = ({ riskAnalysis }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-[#FF3D00]" />
        Droto Risk Raporu
      </h3>
      
      <Card className="bg-[#1A233A] border-[#FF3D00]/20 overflow-hidden">
        <div className="bg-gradient-to-r from-[#FF3D00]/20 to-transparent p-4 border-b border-white/5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider font-bold">Araç Sağlık Skoru</p>
              <p className="text-3xl font-bold text-white">{riskAnalysis.healthScore}<span className="text-lg text-white/40">/100</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40 uppercase tracking-wider font-bold">Risk Seviyesi</p>
              <p className={`text-xl font-bold ${
                riskAnalysis.riskLevel === 'High' ? 'text-red-500' : 
                riskAnalysis.riskLevel === 'Medium' ? 'text-yellow-500' : 
                'text-green-500'
              }`}>{riskAnalysis.riskLevel === 'High' ? 'Yüksek' : riskAnalysis.riskLevel === 'Medium' ? 'Orta' : 'Düşük'}</p>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6 space-y-6">
          {/* Predicted Issues */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-sm font-bold text-white/60 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                Öngörülen Olası Sorunlar
              </p>
              <ul className="space-y-2">
                {riskAnalysis.predictedIssues.map((issue, idx) => (
                  <li key={idx} className="text-sm text-white/80 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm font-bold text-white/60 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#00E5FF]" />
                Finansal Maruziyet (Tahmini)
              </p>
              <p className="text-2xl font-bold text-[#00E5FF]">
                ₺{riskAnalysis.predictedMaintenanceCost.toLocaleString('tr-TR')}
              </p>
              <p className="text-xs text-white/40">
                Önümüzdeki 3 ay içinde beklenen minimum teknik maliyet yükü.
              </p>
            </div>
          </div>

          {/* 🔥 SALES BLOCK */}
          <div className="bg-[#FF3D00]/10 border border-[#FF3D00]/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FF3D00] flex items-center justify-center shrink-0 shadow-lg shadow-[#FF3D00]/40">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-lg leading-tight">
                  {riskAnalysis.salesBlock.urgentMessage}
                </h4>
                <div className="space-y-2 mt-3">
                  {riskAnalysis.salesBlock.persuasivePoints.map((point, idx) => (
                    <p key={idx} className="text-sm text-white/70 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#00E676] shrink-0 mt-0.5" />
                      {point}
                    </p>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button className="flex-1 bg-[#FF3D00] hover:bg-[#D53300] text-white font-bold h-12 text-base shadow-lg shadow-[#FF3D00]/20">
                Şimdi Korunmaya Başla
              </Button>
              <Button variant="outline" className="flex-1 border-white/20 hover:bg-white/5 h-12 text-base">
                Teklifleri İncele
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
