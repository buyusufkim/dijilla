import React from "react";
import { Wrench, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MaintenanceRecord } from "./types";

interface MaintenanceHistoryProps {
  records: MaintenanceRecord[];
  onNavigateToMaintenance: () => void;
}

export const MaintenanceHistory: React.FC<MaintenanceHistoryProps> = ({
  records,
  onNavigateToMaintenance
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Geçmiş Bakımlar</h3>
        <Button 
          onClick={onNavigateToMaintenance}
          variant="ghost" 
          size="sm" 
          className="text-[#00E5FF] hover:bg-[#00E5FF]/10 gap-1"
        >
          <Plus className="w-4 h-4" />
          Bakım Ekle
        </Button>
      </div>

      {records.length === 0 ? (
        <Card className="bg-[#1A233A] border-white/10">
          <CardContent className="p-8 text-center">
            <Wrench className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/60">Henüz bakım kaydı bulunmuyor.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <Card key={record.id} className="bg-[#1A233A] border-white/10">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#FFD600]/10 flex items-center justify-center">
                      <Wrench className="w-4 h-4 text-[#FFD600]" />
                    </div>
                    <div>
                      <p className="font-semibold">{record.service_type}</p>
                      <p className="text-xs text-white/40">{new Date(record.date).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                  <p className="font-bold text-[#00E676]">{record.cost.toLocaleString('tr-TR')} TL</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/60 mt-3 pt-3 border-t border-white/5">
                  <span>{record.mileage.toLocaleString('tr-TR')} km</span>
                  {record.notes && <span className="truncate italic">"{record.notes}"</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
