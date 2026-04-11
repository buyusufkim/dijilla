import React from "react";
import { AlertTriangle, ShieldCheck, Calendar, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Vehicle, calculateDaysLeft } from "./types";

interface VehicleStatusCardsProps {
  vehicle: Vehicle;
  onSetReminder: () => void;
}

export const VehicleStatusCards: React.FC<VehicleStatusCardsProps> = ({ vehicle, onSetReminder }) => {
  const daysToInsurance = calculateDaysLeft(vehicle.insurance_expiry);
  const daysToInspection = calculateDaysLeft(vehicle.inspection_expiry);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Durum & Hatırlatıcılar</h3>
      
      {/* Insurance Status */}
      <Card className={`border ${daysToInsurance <= 30 ? 'bg-[#FFD600]/10 border-[#FFD600]/30' : 'bg-[#1A233A] border-white/10'}`}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${daysToInsurance <= 30 ? 'bg-[#FFD600]/20 text-[#FFD600]' : 'bg-[#00E676]/20 text-[#00E676]'}`}>
              {daysToInsurance <= 30 ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-semibold">Kasko & Sigorta</p>
              <p className="text-sm text-white/60">
                {daysToInsurance <= 30 
                  ? `${daysToInsurance} gün kaldı (${new Date(vehicle.insurance_expiry).toLocaleDateString('tr-TR')})`
                  : `Geçerlilik: ${new Date(vehicle.insurance_expiry).toLocaleDateString('tr-TR')}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inspection Status */}
      <Card className={`border ${daysToInspection <= 30 ? 'bg-[#FFD600]/10 border-[#FFD600]/30' : 'bg-[#1A233A] border-white/10'}`}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${daysToInspection <= 30 ? 'bg-[#FFD600]/20 text-[#FFD600]' : 'bg-white/5 text-white/60'}`}>
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Araç Muayenesi</p>
              <p className="text-sm text-white/60">
                {daysToInspection <= 30 
                  ? `${daysToInspection} gün kaldı (${new Date(vehicle.inspection_expiry).toLocaleDateString('tr-TR')})`
                  : `Geçerlilik: ${new Date(vehicle.inspection_expiry).toLocaleDateString('tr-TR')}`}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSetReminder}
            className="border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF]/10 gap-2"
          >
            <Bell className="w-4 h-4" />
            Hatırlat
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
