import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Wrench, X } from "lucide-react";
import { Notification } from "@/context/NotificationContext";

interface AlertBannersProps {
  criticalNotification: Notification | undefined;
  upcomingMaintenance: any;
  markAsRead: (id: string) => void;
  navigate: (path: string) => void;
}

export const AlertBanners: React.FC<AlertBannersProps> = ({
  criticalNotification,
  upcomingMaintenance,
  markAsRead,
  navigate,
}) => {
  return (
    <>
      <AnimatePresence>
        {criticalNotification && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[#FF3D00]/20 to-red-900/20 border border-[#FF3D00]/30 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FF3D00]/20 flex items-center justify-center border border-[#FF3D00]/30 shrink-0">
                  <AlertTriangle className="w-6 h-6 text-[#FF3D00]" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Önemli Hatırlatma</h4>
                  <p className="text-sm text-white/70">{criticalNotification.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate('/insurance')}
                  className="px-4 py-2 bg-[#FF3D00] text-white text-xs font-bold rounded-lg hover:bg-[#FF3D00]/90 transition-all whitespace-nowrap"
                >
                  Yenile
                </button>
                <button 
                  onClick={() => markAsRead(criticalNotification.id)}
                  className="p-2 text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {upcomingMaintenance && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="bg-gradient-to-r from-[#00E676]/20 to-green-900/20 border border-[#00E676]/30 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#00E676]/20 flex items-center justify-center border border-[#00E676]/30 shrink-0">
                  <Wrench className="w-6 h-6 text-[#00E676]" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Yaklaşan Bakım</h4>
                  <p className="text-sm text-white/70">
                    {upcomingMaintenance.service_type} randevunuz yaklaşıyor: {new Date(upcomingMaintenance.appointment_date).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate('/maintenance')}
                  className="px-4 py-2 bg-[#00E676] text-[#0A1128] text-xs font-bold rounded-lg hover:bg-[#00E676]/90 transition-all whitespace-nowrap"
                >
                  Detaylar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
