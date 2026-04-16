import { useNavigate } from "react-router-dom";
import { useFamily } from "@/context/FamilyContext";
import { useNotifications } from "@/context/NotificationContext";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/supabase-service";

import { DashboardHeader } from "@/components/home/DashboardHeader";
import { AlertBanners } from "@/components/home/AlertBanners";
import { ManagementFeatures } from "@/components/home/ManagementFeatures";
import { AssetsGrid } from "@/components/home/AssetsGrid";
import { QuickActions } from "@/components/home/QuickActions";
import { AIAssistantTeaser } from "@/components/home/AIAssistantTeaser";

export default function Home() {
  const { activeMember, loading: familyLoading } = useFamily();
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
        const { data } = await db.from("profiles").select("*");
        const userProfile = data?.find((p: any) => p.id === user.id || p.id === user.uid);
        if (userProfile) {
          setProfile(userProfile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();

    // Subscribe to Vehicles
    const unsubscribeVehicles = db.from("vehicles").subscribe((data) => {
      const filtered = data.filter((v: any) => v.user_id === (user.id || user.uid));
      // Sort by created_at desc
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setVehicles(filtered);
      setLoadingVehicles(false);
    });

    // Subscribe to Maintenance Appointments
    const unsubscribeMA = db.from("appointments").subscribe((data) => {
      const filtered = data.filter((a: any) => 
        a.user_id === (user.id || user.uid) && 
        a.status === "scheduled"
      );
      // Sort by appointment_date asc
      filtered.sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
      setMaintenanceAppointments(filtered);
    });

    return () => {
      unsubscribeVehicles();
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
  
  const displayName = familyLoading
    ? "Yükleniyor..."
    : profile?.full_name?.split(" ")[0] ||
      user?.displayName?.split(" ")[0] ||
      user?.email?.split("@")[0] ||
      activeMember?.name?.split(" ")[0] ||
      "Sürücü";
  
  return (
    <div className="flex flex-col gap-8 pb-12 w-full overflow-x-hidden">
      <DashboardHeader 
        displayName={displayName}
        unreadCount={unreadCount}
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
        notificationRef={notificationRef}
        notifications={notifications}
        markAsRead={markAsRead}
        markAllAsRead={markAllAsRead}
        navigate={navigate}
      />

      <AlertBanners 
        criticalNotification={criticalNotification}
        upcomingMaintenance={upcomingMaintenance}
        markAsRead={markAsRead}
        navigate={navigate}
      />

      <ManagementFeatures navigate={navigate} />

      <AssetsGrid 
        displayName={displayName}
        loadingVehicles={loadingVehicles}
        vehicles={vehicles}
        navigate={navigate}
      />

      <QuickActions navigate={navigate} />

      <AIAssistantTeaser navigate={navigate} />
    </div>
  );
}
