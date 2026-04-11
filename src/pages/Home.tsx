import { useNavigate } from "react-router-dom";
import { useFamily } from "@/context/FamilyContext";
import { useNotifications } from "@/context/NotificationContext";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot, doc, getDoc, orderBy } from "@/firebase";

import { DashboardHeader } from "@/components/home/DashboardHeader";
import { AlertBanners } from "@/components/home/AlertBanners";
import { ManagementFeatures } from "@/components/home/ManagementFeatures";
import { AssetsGrid } from "@/components/home/AssetsGrid";
import { QuickActions } from "@/components/home/QuickActions";
import { AIAssistantTeaser } from "@/components/home/AIAssistantTeaser";

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
