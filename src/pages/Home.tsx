import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  CloudRain,
  Bell,
  ShieldCheck,
  Wrench,
  Zap,
  ChevronRight,
  Home as HomeIcon,
  HeartPulse,
  X,
  AlertTriangle,
  CheckCircle2,
  Info,
  Fuel,
  Wallet,
  BarChart3,
  FileText,
  Loader2,
  Map
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useFamily } from "@/context/FamilyContext";
import { useNotifications, Notification } from "@/context/NotificationContext";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot, doc, getDoc, orderBy } from "@/firebase";

export default function Home() {
  const { activeMember } = useFamily();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [maintenanceAppointments, setMaintenanceAppointments] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch Profile
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "profiles", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();

    // Subscribe to Vehicles
    const q = query(
      collection(db, "vehicles"),
      where("user_id", "==", user.uid),
      orderBy("created_at", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const vehicleData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVehicles(vehicleData);
      setLoadingVehicles(false);
    }, (error) => {
      console.error("Error fetching vehicles:", error);
      setLoadingVehicles(false);
    });

    // Subscribe to Maintenance Appointments
    const maQuery = query(
      collection(db, "maintenance_appointments"),
      where("user_id", "==", user.uid),
      where("status", "==", "scheduled"),
      orderBy("appointment_date", "asc")
    );

    const unsubscribeMA = onSnapshot(maQuery, (snapshot) => {
      setMaintenanceAppointments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribe();
      unsubscribeMA();
    };
  }, [user]);

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const criticalNotification = notifications.find(n => n.type === "warning" && !n.read);
  const upcomingMaintenance = maintenanceAppointments[0];
  
  const displayName = profile?.full_name?.split(" ")[0] || user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || activeMember.name.split(" ")[0];

  return (
    <div className="flex flex-col gap-8 pb-12 w-full overflow-x-hidden">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 relative">
        <div className="w-full sm:w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white/90 truncate">
            Günaydın {displayName},
          </h1>
          <div className="flex items-center gap-2 mt-2 text-white/60">
            <CloudRain className="w-5 h-5 text-[#00E5FF] shrink-0" />
            <span className="text-sm sm:text-base">
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

          {/* Notifications Dropdown */}
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

      {/* Critical Alert Banner */}
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

      {/* Maintenance Alert Banner */}
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

      {/* Management Features */}
      <section>
        <h3 className="text-lg font-medium text-white/80 mb-6">Araç Yönetimi</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card 
            onClick={() => navigate('/glovebox')}
            className="bg-[#1A233A] border-white/10 hover:border-[#00E5FF]/30 transition-all cursor-pointer group"
          >
            <CardContent className="p-4 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-[#00E5FF]" />
              </div>
              <div>
                <p className="font-bold text-sm">Dijital Torpido</p>
                <p className="text-[10px] text-white/40">Belgelerim</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            onClick={() => navigate('/fuel')}
            className="bg-[#1A233A] border-white/10 hover:border-[#00E5FF]/30 transition-all cursor-pointer group"
          >
            <CardContent className="p-4 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#FFD600]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Fuel className="w-6 h-6 text-[#FFD600]" />
              </div>
              <div>
                <p className="font-bold text-sm">Yakıt & Şarj</p>
                <p className="text-[10px] text-white/40">İstasyon Bul</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            onClick={() => navigate('/expenses')}
            className="bg-[#1A233A] border-white/10 hover:border-[#00E5FF]/30 transition-all cursor-pointer group"
          >
            <CardContent className="p-4 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#00E676]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-[#00E676]" />
              </div>
              <div>
                <p className="font-bold text-sm">Gider Takibi</p>
                <p className="text-[10px] text-white/40">Analiz & Tasarruf</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            onClick={() => navigate('/ai-assistant')}
            className="bg-[#1A233A] border-white/10 hover:border-[#00E5FF]/30 transition-all cursor-pointer group"
          >
            <CardContent className="p-4 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BotIcon className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="font-bold text-sm">AI Teşhis</p>
                <p className="text-[10px] text-white/40">Arıza Analizi</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            onClick={() => navigate('/maintenance')}
            className="bg-[#1A233A] border-white/10 hover:border-[#00E5FF]/30 transition-all cursor-pointer group"
          >
            <CardContent className="p-4 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Wrench className="w-6 h-6 text-[#00E5FF]" />
              </div>
              <div>
                <p className="font-bold text-sm">Bakım Planı</p>
                <p className="text-[10px] text-white/40">Randevu & Takip</p>
              </div>
            </CardContent>
          </Card>

          <Card 
            onClick={() => navigate('/travel-advisor')}
            className="bg-[#1A233A] border-white/10 hover:border-[#00E5FF]/30 transition-all cursor-pointer group"
          >
            <CardContent className="p-4 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#FF3D00]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Map className="w-6 h-6 text-[#FF3D00]" />
              </div>
              <div>
                <p className="font-bold text-sm">Seyahat Danışmanı</p>
                <p className="text-[10px] text-white/40">Rota & İhtiyaçlar</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Assets Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white/80">
            {displayName} Varlıkları & Durumları
          </h3>
        </div>

        {loadingVehicles ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Vehicle Cards */}
            {vehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (index * 0.1) }}
              >
                <Card 
                  className="overflow-hidden border-none bg-gradient-to-br from-[#1A233A] to-[#0A1128] relative h-full cursor-pointer hover:border-[#00E5FF]/30 transition-colors border border-transparent"
                  onClick={() => navigate("/garage")}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/10 rounded-full blur-2xl"></div>
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00E676]/20 text-[#00E676] text-xs font-medium mb-3 border border-[#00E676]/30">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Kasko Aktif
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">
                          {vehicle.plate}
                        </h2>
                        <p className="text-white/50 text-sm mt-1">
                          {vehicle.year} {vehicle.brand_model}
                        </p>
                      </div>
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                        <CarIcon className="w-10 h-10 text-white/80" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-4 mt-auto">
                      <div>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                          Kasko
                        </p>
                        <p className="text-sm font-medium">145 Gün</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                          Muayene
                        </p>
                        <p className="text-sm font-medium text-[#FF3D00]">15 Gün</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                          MTV
                        </p>
                        <p className="text-sm font-medium text-[#00E5FF]">Ödendi</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Home Card (Mock) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card 
                className="overflow-hidden border-none bg-gradient-to-br from-[#1A233A] to-[#0A1128] relative h-full cursor-pointer hover:border-purple-500/30 transition-colors border border-transparent"
                onClick={() => navigate("/garage")}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium mb-3 border border-purple-500/30">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        DASK Aktif
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight">
                        Beşiktaş Ev
                      </h2>
                      <p className="text-white/50 text-sm mt-1">
                        Barbaros Blv. No:145
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                      <HomeIcon className="w-8 h-8 text-white/80" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 mt-auto">
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                        DASK Yenileme
                      </p>
                      <p className="text-sm font-medium">210 Gün</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                        Konut Sigortası
                      </p>
                      <p className="text-sm font-medium text-white/50">
                        Yok - Teklif Al
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Health Card (Mock) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="overflow-hidden border-none bg-gradient-to-br from-[#1A233A] to-[#0A1128] relative h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF3D00]/10 rounded-full blur-2xl"></div>
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FF3D00]/20 text-[#FF3D00] text-xs font-medium mb-3 border border-[#FF3D00]/30">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Poliçe Yok
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight">
                        Sağlık Sigortası
                      </h2>
                      <p className="text-white/50 text-sm mt-1">
                        Tamamlayıcı Sağlık (TSS)
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                      <HeartPulse className="w-8 h-8 text-white/80" />
                    </div>
                  </div>

                  <div className="mt-auto pt-4">
                    <button 
                      onClick={() => navigate("/insurance")}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium border border-white/10 transition-colors"
                    >
                      Hemen Teklif Al
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="mt-4">
        <h3 className="text-lg font-medium text-white/80 mb-6">
          Hızlı İşlemler
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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

      {/* AI Mechanic Teaser */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-4"
      >
        <Card 
          onClick={() => navigate('/ai-assistant')}
          className="bg-gradient-to-r from-[#1A233A] to-[#2A3B5C] border-white/10 cursor-pointer hover:border-white/20 transition-colors"
        >
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-[#00E5FF]/20 flex items-center justify-center border border-[#00E5FF]/30">
                <BotIcon className="w-8 h-8 text-[#00E5FF]" />
              </div>
              <div>
                <h4 className="text-xl font-semibold">Yapay Zeka Asistanı</h4>
                <p className="text-sm text-white/60 mt-1">
                  Arızayı kameradan teşhis et, poliçe detaylarını sor veya
                  anında destek al.
                </p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-white/40" />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, color, bg, onClick }: any) {
  return (
    <button onClick={onClick} className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-4 bg-[#1A233A] rounded-2xl border border-white/5 hover:border-white/20 transition-all active:scale-95 group">
      <div
        className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-xl flex items-center justify-center ${bg} border border-white/5 group-hover:scale-110 transition-transform`}
      >
        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${color}`} strokeWidth={2} />
      </div>
      <span className="font-medium text-sm sm:text-base text-white/90 text-center sm:text-left leading-tight">{label}</span>
    </button>
  );
}

function AlertCircle(props: any) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function CarIcon(props: any) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H9.3a2 2 0 0 0-1.6.8L5 11l-5.16.86a1 1 0 0 0-.84.99V16h3m10 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0m-6 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0" />
    </svg>
  );
}

function BotIcon(props: any) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}
