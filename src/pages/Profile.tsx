import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  User as UserIcon,
  Award,
  Plus,
  Trash2,
  X,
  Bell,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFamily } from "@/context/FamilyContext";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "@/firebase";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { members, activeMember, addMember } = useFamily();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"spouse" | "child" | "parent">("child");
  const [profile, setProfile] = useState<any>(null);
  const [notificationSettings, setNotificationSettings] = useState({
    insurance_expiry: true,
    inspection_reminders: true,
    service_alerts: true,
  });

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "profiles", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data);
          if (data.notification_settings) {
            setNotificationSettings(data.notification_settings);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [user]);

  const toggleNotification = async (key: string) => {
    if (!user) return;
    const currentVal = notificationSettings[key as keyof typeof notificationSettings];
    const newSettings = {
      ...notificationSettings,
      [key]: !currentVal,
    };
    
    // Optimistic update
    setNotificationSettings(newSettings);
    
    try {
      const docRef = doc(db, "profiles", user.uid);
      await updateDoc(docRef, {
        notification_settings: newSettings
      });
    } catch (error) {
      console.error("Error updating notification settings:", error);
      // Revert state on error
      setNotificationSettings(notificationSettings);
    }
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    
    const colors = [
      "from-orange-500 to-red-500",
      "from-yellow-400 to-orange-500",
      "from-cyan-400 to-blue-500",
      "from-indigo-500 to-purple-500"
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    addMember({
      id: Date.now().toString(),
      name: newMemberName,
      role: newMemberRole,
      avatarColor: randomColor,
    });
    
    setNewMemberName("");
    setIsAddingMember(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = profile?.full_name || user?.displayName || user?.email?.split("@")[0];

  return (
    <div className="flex flex-col gap-8 pb-12 relative w-full overflow-x-hidden">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Ailem & Profil
          </h1>
          <p className="text-white/60 text-sm sm:text-base">
            Kendi profilinizi ve aile üyelerinizi yönetin.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Family Members */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#1A233A] border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">Aile Üyeleri</CardTitle>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setIsAddingMember(true)}>
                <Plus className="w-4 h-4" /> Yeni Ekle
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {/* Current User */}
              <div className="flex items-center justify-between p-4 bg-[#0A1128] rounded-2xl border border-[#00E5FF]/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#00E676] flex items-center justify-center shadow-lg">
                    <UserIcon className="w-6 h-6 text-[#0A1128]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{displayName}</h3>
                    <p className="text-sm text-[#00E5FF] font-medium">Kendim</p>
                  </div>
                </div>
              </div>

              {members.filter(m => m.role !== 'self').map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-[#0A1128] rounded-2xl border border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${member.avatarColor} flex items-center justify-center shadow-lg`}
                    >
                      <UserIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{member.name}</h3>
                      <p className="text-sm text-white/50 capitalize">
                        {member.role === "spouse"
                          ? "Eşim"
                          : member.role === "child"
                            ? "Çocuğum"
                            : "Ebeveynim"}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 text-white/40 hover:text-[#FF3D00] transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-[#1A233A] border-white/10">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#00E5FF]" />
                Bildirim Ayarları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotificationToggle
                label="Sigorta Vadesi Hatırlatıcıları"
                description="Poliçe bitiş tarihinden önce bildirim alın."
                isActive={notificationSettings.insurance_expiry}
                onToggle={() => toggleNotification("insurance_expiry")}
              />
              <NotificationToggle
                label="Muayene Hatırlatıcıları"
                description="Araç muayene tarihlerini kaçırmayın."
                isActive={notificationSettings.inspection_reminders}
                onToggle={() => toggleNotification("inspection_reminders")}
              />
              <NotificationToggle
                label="Servis Uyarıları"
                description="Bakım ve servis zamanları hakkında bilgi alın."
                isActive={notificationSettings.service_alerts}
                onToggle={() => toggleNotification("service_alerts")}
              />
            </CardContent>
          </Card>

          {/* Gamification Wallet */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-r from-[#00E676]/20 to-[#00E5FF]/20 border border-white/10 overflow-hidden relative">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              <CardContent className="p-8 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#00E676]" />
                    Aile Sadakat Puanı
                  </p>
                  <h3 className="text-4xl font-bold tracking-tight">
                    {(profile?.points || 0).toLocaleString("tr-TR")}{" "}
                    <span className="text-xl text-white/50 font-normal">
                      PT
                    </span>
                  </h3>
                </div>
                <Button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md px-8">
                  Puanları Kullan
                </Button>
              </CardContent>
            </Card>
          </motion.section>
        </div>

        {/* Right Column: Settings */}
        <div className="space-y-4">
          <Card className="bg-[#1A233A] border-white/10">
            <CardHeader>
              <CardTitle className="text-lg">Hesap Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <MenuItem
                icon={CreditCard}
                label="Ödeme Yöntemleri"
                color="text-[#00E5FF]"
              />
              <MenuItem
                icon={Settings}
                label="Uygulama Ayarları"
                color="text-white/80"
              />
              <MenuItem
                icon={HelpCircle}
                label="Destek & SSS"
                color="text-white/80"
              />
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center justify-between p-4 bg-[#0A1128] rounded-xl border border-white/5 hover:border-red-500/30 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-[#FF3D00]" />
                  </div>
                  <span className="font-medium text-white/90">Çıkış Yap</span>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Member Modal */}
      <AnimatePresence>
        {isAddingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
            >
              <Card className="bg-[#1A233A] border-white/10 shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
                  <CardTitle>Yeni Aile Üyesi Ekle</CardTitle>
                  <button 
                    onClick={() => setIsAddingMember(false)}
                    className="p-1 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Ad Soyad</label>
                    <input
                      type="text"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      placeholder="Örn: Ali Yılmaz"
                      className="w-full bg-[#0A1128] border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Yakınlık Derecesi</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["spouse", "child", "parent"] as const).map((role) => (
                        <button
                          key={role}
                          onClick={() => setNewMemberRole(role)}
                          className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                            newMemberRole === role
                              ? "bg-[#00E5FF]/20 border-[#00E5FF]/50 text-[#00E5FF]"
                              : "bg-[#0A1128] border-white/10 text-white/60 hover:bg-white/5"
                          }`}
                        >
                          {role === "spouse" ? "Eş" : role === "child" ? "Çocuk" : "Ebeveyn"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button 
                    onClick={handleAddMember}
                    disabled={!newMemberName.trim()}
                    className="w-full mt-4 bg-[#00E5FF] hover:bg-[#00B8D4] text-[#0A1128] font-bold"
                  >
                    Kaydet
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationToggle({ label, description, isActive, onToggle }: any) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-[#0A1128] rounded-2xl border border-white/5">
      <div className="space-y-1 flex-1">
        <h4 className="font-medium text-white/90">{label}</h4>
        <p className="text-xs text-white/50">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${
          isActive ? "bg-[#00E5FF]" : "bg-white/10"
        }`}
      >
        <motion.div
          animate={{ x: isActive ? 26 : 2 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

function MenuItem({ icon: Icon, label, color, hideArrow }: any) {
  return (
    <button className="w-full flex items-center justify-between p-4 bg-[#0A1128] rounded-xl border border-white/5 hover:border-white/20 transition-all active:scale-[0.98]">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <span className="font-medium text-white/90">{label}</span>
      </div>
      {!hideArrow && <ChevronRight className="w-5 h-5 text-white/30" />}
    </button>
  );
}
