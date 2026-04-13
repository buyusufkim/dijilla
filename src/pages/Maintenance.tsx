import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  orderBy,
} from "@/firebase";
import { format } from "date-fns";
import { aiService } from "@/services/aiService";

import { MaintenanceHeader } from "@/components/maintenance/MaintenanceHeader";
import { EmptyVehicleState } from "@/components/maintenance/EmptyVehicleState";
import { 
  RecommendationsSection, 
  AppointmentsSection, 
  RecordsSection, 
  QuickStats 
} from "@/components/maintenance/MaintenanceSections";
import { 
  AddRecordModal, 
  AddAppointmentModal 
} from "@/components/maintenance/MaintenanceModals";
import { Vehicle, MaintenanceRecord, MaintenanceAppointment, Recommendation } from "@/components/maintenance/types";

export default function Maintenance() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [appointments, setAppointments] = useState<MaintenanceAppointment[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);

  // Form states
  const [recordForm, setRecordForm] = useState({
    service_type: "",
    mileage: "",
    date: format(new Date(), "yyyy-MM-dd"),
    cost: "",
    notes: "",
  });

  const [appointmentForm, setAppointmentForm] = useState({
    service_type: "",
    appointment_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    location: "",
  });

  useEffect(() => {
    if (!user) return;

    // Fetch vehicles
    const vQuery = query(collection(db, "vehicles"), where("user_id", "==", user.uid));
    const unsubscribeVehicles = onSnapshot(vQuery, (snapshot: any) => {
      const vList = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as Vehicle[];
      setVehicles(vList);
      if (vList.length > 0 && !selectedVehicle) {
        setSelectedVehicle(vList[0]);
      }
    });

    return () => unsubscribeVehicles();
  }, [user]);

  useEffect(() => {
    if (!user || !selectedVehicle) return;

    // Fetch records
    const rQuery = query(
      collection(db, "maintenance_records"),
      where("vehicle_id", "==", selectedVehicle.id),
      orderBy("date", "desc")
    );
    const unsubscribeRecords = onSnapshot(rQuery, (snapshot: any) => {
      setRecords(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as MaintenanceRecord[]);
    });

    // Fetch appointments
    const aQuery = query(
      collection(db, "appointments"),
      where("vehicle_id", "==", selectedVehicle.id),
      where("status", "==", "scheduled"),
      orderBy("appointment_date", "asc")
    );
    const unsubscribeAppointments = onSnapshot(aQuery, (snapshot: any) => {
      setAppointments(snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as MaintenanceAppointment[]);
    });

    // Get AI Recommendations
    fetchRecommendations(selectedVehicle);

    return () => {
      unsubscribeRecords();
      unsubscribeAppointments();
    };
  }, [user, selectedVehicle]);

  const fetchRecommendations = async (vehicle: Vehicle) => {
    setIsLoadingRecs(true);
    try {
      const prompt = `Provide a standard maintenance schedule for a ${vehicle.year} ${vehicle.brand_model}. 
      List the top 4 most important maintenance items (e.g., Oil Change, Brake Inspection, Timing Belt, etc.) 
      with their recommended intervals in kilometers and months. 
      Return the result as a JSON array of objects with keys: "service", "interval_km", "interval_months", "description".
      Language: Turkish.`;

      const responseText = await aiService.generateMaintenanceRecommendations(prompt);
      const data = JSON.parse(responseText || "[]");
      setRecommendations(data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      // Fallback
      setRecommendations([
        { service: "Yağ Değişimi", interval_km: 10000, interval_months: 12, description: "Motor ömrü için kritik." },
        { service: "Fren Kontrolü", interval_km: 20000, interval_months: 24, description: "Güvenli sürüş için." },
      ]);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  const handleAddRecord = async () => {
    if (!user || !selectedVehicle) return;
    try {
      await addDoc(collection(db, "maintenance_records"), {
        ...recordForm,
        user_id: user.uid,
        vehicle_id: selectedVehicle.id,
        mileage: Number(recordForm.mileage),
        cost: Number(recordForm.cost),
        created_at: serverTimestamp(),
      });
      setIsAddingRecord(false);
      setRecordForm({
        service_type: "",
        mileage: "",
        date: format(new Date(), "yyyy-MM-dd"),
        cost: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error adding record:", error);
    }
  };

  const handleAddAppointment = async () => {
    if (!user || !selectedVehicle) return;
    try {
      await addDoc(collection(db, "appointments"), {
        ...appointmentForm,
        user_id: user.uid,
        vehicle_id: selectedVehicle.id,
        status: "scheduled",
        created_at: serverTimestamp(),
      });
      setIsAddingAppointment(false);
      setAppointmentForm({
        service_type: "",
        appointment_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        location: "",
      });
    } catch (error) {
      console.error("Error adding appointment:", error);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <MaintenanceHeader 
        vehicles={vehicles} 
        selectedVehicle={selectedVehicle} 
        setSelectedVehicle={setSelectedVehicle} 
      />

      {!selectedVehicle ? (
        <EmptyVehicleState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Recommendations & Appointments */}
          <div className="lg:col-span-2 space-y-8">
            <RecommendationsSection 
              recommendations={recommendations} 
              isLoadingRecs={isLoadingRecs} 
            />

            <AppointmentsSection 
              appointments={appointments} 
              onAddAppointment={() => setIsAddingAppointment(true)} 
            />

            <RecordsSection 
              records={records} 
              onAddRecord={() => setIsAddingRecord(true)} 
            />
          </div>

          {/* Right Column: Quick Stats & Tips */}
          <QuickStats 
            records={records} 
            appointments={appointments} 
          />
        </div>
      )}

      <AddRecordModal 
        isOpen={isAddingRecord} 
        onClose={() => setIsAddingRecord(false)} 
        recordForm={recordForm} 
        setRecordForm={setRecordForm} 
        onSave={handleAddRecord} 
      />

      <AddAppointmentModal 
        isOpen={isAddingAppointment} 
        onClose={() => setIsAddingAppointment(false)} 
        appointmentForm={appointmentForm} 
        setAppointmentForm={setAppointmentForm} 
        onSave={handleAddAppointment} 
      />
    </div>
  );
}
