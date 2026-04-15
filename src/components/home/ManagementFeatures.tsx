import React from "react";
import { 
  FileText, 
  Fuel, 
  BarChart3, 
  Wrench, 
  Map 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BotIcon } from "./Icons";

interface ManagementFeaturesProps {
  navigate: (path: string) => void;
}

export const ManagementFeatures: React.FC<ManagementFeaturesProps> = ({ navigate }) => {
  return (
    <section>
      <h3 className="text-lg font-medium text-white/80 mb-6">Akıllı Yönetim</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card 
          onClick={() => navigate('/glovebox')}
          className="bg-[#1A233A] border-white/10 hover:border-[#00E5FF]/30 transition-all cursor-pointer group"
        >
          <CardContent className="p-3 sm:p-4 flex flex-col items-center text-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#00E5FF]" />
            </div>
            <div>
              <p className="font-bold text-[11px] sm:text-sm">Dijital Torpido</p>
              <p className="text-[9px] sm:text-[10px] text-white/40">Belgelerim</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => navigate('/travel-advisor')}
          className="bg-[#1A233A] border-white/10 hover:border-[#00E5FF]/30 transition-all cursor-pointer group"
        >
          <CardContent className="p-3 sm:p-4 flex flex-col items-center text-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#FF3D00]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Map className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF3D00]" />
            </div>
            <div>
              <p className="font-bold text-[11px] sm:text-sm">Seyahat Danışmanı</p>
              <p className="text-[9px] sm:text-[10px] text-white/40">Rota & İhtiyaçlar</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => navigate('/fuel')}
          className="bg-[#1A233A] border-white/10 hover:border-[#00E5FF]/30 transition-all cursor-pointer group"
        >
          <CardContent className="p-3 sm:p-4 flex flex-col items-center text-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#FFD600]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Fuel className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFD600]" />
            </div>
            <div>
              <p className="font-bold text-[11px] sm:text-sm">Yakıt & Şarj</p>
              <p className="text-[9px] sm:text-[10px] text-white/40">İstasyon Bul</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => navigate('/expenses')}
          className="bg-[#1A233A] border-white/10 hover:border-[#00E5FF]/30 transition-all cursor-pointer group"
        >
          <CardContent className="p-3 sm:p-4 flex flex-col items-center text-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#00E676]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-[#00E676]" />
            </div>
            <div>
              <p className="font-bold text-[11px] sm:text-sm">Gider Takibi</p>
              <p className="text-[9px] sm:text-[10px] text-white/40">Analiz & Tasarruf</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => navigate('/ai-assistant')}
          className="bg-[#1A233A] border-white/10 hover:border-[#00E5FF]/30 transition-all cursor-pointer group"
        >
          <CardContent className="p-3 sm:p-4 flex flex-col items-center text-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BotIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            </div>
            <div>
              <p className="font-bold text-[11px] sm:text-sm">AI Teşhis</p>
              <p className="text-[9px] sm:text-[10px] text-white/40">Arıza Analizi</p>
            </div>
          </CardContent>
        </Card>

        <Card 
          onClick={() => navigate('/maintenance')}
          className="bg-[#1A233A] border-white/10 hover:border-[#00E5FF]/30 transition-all cursor-pointer group"
        >
          <CardContent className="p-3 sm:p-4 flex flex-col items-center text-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-[#00E5FF]" />
            </div>
            <div>
              <p className="font-bold text-[11px] sm:text-sm">Bakım Planı</p>
              <p className="text-[9px] sm:text-[10px] text-white/40">Randevu & Takip</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
