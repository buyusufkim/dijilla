import React from "react";
import { ArrowLeft, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AIAssistantHeader: React.FC = () => {
  const navigate = useNavigate();
  return (
    <header className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/20 flex items-center justify-center border border-[#00E5FF]/30">
            <Bot className="w-5 h-5 text-[#00E5FF]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">Yapay Zeka Asistanı</h1>
            <p className="text-[10px] sm:text-xs text-[#00E676] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse"></span>
              Çevrimiçi
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
