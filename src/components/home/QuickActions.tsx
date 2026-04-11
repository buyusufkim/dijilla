import React from "react";
import { Wrench, Zap, ShieldCheck } from "lucide-react";
import { CarIcon } from "./Icons";

interface QuickActionsProps {
  navigate: (path: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ navigate }) => {
  return (
    <section className="mt-4">
      <h3 className="text-lg font-medium text-white/80 mb-6">
        Hızlı İşlemler
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <QuickAction
          icon={Wrench}
          label="Çekici Çağır"
          color="text-[#00E5FF]"
          bg="bg-[#00E5FF]/10"
          onClick={() => navigate("/tow-truck")}
        />
        <QuickAction
          icon={Zap}
          label="Akü Desteği"
          color="text-[#00E676]"
          bg="bg-[#00E676]/10"
          onClick={() => navigate("/sos")}
        />
        <QuickAction
          icon={CarIcon}
          label="Lastik Desteği"
          color="text-[#FF3D00]"
          bg="bg-[#FF3D00]/10"
          onClick={() => navigate("/sos")}
        />
        <QuickAction
          icon={ShieldCheck}
          label="Kaza Tutanağı"
          color="text-purple-400"
          bg="bg-purple-400/10"
          onClick={() => navigate("/services")}
        />
      </div>
    </section>
  );
};

function QuickAction({ icon: Icon, label, color, bg, onClick }: any) {
  return (
    <button onClick={onClick} className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 p-3 sm:p-4 bg-[#1A233A] rounded-2xl border border-white/5 hover:border-white/20 transition-all active:scale-95 group">
      <div
        className={`w-10 h-10 sm:w-14 sm:h-14 shrink-0 rounded-xl flex items-center justify-center ${bg} border border-white/5 group-hover:scale-110 transition-transform`}
      >
        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color}`} strokeWidth={2} />
      </div>
      <span className="font-medium text-[11px] sm:text-base text-white/90 text-center sm:text-left leading-tight">{label}</span>
    </button>
  );
}
