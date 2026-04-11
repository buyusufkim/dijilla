import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CloudRain, 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Info 
} from "lucide-react";
import { Notification } from "@/context/NotificationContext";

interface DashboardHeaderProps {
  displayName: string;
  unreadCount: number;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  notificationRef: React.RefObject<HTMLDivElement | null>;
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  navigate: (path: string) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  displayName,
  unreadCount,
  showNotifications,
  setShowNotifications,
  notificationRef,
  notifications,
  markAsRead,
  markAllAsRead,
  navigate,
}) => {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 relative">
      <div className="w-full sm:w-auto">
        <h1 className="text-xl sm:text-2xl sm:text-3xl font-bold text-white/90 truncate">
          Günaydın {displayName},
        </h1>
        <div className="flex items-center gap-2 mt-2 text-white/60">
          <CloudRain className="w-4 h-4 sm:w-5 sm:h-5 text-[#00E5FF] shrink-0" />
          <span className="text-xs sm:text-sm sm:text-base">
            Yollar bugün açık, hafif yağmurlu.
          </span>
        </div>
      </div>
      
      <div className="relative self-end sm:self-auto" ref={notificationRef}>
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-3 bg-[#1A233A] rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
        >
          <Bell className="w-6 h-6 text-white/80" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-5 h-5 bg-[#FF3D00] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#1A233A] animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 md:w-96 bg-[#1A233A] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#0A1128]/50">
                <h4 className="font-bold">Bildirimler</h4>
                <button 
                  onClick={markAllAsRead}
                  className="text-xs text-[#00E5FF] hover:underline"
                >
                  Tümünü okundu işaretle
                </button>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        if (n.link) navigate(n.link);
                        setShowNotifications(false);
                      }}
                      className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer relative ${!n.read ? 'bg-[#00E5FF]/5' : ''}`}
                    >
                      {!n.read && (
                        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#00E5FF] rounded-full"></div>
                      )}
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          n.type === 'warning' ? 'bg-[#FF3D00]/10 text-[#FF3D00]' :
                          n.type === 'success' ? 'bg-[#00E676]/10 text-[#00E676]' :
                          'bg-[#00E5FF]/10 text-[#00E5FF]'
                        }`}>
                          {n.type === 'warning' ? <AlertTriangle className="w-5 h-5" /> :
                           n.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                           <Info className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${!n.read ? 'text-white' : 'text-white/70'}`}>{n.title}</p>
                          <p className="text-xs text-white/50 mt-1 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-white/30 mt-2">
                            {(() => {
                              const diffInHours = Math.round((n.date.getTime() - Date.now()) / (1000 * 60 * 60));
                              if (Math.abs(diffInHours) < 1) return "Az önce";
                              if (Math.abs(diffInHours) < 24) {
                                return new Intl.RelativeTimeFormat('tr', { numeric: 'auto' }).format(diffInHours, 'hour');
                              }
                              return new Intl.RelativeTimeFormat('tr', { numeric: 'auto' }).format(Math.round(diffInHours / 24), 'day');
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-white/40">
                    Bildirim bulunmuyor.
                  </div>
                )}
              </div>
              <div className="p-3 text-center bg-[#0A1128]/50 border-t border-white/10">
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-white/40 hover:text-white"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
