import { useNavigate } from "react-router-dom";
import { useFamily } from "@/context/FamilyContext";
import { useNotifications } from "@/context/NotificationContext";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/supabase-service";
import { supabase } from "@/supabase";

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
        const { data } = await db.from("profiles").select("*").eq("id", user.id).maybeSingle();
        if (data) setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();

    // Fetch Vehicles
    const fetchVehicles = async () => {
      const { data } = await db.from("vehicles").select("*").eq("user_id", user.id).order('created_at', { ascending: false });
      if (data) setVehicles(data);
      setLoadingVehicles(false);
    };
    fetchVehicles();

    // Fetch Appointments
    const fetchAppointments = async () => {
      const { data } = await db.from("appointments").select("*").eq("user_id", user.id).eq("status", "scheduled").order('appointment_date', { ascending: true });
      if (data) setMaintenanceAppointments(data);
    };
    fetchAppointments();

    // Subscribe to changes
    const vehicleSubscription = supabase
      .channel('home_vehicles')
      .on("postgres_changes", { event: "*", schema: "public", table: "vehicles", filter: `user_id=eq.${user.id}` }, fetchVehicles)
      .subscribe();
      
    const appointmentSubscription = supabase
      .channel('home_appointments')
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments", filter: `user_id=eq.${user.id}` }, fetchAppointments)
      .subscribe();

    return () => {
      supabase.removeChannel(vehicleSubscription);
      supabase.removeChannel(appointmentSubscription);
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
  
  const displayName = profile?.full_name?.split(" ")[0] ||
      user?.user_metadata?.full_name?.split(" ")[0] ||
      user?.email?.split("@")[0] ||
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
