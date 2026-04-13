import React from "react";
import { Wrench, Calendar, History, Plus, AlertCircle, CheckCircle2, Clock, MapPin, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Recommendation, MaintenanceAppointment, MaintenanceRecord } from "./types";

interface RecommendationsSectionProps {
  recommendations: Recommendation[];
  isLoadingRecs: boolean;
}

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({ recommendations, isLoadingRecs }) => (
  <section>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Info className="w-5 h-5 text-[#00E5FF]" />
        Önerilen Bakım Planı
      </h2>
      {isLoadingRecs && <Clock className="w-4 h-4 text-[#00E5FF] animate-spin" />}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {recommendations.map((rec, idx) => (
        <Card key={idx} className="bg-[#1A233A] border-white/10 hover:border-[#00E5FF]/30 transition-all">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-[#00E5FF]" />
              </div>
              <div className="text-right">
                <p className="text-xs text-white/40 uppercase font-bold tracking-wider">Aralık</p>
                <p className="text-[#00E5FF] font-bold">{rec.interval_km.toLocaleString()} KM</p>
              </div>
            </div>
            <h4 className="font-bold text-lg mb-1">{rec.service}</h4>
            <p className="text-sm text-white/50">{rec.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  </section>
);

interface AppointmentsSectionProps {
  appointments: MaintenanceAppointment[];
  onAddAppointment: () => void;
}

export const AppointmentsSection: React.FC<AppointmentsSectionProps> = ({ appointments, onAddAppointment }) => (
  <section>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Calendar className="w-5 h-5 text-[#00E676]" />
        Yaklaşan Randevular
      </h2>
      <Button 
        variant="outline" 
        size="sm" 
        className="border-[#00E676]/30 text-[#00E676] hover:bg-[#00E676]/10"
        onClick={onAddAppointment}
      >
        <Plus className="w-4 h-4 mr-2" /> Randevu Al
      </Button>
    </div>
    {appointments.length === 0 ? (
      <div className="p-8 bg-[#1A233A] rounded-2xl border border-dashed border-white/10 text-center">
        <p className="text-white/40">Planlanmış randevu bulunmuyor.</p>
      </div>
    ) : (
      <div className="space-y-4">
        {appointments.map((app) => (
          <div key={app.id} className="flex items-center justify-between p-5 bg-[#1A233A] rounded-2xl border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00E676]/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#00E676]" />
              </div>
              <div>
                <h4 className="font-bold text-lg">{app.service_type}</h4>
                <div className="flex items-center gap-3 text-sm text-white/50">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(app.appointment_date), "d MMMM yyyy, HH:mm", { locale: tr })}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {app.location}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-[#00E676]/20 text-[#00E676] text-xs font-bold uppercase tracking-wider">
              Onaylandı
            </div>
          </div>
        ))}
      </div>
    )}
  </section>
);

interface RecordsSectionProps {
  records: MaintenanceRecord[];
  onAddRecord: () => void;
}

export const RecordsSection: React.FC<RecordsSectionProps> = ({ records, onAddRecord }) => (
  <section>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <History className="w-5 h-5 text-purple-400" />
        Bakım Geçmişi
      </h2>
      <Button 
        variant="outline" 
        size="sm" 
        className="border-purple-400/30 text-purple-400 hover:bg-purple-400/10"
        onClick={onAddRecord}
      >
        <Plus className="w-4 h-4 mr-2" /> Kayıt Ekle
      </Button>
    </div>
    {records.length === 0 ? (
      <div className="p-8 bg-[#1A233A] rounded-2xl border border-dashed border-white/10 text-center">
        <p className="text-white/40">Henüz bakım kaydı girilmemiş.</p>
      </div>
    ) : (
      <div className="space-y-4">
        {records.map((record) => (
          <div key={record.id} className="p-5 bg-[#1A233A] rounded-2xl border border-white/10 group hover:border-white/20 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-400/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{record.service_type}</h4>
                  <p className="text-sm text-white/50">
                    {format(new Date(record.date), "d MMMM yyyy", { locale: tr })} • {record.mileage.toLocaleString()} KM
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-white">₺{record.cost.toLocaleString()}</p>
                <p className="text-xs text-white/30">Maliyet</p>
              </div>
            </div>
            {record.notes && (
              <div className="mt-4 p-3 bg-[#0A1128] rounded-xl text-sm text-white/60 italic">
                "{record.notes}"
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </section>
);

interface QuickStatsProps {
  records: MaintenanceRecord[];
  appointments: MaintenanceAppointment[];
}

export const QuickStats: React.FC<QuickStatsProps> = ({ records, appointments }) => (
  <div className="space-y-6">
    <Card className="bg-gradient-to-br from-[#00E5FF]/10 to-transparent border-white/10">
      <CardHeader>
        <CardTitle className="text-lg">Durum Özeti</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-[#0A1128] rounded-xl">
          <span className="text-sm text-white/60">Toplam Bakım</span>
          <span className="font-bold">{records.length}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-[#0A1128] rounded-xl">
          <span className="text-sm text-white/60">Toplam Harcama</span>
          <span className="font-bold text-[#00E676]">₺{records.reduce((acc, r) => acc + r.cost, 0).toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-[#0A1128] rounded-xl border border-[#FF3D00]/20">
          <span className="text-sm text-white/60">Sıradaki Randevu</span>
          <span className="font-bold text-[#FF3D00]">
            {appointments.length > 0 
              ? format(new Date(appointments[0].appointment_date), "d MMM", { locale: tr })
              : "Yok"}
          </span>
        </div>
      </CardContent>
    </Card>

    <Card className="bg-[#1A233A] border-white/10">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-400" />
          Bakım İpuçları
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-white/60 space-y-3">
        <p>• Lastik basınçlarını her ay kontrol edin.</p>
        <p>• Motor yağını her 10.000 km'de bir değiştirin.</p>
        <p>• Fren balatalarını her 20.000 km'de bir kontrol ettirin.</p>
        <p>• Silecek sularını kış gelmeden antifrizli olanla değiştirin.</p>
      </CardContent>
    </Card>
  </div>
);
