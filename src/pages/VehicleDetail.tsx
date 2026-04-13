import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { db } from "@/firebase";
import { collection, query, where, onSnapshot, orderBy, doc, getDoc, addDoc, deleteDoc } from "@/firebase";
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
        const docRef = doc(db, "vehicles", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setVehicle({ id: docSnap.id, ...docSnap.data() } as Vehicle);
        } else {
          // Fallback to query if getDoc fails in adapter
          const q = query(collection(db, "vehicles"), where("id", "==", id));
          const unsubscribe = onSnapshot(q, (snapshot: any) => {
            if (!snapshot.empty) {
              setVehicle({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Vehicle);
            }
          });
          return () => unsubscribe();
        }
      } catch (error) {
        console.error("Araç bilgileri alınırken hata:", error);
      }
    };

    fetchVehicle();

    // Fetch maintenance records
    const qMaintenance = query(
      collection(db, "maintenance_records"),
      where("vehicle_id", "==", id),
      orderBy("date", "asc")
    );

    const unsubscribeMaintenance = onSnapshot(qMaintenance, (snapshot: any) => {
      const records = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as MaintenanceRecord[];
      setMaintenanceRecords(records);
      setLoading(false);
    }, (error: any) => {
      console.error("Bakım kayıtları alınırken hata:", error);
      setLoading(false);
    });

    // Fetch appointments
    const qAppointments = query(
      collection(db, "appointments"),
      where("vehicle_id", "==", id),
      where("status", "==", "scheduled"),
      orderBy("appointment_date", "asc")
    );

    const unsubscribeAppointments = onSnapshot(qAppointments, (snapshot: any) => {
      const appointmentData = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(appointmentData);
    });

    // Fetch reminders
    const qReminders = query(
      collection(db, "reminders"),
      where("vehicle_id", "==", id),
      orderBy("date", "asc")
    );

    const unsubscribeReminders = onSnapshot(qReminders, (snapshot: any) => {
      const reminderData = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as Reminder[];
      setReminders(reminderData);
    });

    return () => {
      unsubscribeMaintenance();
      unsubscribeAppointments();
      unsubscribeReminders();
    };
  }, [user, id]);

  const handleAddCustomReminder = async () => {
    if (!user || !id || !newReminderTitle || !newReminderDate) return;

    try {
      await addDoc(collection(db, "reminders"), {
        title: newReminderTitle,
        date: newReminderDate,
        vehicle_id: id,
        user_id: user.uid,
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
      await deleteDoc(doc(db, "reminders", reminderId));
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

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">Araç bulunamadı.</p>
        <Button onClick={() => navigate(-1)} className="mt-4" variant="outline">Geri Dön</Button>
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

  const riskAnalysis = calculateRisk({
    ...vehicle,
    last_maintenance_date: pastMaintenances[0]?.date
  });

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

      <VehicleInfoCard vehicle={vehicle} />

      <RiskReport riskAnalysis={riskAnalysis} />

      <MaintenanceRecommendations recommendations={riskAnalysis.maintenanceRecommendations} />

      <ProductOffers offers={riskAnalysis.recommendedProducts} />

      <CostAnalysisChart data={chartData} />

      <VehicleStatusCards vehicle={vehicle} onSetReminder={handleSetReminder} />

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
