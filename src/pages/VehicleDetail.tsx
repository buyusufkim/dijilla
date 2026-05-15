import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Loader2,
  ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { db } from "@/lib/supabase-service";
import { supabase } from "@/supabase";
import { calculateRisk } from "@/lib/risk-engine";

import { Vehicle, MaintenanceRecord, Appointment, Reminder } from "@/components/vehicle-detail/types";
import { VehicleInfoCard } from "@/components/vehicle-detail/VehicleInfoCard";
import { RiskReport } from "@/components/vehicle-detail/RiskReport";
import { MaintenanceRecommendations } from "@/components/vehicle-detail/MaintenanceRecommendations";
import { ProductOffers } from "@/components/vehicle-detail/ProductOffers";
import { CostAnalysisChart } from "@/components/vehicle-detail/CostAnalysisChart";
import { VehicleStatusCards } from "@/components/vehicle-detail/VehicleStatusCards";
import { CustomReminders } from "@/components/vehicle-detail/CustomReminders";
import { UpcomingAppointments } from "@/components/vehicle-detail/UpcomingAppointments";
import { MaintenanceHistory } from "@/components/vehicle-detail/MaintenanceHistory";

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [newReminderDate, setNewReminderDate] = useState("");

  useEffect(() => {
    if (!user || !id) return;

    // Fetch vehicle details
    const fetchVehicle = async () => {
      try {
        const { data, error } = await db.from("vehicles").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
        if (error) {
          console.error("Araç bilgileri alınırken DB hatası:", error);
          setLoading(false);
          return;
        }

        if (data) {
          setVehicle(data as Vehicle);
        } else {
          setVehicle(null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Araç bilgileri alınırken catch hatası:", error);
        setLoading(false);
      }
    };
    fetchVehicle();

    // Fetch and Subscribe logic
    const fetchMaintenance = async () => {
      const { data } = await db.from("maintenance_records").select("*").eq("vehicle_id", id).eq("user_id", user.id).order('date', { ascending: true });
      if (data) setMaintenanceRecords(data as MaintenanceRecord[]);
      setLoading(false);
    };
    fetchMaintenance();

    const fetchAppointments = async () => {
      const { data } = await db.from("appointments").select("*").eq("vehicle_id", id).eq("user_id", user.id).eq("status", "scheduled").order('appointment_date', { ascending: true });
      if (data) setAppointments(data as Appointment[]);
    };
    fetchAppointments();

    const fetchReminders = async () => {
      const { data } = await db.from("reminders").select("*").eq("vehicle_id", id).eq("user_id", user.id).order('date', { ascending: true });
      if (data) setReminders(data as Reminder[]);
    };
    fetchReminders();

    const mSub = supabase.channel(`vehicle_${id}_maintenance`).on("postgres_changes", { event: "*", schema: "public", table: "maintenance_records", filter: `vehicle_id=eq.${id}` }, fetchMaintenance).subscribe();
    const aSub = supabase.channel(`vehicle_${id}_appointments`).on("postgres_changes", { event: "*", schema: "public", table: "appointments", filter: `vehicle_id=eq.${id}` }, fetchAppointments).subscribe();
    const rSub = supabase.channel(`vehicle_${id}_reminders`).on("postgres_changes", { event: "*", schema: "public", table: "reminders", filter: `vehicle_id=eq.${id}` }, fetchReminders).subscribe();

    return () => {
      supabase.removeChannel(mSub);
      supabase.removeChannel(aSub);
      supabase.removeChannel(rSub);
    };
  }, [user, id]);

  const handleAddCustomReminder = async () => {
    if (!user || !id || !newReminderTitle || !newReminderDate) return;

    try {
      await db.from("reminders").insert({
        title: newReminderTitle,
        date: newReminderDate,
        vehicle_id: id,
        user_id: user.id,
        completed: false,
        created_at: new Date().toISOString()
      });

      addNotification({
        title: "Hatırlatıcı Eklendi",
        message: `${newReminderTitle} için hatırlatıcı oluşturuldu.`,
        type: "success"
      });

      setNewReminderTitle("");
      setNewReminderDate("");
      setIsAddingReminder(false);
    } catch (error) {
      console.error("Hatırlatıcı eklenirken hata:", error);
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      await db.from("reminders").delete().eq("id", reminderId);
      addNotification({
        title: "Hatırlatıcı Silindi",
        message: "Hatırlatıcı başarıyla kaldırıldı.",
        type: "info"
      });
    } catch (error) {
      console.error("Hatırlatıcı silinirken hata:", error);
    }
  };

  const handleSetReminder = () => {
    if (!vehicle) return;
    
    addNotification({
      title: "Muayene Hatırlatıcısı Kuruldu",
      message: `${vehicle.plate} plakalı aracınızın muayenesi için hatırlatıcı ayarlandı.`,
      type: "info"
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#00E5FF]" />
      </div>
    );
  }

  if (!vehicle && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Yetkisiz Erişim veya Araç Bulunamadı</h2>
          <p className="text-white/40 text-sm mt-2 max-w-xs mx-auto">Bu aracı görmeye yetkiniz olmayabilir veya araç sistemde kayıtlı olmayabilir.</p>
        </div>
        <Button onClick={() => navigate(-1)} variant="outline" className="border-white/10 rounded-xl px-8 h-12">
          Geri Dön
        </Button>
      </div>
    );
  }

  const pastMaintenances = maintenanceRecords
    .filter(r => {
      const recordDate = new Date(r.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return recordDate < today;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const riskAnalysis = vehicle ? calculateRisk({
    ...vehicle,
    year: vehicle.year || new Date().getFullYear(),
    insurance_expiry: vehicle.insurance_expiry || "",
    inspection_expiry: vehicle.inspection_expiry || "",
    last_maintenance_date: pastMaintenances[0]?.date
  } as any) : { 
    riskLevel: "low", 
    riskScore: 0, 
    riskFactors: [], 
    maintenanceRecommendations: [], 
    recommendedProducts: [],
    healthScore: 100,
    predictedMaintenanceCost: 0,
    predictedIssues: [],
    triggers: [],
    salesBlock: null
  };

  const chartData = maintenanceRecords
    .filter(r => !r.is_appointment)
    .map(record => ({
      date: new Date(record.date).toLocaleDateString('tr-TR', { month: 'short', year: '2-digit' }),
      cost: record.cost,
      fullDate: new Date(record.date).toLocaleDateString('tr-TR')
    }));

  const upcomingAppointments = appointments.filter(r => {
    const recordDate = new Date(r.appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return recordDate >= today;
  });

  return (
    <div className="space-y-6 pb-24 w-full overflow-x-hidden">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">Araç Detayı</h1>
        </div>
        <Button 
          onClick={() => navigate(`/protection/${id}`)}
          className="w-full sm:w-auto bg-gradient-to-r from-[#FF3D00] to-[#FF6D00] text-white font-bold gap-2 shadow-lg shadow-[#FF3D00]/20 h-12 sm:h-10"
        >
          <ShieldCheck className="w-4 h-4" />
          Koruma Paneli
        </Button>
      </header>

      <VehicleInfoCard vehicle={vehicle as any} />

      {vehicle && (
        <>
          <RiskReport riskAnalysis={riskAnalysis as any} />

          <MaintenanceRecommendations recommendations={riskAnalysis.maintenanceRecommendations as any} />

          <ProductOffers offers={riskAnalysis.recommendedProducts as any} />

          <CostAnalysisChart data={chartData as any} />

          <VehicleStatusCards vehicle={vehicle as any} onSetReminder={handleSetReminder} />
        </>
      )}

      <CustomReminders 
        reminders={reminders}
        isAddingReminder={isAddingReminder}
        setIsAddingReminder={setIsAddingReminder}
        newReminderTitle={newReminderTitle}
        setNewReminderTitle={setNewReminderTitle}
        newReminderDate={newReminderDate}
        setNewReminderDate={setNewReminderDate}
        onAddReminder={handleAddCustomReminder}
        onDeleteReminder={handleDeleteReminder}
      />

      <UpcomingAppointments 
        appointments={upcomingAppointments} 
        onNavigateToMaintenance={() => navigate('/maintenance')} 
      />

      <MaintenanceHistory 
        records={pastMaintenances} 
        onNavigateToMaintenance={() => navigate('/maintenance')} 
      />
    </div>
  );
}
