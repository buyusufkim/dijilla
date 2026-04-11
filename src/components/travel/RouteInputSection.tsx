import React from "react";
import { MapPin, Navigation, Map as MapIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DestinationInput } from "./DestinationInput";

interface RouteInputSectionProps {
  startLocation: string;
  setStartLocation: (val: string) => void;
  endLocation: string;
  setEndLocation: (val: string) => void;
  isLocating: boolean;
  onUseMyLocation: () => void;
  isPlanning: boolean;
  onPlanRoute: () => void;
  isGoogleEnabled: boolean;
  canPlan: boolean;
  planErrorMsg: string;
}

export const RouteInputSection: React.FC<RouteInputSectionProps> = ({
  startLocation,
  setStartLocation,
  endLocation,
  setEndLocation,
  isLocating,
  onUseMyLocation,
  isPlanning,
  onPlanRoute,
  isGoogleEnabled,
  canPlan,
  planErrorMsg,
}) => {
  return (
    <Card className="bg-[#1A233A] border-white/10">
      <CardContent className="p-6 space-y-4">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-[#00E5FF]"></div>
          <label htmlFor="startLocation" className="sr-only">Nereden?</label>
          <input
            id="startLocation"
            type="text"
            placeholder="Nereden?"
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
            className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 pl-12 pr-28 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50 transition-all"
          />
          <button
            onClick={onUseMyLocation}
            disabled={isLocating}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00E5FF] text-xs font-medium bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 px-2 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            {isLocating ? (
              <div className="w-3 h-3 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <MapPin className="w-3 h-3" />
            )}
            Konum
          </button>
        </div>
        
        <div className="relative flex justify-center -my-2 z-10">
          <div className="bg-[#1A233A] p-1 rounded-full border border-white/10">
            <Navigation className="w-4 h-4 text-white/40 rotate-180" />
          </div>
        </div>

        <DestinationInput 
          value={endLocation} 
          onChange={setEndLocation} 
          onSelect={(val) => setEndLocation(val)}
          isGoogleEnabled={isGoogleEnabled}
        />

        <Button 
          onClick={onPlanRoute}
          disabled={!canPlan || isPlanning}
          className="w-full bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] font-bold py-6 rounded-xl mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPlanning ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-[#0A1128] border-t-transparent rounded-full animate-spin"></div>
              Rota Hesaplanıyor...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <MapIcon className="w-5 h-5" /> Rota Planla
            </span>
          )}
        </Button>

        {planErrorMsg && !isPlanning && (
          <p className="text-[10px] text-center text-white/30 mt-2">
            {planErrorMsg}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
