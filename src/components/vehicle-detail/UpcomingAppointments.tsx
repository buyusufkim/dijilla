import React from "react";
import { Calendar, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Appointment } from "./types";

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
  onNavigateToMaintenance: () => void;
}

export const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({
  appointments,
  onNavigateToMaintenance
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Calendar className="w-5 h-5 text-[#00E5FF]" />
        Gelecek Bakımlar & Randevular
      </h3>
      
      {appointments.length === 0 ? (
        <Card className="bg-[#1A233A] border-white/10">
          <CardContent className="p-6 text-center">
            <p className="text-white/40 text-sm">Yakın zamanda planlanmış randevu bulunmuyor.</p>
            <Button 
              onClick={onNavigateToMaintenance}
              variant="link" 
              className="text-[#00E5FF] mt-2"
            >
              Randevu Oluştur
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <Card key={appointment.id} className="bg-[#1A233A] border-[#00E5FF]/20 border-l-4 border-l-[#00E5FF]">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-[#00E5FF]" />
                    </div>
                    <div>
                      <p className="font-semibold">{appointment.service_type}</p>
                      <p className="text-sm text-[#00E5FF]">{new Date(appointment.appointment_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/40">Konum</p>
                    <p className="text-sm font-medium">{appointment.location}</p>
                  </div>
                </div>
                {appointment.notes && (
                  <p className="text-xs text-white/40 mt-3 p-2 bg-white/5 rounded-lg italic">
                    "{appointment.notes}"
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
